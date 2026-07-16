"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Press_Start_2P } from "next/font/google";
import TurnstileWidget from "@/components/TurnstileWidget";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
});



function RetroPipe({ height, top, left, isTop }: { height: number; top: string; left: string; isTop: boolean }) {
  return (
    <img
      src="/green_pipe.svg"
      alt="Pipe"
      className="absolute select-none pointer-events-none z-10 w-[52px] pixelated"
      style={{
        left,
        top,
        height: `${height}px`,
        transform: isTop ? "none" : "scaleY(-1)",
        objectFit: "fill",
      }}
    />
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [scale, setScale] = useState(1);
  // Store the actual Turnstile token — not just a boolean flag
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [captchaError, setCaptchaError] = useState(false);

  // Scale background to fit
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

  // No manual Turnstile script setup needed — TurnstileWidget handles it

  const handleSignIn = async () => {
    if (!turnstileToken) return;
    setIsSigningIn(true);
    setCaptchaError(false);

    try {
      // Verify the Turnstile token server-side before triggering Google OAuth
      const verifyRes = await fetch("/api/turnstile/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: turnstileToken }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyData.success) {
        setCaptchaError(true);
        setTurnstileToken(null);
        setIsSigningIn(false);
        return;
      }

      signIn("google", { callbackUrl: "/recruitments" });
    } catch {
      setCaptchaError(true);
      setIsSigningIn(false);
    }
  };

  const playRetroSound = () => {
    if (typeof window === "undefined") return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "square";
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.setValueAtTime(900, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  };

  return (
    <div className={`${pressStart.variable} font-press-start w-full h-screen overflow-hidden select-none bg-[#DD9955] relative flex justify-center items-center`}>
      {/* Absolute positioned scaled background container centered horizontally */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2"
        style={{
          width: "2865px",
          height: "1024px",
          transform: `scale(${scale})`,
          transformOrigin: "top center",
        }}
      >
        <div className="w-[2865px] h-[1024px] absolute top-0 left-0 bg-[linear-gradient(180deg,#1188EE_0%,#0E8AEA_25%,#1093EB_35%,#1197EC_46%,#16B6F4_52%,#10CBF1_56%,#0FC6F1_60%,#15DEF0_65%,#15DEF0_81%)] overflow-hidden">
          
          <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[300px] left-[1060px] w-[280px] opacity-85 animate-retro-float pixelated select-none pointer-events-none" style={{ animationDelay: "0s" }} />
          <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[140px] left-[-40px] w-[320px] opacity-80 animate-retro-float pixelated select-none pointer-events-none" style={{ animationDelay: "1s" }} />
          <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[39px] left-[1167px] w-[360px] opacity-90 animate-retro-float pixelated select-none pointer-events-none" style={{ animationDelay: "0.5s" }} />
          <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[333px] left-[2509px] w-[260px] opacity-75 animate-retro-float pixelated select-none pointer-events-none" style={{ animationDelay: "1.8s" }} />
          <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[140px] left-[1312px] w-[320px] opacity-85 animate-retro-float pixelated select-none pointer-events-none" style={{ animationDelay: "2.3s" }} />
          <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[39px] left-[2519px] w-[360px] opacity-90 animate-retro-float pixelated select-none pointer-events-none" style={{ animationDelay: "0.2s" }} />

          <img src="/pixel_cloud_large.svg" alt="Skyline" className="absolute top-[566px] left-[500px] w-[1437px] h-[458px] object-cover opacity-100 pointer-events-none select-none pixelated" />
          
          {Array.from({ length: 12 }).map((_, idx) => (
            <img key={idx} src="/city_skyline.svg" alt="Skyline Block" className="absolute top-[631px] w-[246px] h-[249px] opacity-75 pointer-events-none select-none pixelated" style={{ left: `${idx * 245}px` }} />
          ))}

          <img src="/bushes_pixel.svg" alt="Bushes" className="absolute top-[739px] left-[500px] w-[1456px] h-[200px] z-4 pointer-events-none select-none pixelated" />

          <RetroPipe left="1156px" top="-5px" height={400} isTop={true} />
          <RetroPipe left="1656px" top="-5px" height={400} isTop={true} />
          <RetroPipe left="1100px" top="650px" height={200} isTop={false} />
          <RetroPipe left="1700px" top="600px" height={250} isTop={false} />

          <div className="absolute top-[925px] left-0 w-full h-[300px] z-25 flex flex-col select-none pointer-events-none">
            <div className="w-full h-5 bg-[#52AE26] border-t-4 border-b-4 border-black flex flex-col justify-between shrink-0">
              <div className="w-full h-[3px] bg-[#72F418]" />
              <div className="w-full h-[3px] bg-[#3FA70E]" />
            </div>
            <div className="w-full flex-grow bg-[#DD9955] border-b-4 border-black relative overflow-hidden flex items-start pt-3">
              <div className="flex whitespace-nowrap animate-marquee">
                <span className="inline-block text-[24px] text-[#CC7700] tracking-wider uppercase font-bold pr-10">
                  {Array(6).fill("MICROSOFT INNOVATIONS CLUB TENURE 2026-2027").join("  ★  ")}
                </span>
                <span className="inline-block text-[24px] text-[#CC7700] tracking-wider uppercase font-bold pr-10">
                  {Array(6).fill("MICROSOFT INNOVATIONS CLUB TENURE 2026-2027").join("  ★  ")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-6 left-8 z-30 cursor-pointer" onClick={() => router.push("/")}>
        <img src="/mic_logo_pixel.png" alt="MIC Logo" className="pixelated w-[110px] h-[79px] select-none hover:animate-retro-shake" />
      </div>

      {/* Login Dialog Box */}
      <div className="relative z-40 w-full max-w-[650px] px-4 animate-pixel-slide-up">
        <div 
          className="bg-[#FFE4D6] rounded-[10px] border-4 border-black flex flex-col items-center p-2 relative"
          style={{ boxShadow: "12px 12px 0px 0px rgba(0,0,0,0.4)" }}
        >
          {/* Header */}
          <div className="w-full bg-[#1188EE] border-4 border-black rounded-[6px] py-4 flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] [background-size:10px_10px]" />
            <span className="text-white text-[12px] md:text-[14px] font-bold tracking-widest relative z-10 drop-shadow-[2px_2px_0px_#000]">
              ░ PLAYER AUTHENTICATION ░
            </span>
          </div>

          <div className="w-full p-6 md:p-8 flex flex-col items-center gap-6 bg-[#FFDED6] mt-2 border-4 border-black rounded-[6px]">
            
            <div className="w-16 h-16 bg-white border-4 border-black flex items-center justify-center p-1 shadow-[4px_4px_0px_#000] hover:animate-retro-shake">
                <img src="/flappy_bird.svg" alt="Bird" className="pixelated object-contain w-full h-full animate-retro-float" />
            </div>

            <div className="text-center space-y-4">
              <h2 className="text-[12px] font-bold text-[#A93710] leading-loose drop-shadow-[1px_1px_0px_#fff]">
                IDENTIFY YOURSELF, PLAYER
              </h2>
              <div className="text-[9px] md:text-[10px] text-black leading-loose font-bold flex flex-col gap-2 max-w-sm text-left mx-auto">
                <p className="flex items-start gap-2"><span className="text-[#C85A28]">►</span> USE YOUR @vitstudent.ac.in</p>
                <p className="flex items-start gap-2 pl-4">GOOGLE ACCOUNT TO PROCEED.</p>
              </div>
            </div>

            <button
              onClick={() => { playRetroSound(); handleSignIn(); }}
              disabled={!turnstileToken || isSigningIn}
              className={`w-full border-4 border-black py-4 px-4 text-[10px] font-bold tracking-widest transition-transform flex items-center justify-center gap-3 ${
                !turnstileToken
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed opacity-80"
                  : "bg-white hover:bg-slate-100 text-black active:translate-y-1 cursor-pointer"
              }`}
              style={{ boxShadow: turnstileToken ? "4px 4px 0px 0px #000" : "none" }}
            >
              {isSigningIn ? (
                <span className="animate-retro-blink">LOADING...</span>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  SIGN IN WITH GOOGLE
                </>
              )}
            </button>

            {/* Cloudflare Turnstile — token verified server-side before sign-in */}
            <div className="w-full bg-white border-4 border-black flex items-center justify-center py-2" style={{ boxShadow: "inset 2px 2px 0px 0px rgba(0,0,0,0.1)" }}>
              <TurnstileWidget
                onSuccess={(token) => { setTurnstileToken(token); setCaptchaError(false); }}
                onError={() => { setTurnstileToken(null); setCaptchaError(true); }}
                onExpire={() => { setTurnstileToken(null); }}
                theme="light"
                className="mx-auto"
              />
            </div>
            {captchaError && (
              <p className="text-[8px] text-red-600 font-bold uppercase text-center tracking-widest">
                ⚠ CAPTCHA FAILED — PLEASE RETRY
              </p>
            )}

            <div className="w-full text-center mt-2">
              <span className="text-[8px] md:text-[9px] text-[#A93710] font-bold uppercase tracking-widest leading-loose block">
                WARNING: NON-VIT EMAILS
                <br/>WILL BE BLOCKED
              </span>
            </div>
          </div>

          {/* Corner pixels */}
          <div className="absolute top-1.5 left-1.5 w-1 h-1 bg-[#ffffff66]" />
          <div className="absolute top-1.5 left-1.5 w-1 h-1 bg-black" />
          <div className="absolute top-1.5 right-1.5 w-1 h-1 bg-black" />
          <div className="absolute left-1.5 bottom-1.5 w-1 h-1 bg-black" />
          <div className="absolute right-1.5 bottom-1.5 w-1 h-1 bg-black" />
        </div>
      </div>
    </div>
  );
}
