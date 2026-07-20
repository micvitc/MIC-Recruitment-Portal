"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Press_Start_2P } from "next/font/google";
import { Loader2, AlertTriangle, Send } from "lucide-react";
import TurnstileWidget from "@/components/TurnstileWidget";
import posthog from "posthog-js";
import BackButton from "@/components/BackButton";
import RetroLoader from "@/components/RetroLoader";
import { playRetroSound } from "@/lib/audio";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
});

function RetroBackground({ scale }: { scale: number }) {
  return (
    <div
      className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none select-none"
      style={{
        width: "2865px",
        height: "1024px",
        transform: `scale(${scale})`,
        transformOrigin: "top center",
      }}
    >
      <div className="w-[2865px] h-[1024px] absolute top-0 left-0 bg-[linear-gradient(180deg,#1188EE_0%,#0E8AEA_25%,#1093EB_35%,#1197EC_46%,#16B6F4_52%,#10CBF1_56%,#0FC6F1_60%,#15DEF0_65%,#15DEF0_81%)] overflow-hidden">
        
        {/* Small Clouds */}
        <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[300px] left-[1060px] w-[280px] opacity-85 animate-retro-float pixelated" style={{ animationDelay: "0s" }} />
        <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[140px] left-[-40px] w-[320px] opacity-80 animate-retro-float pixelated" style={{ animationDelay: "1s" }} />
        <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[39px] left-[1167px] w-[360px] opacity-90 animate-retro-float pixelated" style={{ animationDelay: "0.5s" }} />
        <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[220px] left-[400px] w-[200px] opacity-70 animate-retro-float pixelated" style={{ animationDelay: "1.2s" }} />
        <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[180px] left-[1800px] w-[240px] opacity-60 animate-retro-float pixelated" style={{ animationDelay: "0.8s" }} />
        
        {/* Skyline */}
        <img src="/pixel_cloud_large.svg" alt="Skyline" className="absolute top-[566px] left-0 w-[1437px] h-[458px] object-cover opacity-100 pixelated" />
        <img src="/pixel_cloud_large.svg" alt="Skyline" className="absolute top-[566px] left-[1437px] w-[1437px] h-[458px] object-cover opacity-100 pixelated" />
        
        {Array.from({ length: 12 }).map((_, idx) => (
          <img key={idx} src="/city_skyline.svg" alt="Skyline Block" className="absolute top-[631px] w-[246px] h-[249px] opacity-75 pixelated" style={{ left: `${idx * 245}px` }} />
        ))}

        {/* Bushes */}
        <img src="/bushes_pixel.svg" alt="Bushes Left" className="absolute top-[739px] left-0 w-[1456px] h-[200px] z-4 pixelated" />
        <img src="/bushes_pixel.svg" alt="Bushes Right" className="absolute top-[739px] left-[1456px] w-[1456px] h-[200px] z-4 pixelated" />

        {/* Flying Bird near rope */}
        <img src="/flappy_bird.svg" alt="Bird" className="absolute w-[64px] h-[64px] pixelated animate-retro-float z-30" style={{ top: "140px", left: "1850px" }} />

        {/* Ground */}
        <div className="absolute top-[925px] left-0 w-full h-[300px] z-25 flex flex-col">
          <div className="w-full h-5 bg-[#52AE26] border-t-4 border-b-4 border-black flex flex-col justify-between shrink-0">
            <div className="w-full h-[3px] bg-[#72F418]" />
            <div className="w-full h-[3px] bg-[#3FA70E]" />
          </div>
          <div className="w-full flex-grow bg-[#DD9955] border-b-4 border-black pt-3"></div>
        </div>
      </div>
    </div>
  );
}

function InitPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role");

  const [scale, setScale] = useState(1);
  const [showLoader, setShowLoader] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    regNo: "",
    year: "",
    branch: "",
    whyMic: "",
  });

  useEffect(() => {
    if (!role) {
      router.push("/recruitments");
    }
    
    // Auto-fill from Google Account
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/apply/status");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          if (data.user?.name) {
            setFormData(prev => ({ ...prev, fullName: data.user.name }));
          }
        }
      } catch (err) {
        console.error("Failed to load user status");
      }
    };
    fetchStatus();
  }, [role, router]);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        const heightScale = window.innerHeight / 1024;
        const cappedScale = Math.min(heightScale, 1.2);
        setScale(cappedScale);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCaptchaError(false);

    if (!turnstileToken) {
      setCaptchaError(true);
      setError("Please complete the CAPTCHA challenge first.");
      return;
    }

    setSubmitting(true);

    try {
      const verifyRes = await fetch("/api/turnstile/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: turnstileToken }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyData.success) {
        setCaptchaError(true);
        setTurnstileToken(null);
        setError("CAPTCHA verification failed. Please try again.");
        setSubmitting(false);
        return;
      }

      const res = await fetch("/api/apply/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstPreference: role,
          ...formData,
          _trap: "",
        }),
      });
      
      const data = await res.json();

      if (res.ok && data.success) {
        posthog.capture("Init Application Submitted", { role });
        router.push(`/apply/${role}/stage-1`);
      } else {
        setError(data.error ?? "Failed to initialize application.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!role) return null;

  if (showLoader) {
    return <RetroLoader isLoading={false} onComplete={() => setShowLoader(false)} title="LOADING QUEST..." />;
  }

  const base = "w-full bg-white border-[3px] border-[#C85A28] rounded-[8px] px-4 py-3 text-sm text-black font-sans placeholder:text-slate-400 focus:outline-none focus:ring-0 focus:border-black transition-colors";

  return (
    <div className={`${pressStart.variable} font-press-start w-full h-[100dvh] overflow-hidden bg-[#DD9955] relative flex justify-center items-center`}>
      <RetroBackground scale={scale} />

      <BackButton onClick={() => { router.push("/recruitments"); }} />

      <div className="relative z-40 w-full max-w-[1000px] px-4 md:px-16" style={{ marginTop: "40px" }}>
        
        <div className="bg-[#FFE4D6] border-4 border-black rounded-[12px] relative flex flex-col max-h-[85vh]" style={{ boxShadow: "8px 8px 0px 0px rgba(0,0,0,0.5)" }}>
          
          <div className="absolute bottom-[100%] w-3 z-[-1]" style={{ left: "10%", height: "100vh", background: "repeating-linear-gradient(to bottom, #CC8844 0, #CC8844 12px, #A05522 12px, #A05522 16px)", borderLeft: "2px solid #000", borderRight: "2px solid #000" }} />
          <div className="absolute bottom-[100%] w-3 z-[-1]" style={{ right: "10%", height: "100vh", background: "repeating-linear-gradient(to bottom, #CC8844 0, #CC8844 12px, #A05522 12px, #A05522 16px)", borderLeft: "2px solid #000", borderRight: "2px solid #000" }} />

          <div className="bg-[#A05522] w-full h-[60px] shrink-0 border-b-4 border-black rounded-t-[8px] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] [background-size:10px_10px]" />
            <span className="text-black text-[16px] md:text-[20px] font-bold tracking-widest relative z-10 drop-shadow-[1px_1px_0px_#fff] uppercase">
              PLAYER INFO
            </span>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-black rounded-full shadow-[1px_1px_0px_#fff]" />
            <button
              type="button"
              onClick={() => {
                playRetroSound();
                router.push("/recruitments");
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#FF6F61] hover:bg-[#FF8575] active:translate-y-[calc(-50%+2px)] border-4 border-black w-8 h-8 flex items-center justify-center font-bold text-[10px] text-black z-30 cursor-pointer shadow-[2px_2px_0px_#000] transition-all"
            >
              X
            </button>
          </div>

          <div className="p-4 md:p-8 overflow-y-auto custom-scrollbar flex-grow">
            <div className="border-[3px] border-black bg-white p-4 md:p-6 relative">
              
              <div className="absolute top-0 right-0 bg-black text-white px-3 py-1 text-[8px] font-bold uppercase">
                INITIATE QUEST
              </div>

              <form onSubmit={handleSubmit} className="mt-4">
                <input type="text" name="_trap" className="hidden" tabIndex={-1} aria-hidden="true" />

                {error && (
                  <div className="mb-6 p-4 bg-red-100 border-2 border-red-500 rounded-md flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-sans font-bold text-red-700">{error}</p>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Full Name */}
                  <div className="flex flex-col gap-2">
                    <div className="text-[11px] font-bold text-black uppercase leading-snug">
                      Full Name <span className="text-red-500">*</span>
                    </div>
                    <input
                      name="fullName"
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={base}
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="flex flex-col gap-2">
                    <div className="text-[11px] font-bold text-black uppercase leading-snug">
                      Phone Number <span className="text-red-500">*</span>
                    </div>
                    <input
                      name="phone"
                      type="text"
                      required
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={handleChange}
                      className={base}
                    />
                  </div>

                  {/* Reg No */}
                  <div className="flex flex-col gap-2">
                    <div className="text-[11px] font-bold text-black uppercase leading-snug">
                      Registration Number <span className="text-red-500">*</span>
                    </div>
                    <input
                      name="regNo"
                      type="text"
                      required
                      placeholder="e.g. 23BCE1234"
                      value={formData.regNo}
                      onChange={handleChange}
                      className={base}
                    />
                  </div>

                  {/* Year */}
                  <div className="flex flex-col gap-2">
                    <div className="text-[11px] font-bold text-black uppercase leading-snug">
                      Year of Study <span className="text-red-500">*</span>
                    </div>
                    <select
                      name="year"
                      required
                      value={formData.year}
                      onChange={handleChange}
                      className={`${base} cursor-pointer appearance-none`}
                    >
                      <option value="">-- Select --</option>
                      {["1st Year", "2nd Year", "3rd Year", "4th Year"].map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Branch */}
                  <div className="flex flex-col gap-2">
                    <div className="text-[11px] font-bold text-black uppercase leading-snug">
                      Branch / Programme <span className="text-red-500">*</span>
                    </div>
                    <input
                      name="branch"
                      type="text"
                      required
                      placeholder="e.g. B.Tech CSE"
                      value={formData.branch}
                      onChange={handleChange}
                      className={base}
                    />
                  </div>

                  {/* Why MIC */}
                  <div className="flex flex-col gap-2">
                    <div className="text-[11px] font-bold text-black uppercase leading-snug">
                      Why do you want to join MIC? <span className="text-red-500">*</span>
                    </div>
                    <textarea
                      name="whyMic"
                      required
                      placeholder="Tell us what excites you about MIC..."
                      value={formData.whyMic}
                      onChange={handleChange}
                      rows={4}
                      className={`${base} resize-none`}
                    />
                  </div>
                </div>

                <div className="mt-8 flex flex-col items-center">
                  <TurnstileWidget 
                    onSuccess={(token) => {
                      setTurnstileToken(token);
                      setCaptchaError(false);
                    }} 
                  />
                  {captchaError && (
                    <p className="text-red-500 text-xs font-bold mt-2 font-sans text-center">
                      Please complete the CAPTCHA to continue.
                    </p>
                  )}
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="group relative bg-[#52AE26] hover:bg-[#60C92C] active:translate-y-1 disabled:opacity-70 disabled:active:translate-y-0 text-white border-4 border-black px-6 py-4 flex items-center justify-center gap-3 transition-all"
                    style={{ boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)" }}
                    onClick={() => { if(!submitting) playRetroSound("jump"); }}
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="font-bold text-[12px] tracking-widest drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">PROCESSING...</span>
                      </div>
                    ) : (
                      <>
                        <span className="font-bold text-[12px] tracking-widest drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform">
                          BEGIN QUEST
                        </span>
                        <Send className="w-5 h-5 drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)] group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InitPage() {
  return (
    <Suspense fallback={null}>
      <InitPageContent />
    </Suspense>
  );
}
