"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Press_Start_2P } from "next/font/google";
import { Loader2, CheckCircle2, AlertTriangle, Send, Edit3, PlayCircle, Github, Link } from "lucide-react";
import type { FormField, StageConfig } from "@/models/Department";
import TurnstileWidget from "@/components/TurnstileWidget";
import posthog from "posthog-js";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
});

interface StageSubmission {
  stage: number;
  submittedAt: string;
  result: "pending" | "passed" | "failed";
  responses: Record<string, unknown>;
}

interface ApplicationStatus {
  overallStatus: "in-progress" | "selected" | "rejected" | "waitlisted";
  firstPreference: string;
  secondPreference?: string;
  firstPrefProgress: {
    status: "active" | "passed" | "rejected" | "pending";
    currentStage: number;
    stages: StageSubmission[];
  };
  secondPrefProgress?: {
    status: "active" | "passed" | "rejected" | "pending";
    currentStage: number;
    stages: StageSubmission[];
  };
}


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

// ─── Retro Dynamic Field Renderer ─────────────────────────────────────────────
function FieldRenderer({
  field,
  value,
  onChange,
  disabled,
}: {
  field: FormField;
  value: unknown;
  onChange: (val: unknown) => void;
  disabled?: boolean;
}) {
  const base = "w-full bg-white border-[3px] border-[#C85A28] rounded-[8px] px-4 py-3 text-sm text-black font-sans placeholder:text-slate-400 focus:outline-none focus:ring-0 focus:border-black transition-colors";

  const renderIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("video") || l.includes("youtube")) return <PlayCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />;
    if (l.includes("github")) return <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />;
    if (l.includes("link") || l.includes("url") || l.includes("deployed")) return <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />;
    return null;
  };

  const icon = renderIcon(field.label);
  const paddingClass = icon ? "pl-10" : "";

  switch (field.type) {
    case "textarea":
      return (
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-bold text-black uppercase leading-snug">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </div>
          <textarea
            id={field.id}
            required={field.required}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            rows={4}
            className={`${base} ${paddingClass} resize-none ${disabled ? 'opacity-70 cursor-not-allowed bg-slate-100' : ''}`}
          />
        </div>
      );

    case "select":
      return (
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-bold text-black uppercase leading-snug">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </div>
          <select
            id={field.id}
            required={field.required}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={`${base} ${paddingClass} ${disabled ? 'opacity-70 cursor-not-allowed bg-slate-100' : 'cursor-pointer'} appearance-none`}
          >
            <option value="">-- Select --</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );

    case "radio":
    case "checkbox":
      return (
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-bold text-black uppercase leading-snug">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </div>
          <div className={`p-4 border-[3px] border-[#C85A28] rounded-[8px] space-y-2 ${disabled ? 'bg-slate-100 opacity-70' : 'bg-white'}`}>
            {field.options?.map((opt) => {
              const isCheckbox = field.type === "checkbox";
              const arr = isCheckbox ? ((value as string[]) ?? []) : [];
              const checked = isCheckbox ? arr.includes(opt) : value === opt;
              
              return (
                <label key={opt} className={`flex items-center gap-3 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                  <input
                    type={isCheckbox ? "checkbox" : "radio"}
                    name={field.id}
                    value={opt}
                    checked={checked}
                    disabled={disabled}
                    onChange={() => {
                      if (disabled) return;
                      if (isCheckbox) {
                        const next = checked ? arr.filter((v) => v !== opt) : [...arr, opt];
                        onChange(next);
                      } else {
                        onChange(opt);
                      }
                    }}
                    className={`accent-[#C85A28] h-4 w-4 ${disabled ? 'cursor-not-allowed' : ''}`}
                  />
                  <span className="text-sm font-sans text-black">{opt}</span>
                </label>
              );
            })}
          </div>
        </div>
      );

    case "url": {
      const urls = Array.isArray(value) ? value : (typeof value === "string" && value ? [value] : [""]);
      
      const updateUrl = (index: number, newUrl: string) => {
        const newUrls = [...urls];
        newUrls[index] = newUrl;
        onChange(newUrls);
      };

      const addUrl = () => {
        if (urls.length < 3) {
          onChange([...urls, ""]);
        }
      };
      
      const removeUrl = (index: number) => {
        const newUrls = urls.filter((_, i) => i !== index);
        if (newUrls.length === 0) newUrls.push("");
        onChange(newUrls);
      };

      return (
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-bold text-black uppercase leading-snug">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </div>
          <div className="flex flex-col gap-3">
            {urls.map((u, i) => (
              <div key={i} className="flex gap-2 items-center">
                <div className="relative flex-grow">
                  {icon}
                  <input
                    id={i === 0 ? field.id : `${field.id}-${i}`}
                    type={field.type}
                    required={i === 0 ? field.required : false}
                    placeholder={field.placeholder || "https://..."}
                    value={u}
                    onChange={(e) => updateUrl(i, e.target.value)}
                    disabled={disabled}
                    className={`${base} ${paddingClass} ${disabled ? 'opacity-70 cursor-not-allowed bg-slate-100' : ''}`}
                  />
                </div>
                {!disabled && (
                  <div className="flex gap-2">
                    {urls.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeUrl(i)}
                        className="w-[44px] h-[44px] flex-shrink-0 flex items-center justify-center bg-[#FFE4D6] border-[3px] border-black rounded-[8px] hover:bg-[#ffcdc0] transition-colors"
                      >
                        <span className="text-xl font-bold font-sans text-red-600">-</span>
                      </button>
                    )}
                    {i === urls.length - 1 && urls.length < 3 && (
                      <button 
                        type="button" 
                        onClick={addUrl}
                        className="w-[44px] h-[44px] flex-shrink-0 flex items-center justify-center bg-[#FFE4D6] border-[3px] border-black rounded-[8px] hover:bg-[#ffcdc0] transition-colors"
                      >
                        <span className="text-xl font-bold font-sans text-green-600">+</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    default:
      return (
        <div className="flex flex-col gap-2">
          <div className="text-[11px] font-bold text-black uppercase leading-snug">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </div>
          <div className="relative">
            {icon}
            <input
              id={field.id}
              type={field.type}
              required={field.required}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              value={(value as string) ?? ""}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className={`${base} ${paddingClass} ${disabled ? 'opacity-70 cursor-not-allowed bg-slate-100' : ''}`}
            />
          </div>
        </div>
      );
  }
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function StagePage({
  params,
}: {
  params: Promise<{ dept: string; n: string }>;
}) {
  const { dept, n } = use(params);
  const stageNum = parseInt((n || "").replace("stage-", ""), 10);
  const router = useRouter();

  const [scale, setScale] = useState(1);
  const [stageConfig, setStageConfig] = useState<StageConfig | null>(null);
  const [totalStages, setTotalStages] = useState(2);
  const [stageLabels, setStageLabels] = useState<string[]>([]);
  const [existingSubmission, setExistingSubmission] = useState<Record<string, unknown> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [cycleOpen, setCycleOpen] = useState(true);
  const [responses, setResponses] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [deptName, setDeptName] = useState("");
  // Turnstile — token verified server-side before each submission
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState(false);

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

  useEffect(() => {
    const fetchStage = async () => {
      try {
        const [stageRes, deptRes, cycleRes] = await Promise.all([
          fetch(`/api/apply/${dept}/stage/${stageNum}`),
          fetch(`/api/admin/departments/${dept}`),
          fetch("/api/apply/status"),
        ]);

        let userData: Record<string, unknown> | null = null;
        let appData: ApplicationStatus | null = null;
        let fetchedStageConfig: StageConfig | null = null;
        let hasSubmission = false;

        if (stageRes.ok) {
          const data = await stageRes.json();
          setStageConfig(data.stageConfig);
          fetchedStageConfig = data.stageConfig;
          if (data.submission) {
            setExistingSubmission(data.submission);
            setResponses(data.submission.responses ?? {});
            hasSubmission = true;
          }
        }

        if (deptRes.ok) {
          const deptData = await deptRes.json();
          setTotalStages(deptData.department?.totalStages ?? 2);
          setDeptName(deptData.department?.name ?? dept);
          setStageLabels(
            deptData.department?.stages?.map((s: StageConfig) => s.title.split(" ")[0]) ?? []
          );
        }

        if (cycleRes.ok) {
          const statusData = await cycleRes.json();
          setCycleOpen(statusData.cycleOpen ?? true);
          userData = statusData.user;
          appData = statusData.application;
        }

        // Auto-fill logic
        if (!hasSubmission && fetchedStageConfig) {
          const initialResponses: Record<string, unknown> = {};

          // 1. If applying for second preference Stage 1, pull from first preference Stage 1
          if (stageNum === 1 && appData && appData.secondPreference === dept) {
            const firstPrefStage1 = appData.firstPrefProgress?.stages?.find((s: StageSubmission) => s.stage === 1);
            if (firstPrefStage1 && firstPrefStage1.responses) {
              Object.assign(initialResponses, firstPrefStage1.responses);
            }
          }

          // 2. Auto-fill from Google Account (only if not already filled by step 1)
          if (userData) {
            fetchedStageConfig.formFields.forEach(field => {
              const labelUpper = field.label.toUpperCase();
              if (labelUpper.includes("NAME") && userData.name && !initialResponses[field.id]) {
                initialResponses[field.id] = userData.name;
              }
              if (labelUpper.includes("EMAIL") && userData.email && !initialResponses[field.id]) {
                initialResponses[field.id] = userData.email;
              }
            });
          }

          if (Object.keys(initialResponses).length > 0) {
            setResponses(initialResponses);
          }
        }
      } catch {
        setError("Failed to load stage. Please refresh.");
      } finally {
        setLoading(false);
      }
    };
    fetchStage();
  }, [dept, stageNum]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCaptchaError(false);

    // Require a valid Turnstile token before submitting
    if (!turnstileToken) {
      setCaptchaError(true);
      setError("Please complete the CAPTCHA challenge first.");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Verify the Turnstile token server-side
      const verifyRes = await fetch("/api/turnstile/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: turnstileToken }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyData.success) {
        setCaptchaError(true);
        setTurnstileToken(null); // force the user to solve again
        setError("CAPTCHA verification failed. Please solve the challenge again.");
        setSubmitting(false);
        return;
      }

      // 2. Submit the stage form
      const method = existingSubmission && isEditing ? "PUT" : "POST";
      const res = await fetch(`/api/apply/${dept}/stage/${stageNum}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses, _trap: "" }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        posthog.capture("Stage Submitted", {
          department: dept,
          stage: stageNum,
          isEditing: !!(existingSubmission && isEditing),
          isLastStage: data.isLastStage,
        });
        if (data.isLastStage) {
          setSubmitted(true);
        } else {
          router.push(`/apply/${dept}/stage-${data.nextStage}`);
        }
      } else {
        setError(data.error ?? "Submission failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
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
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className={`${pressStart.variable} font-press-start min-h-screen bg-[#DD9955] flex flex-col items-center justify-center`}>
        <div className="text-white text-[14px] animate-retro-blink uppercase tracking-widest drop-shadow-[2px_2px_0px_#000]">
          LOADING STAGE...
        </div>
      </div>
    );
  }

  if (!stageConfig) {
    return (
      <main className={`${pressStart.variable} font-press-start w-full h-screen overflow-hidden select-none bg-[#DD9955] relative flex justify-center items-center`}>
        <RetroBackground scale={scale} />
        <div className="relative z-40 w-full max-w-[650px] px-4 animate-pixel-slide-up">
          <div className="bg-[#FFE4D6] border-4 border-black rounded-[12px] relative flex flex-col" style={{ boxShadow: "8px 8px 0px 0px rgba(0,0,0,0.5)" }}>
            <div className="bg-[#A05522] w-full h-[60px] shrink-0 border-b-4 border-black rounded-t-[8px] flex items-center justify-center relative overflow-hidden">
              <span className="text-black text-[18px] font-bold tracking-widest relative z-10 drop-shadow-[1px_1px_0px_#fff] uppercase">
                ERROR: NOT FOUND
              </span>
            </div>
            <div className="p-8 flex flex-col items-center">
              <div className="border-[3px] border-black bg-white p-8 relative w-full flex flex-col items-center gap-4">
                <AlertTriangle className="w-10 h-10 text-red-500" />
                <h1 className="text-[12px] text-center font-bold text-[#A93710] leading-loose">STAGE {stageNum} IS NOT CONFIGURED</h1>
                <p className="text-[9px] text-center text-black leading-loose font-bold">This stage does not exist or has not been set up yet.</p>
                <button
                  onClick={() => { playRetroSound(); router.push("/recruitments"); }}
                  className="mt-4 bg-[#FFE4D6] hover:bg-[#FFDED6] text-black border-[3px] border-black rounded-[20px] py-2.5 px-6 text-[10px] font-bold tracking-widest transition-transform active:translate-y-1"
                  style={{ boxShadow: "3px 3px 0px 0px #000" }}
                >
                  RETURN TO MAP
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className={`${pressStart.variable} font-press-start w-full h-screen overflow-hidden select-none bg-[#DD9955] relative flex justify-center items-center`}>
        <RetroBackground scale={scale} />
        
        <div className="relative z-40 w-full max-w-[650px] px-4 animate-pixel-slide-up" style={{ marginTop: "40px" }}>
          
          <div className="bg-[#FFE4D6] border-4 border-black rounded-[12px] relative flex flex-col" style={{ boxShadow: "8px 8px 0px 0px rgba(0,0,0,0.5)" }}>
            
            {/* Ropes */}
            <div className="absolute bottom-[100%] w-3 z-[-1]" style={{ left: "10%", height: "100vh", background: "repeating-linear-gradient(to bottom, #CC8844 0, #CC8844 12px, #A05522 12px, #A05522 16px)", borderLeft: "2px solid #000", borderRight: "2px solid #000" }} />
            <div className="absolute bottom-[100%] w-3 z-[-1]" style={{ right: "10%", height: "100vh", background: "repeating-linear-gradient(to bottom, #CC8844 0, #CC8844 12px, #A05522 12px, #A05522 16px)", borderLeft: "2px solid #000", borderRight: "2px solid #000" }} />

            {/* Header Bar */}
            <div className="bg-[#A05522] w-full h-[60px] shrink-0 border-b-4 border-black rounded-t-[8px] flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] [background-size:10px_10px]" />
              <span className="text-black text-[20px] font-bold tracking-widest relative z-10 drop-shadow-[1px_1px_0px_#fff] uppercase">
                SUCCESS
              </span>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-black rounded-full shadow-[1px_1px_0px_#fff]" />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-black rounded-full shadow-[1px_1px_0px_#fff]" />
            </div>

            <div className="p-8 flex flex-col items-center">
              <div className="border-[3px] border-black bg-white p-8 relative w-full flex flex-col items-center">
                <div className="w-20 h-20 bg-[#52AE26] border-4 border-black flex items-center justify-center p-2 mb-6 shadow-[4px_4px_0px_#000]">
                  <CheckCircle2 className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-[16px] text-center font-bold text-[#A93710] leading-loose drop-shadow-[2px_2px_0px_#fff]">QUEST COMPLETED!</h1>
                <p className="text-[10px] text-center text-black leading-loose font-bold mt-4">Your application for {deptName} has been received.</p>
                <button
                  onClick={() => { playRetroSound(); window.location.href = "/recruitments"; }}
                  className="mt-8 bg-[#FFE4D6] hover:bg-[#FFDED6] text-black border-[3px] border-black rounded-[20px] py-3 px-8 text-[12px] font-bold tracking-widest transition-transform active:translate-y-1 flex items-center justify-center gap-3"
                  style={{ boxShadow: "3px 3px 0px 0px #000" }}
                >
                  VIEW STATUS
                  <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-black border-b-[5px] border-b-transparent" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </main>
    );
  }

  return (
    <div className={`${pressStart.variable} font-press-start w-full h-screen overflow-hidden bg-[#DD9955] relative flex justify-center items-center`}>
      <RetroBackground scale={scale} />

      {/* Back Button (Floating left) */}
      <button
        onClick={() => { playRetroSound(); stageNum > 1 ? router.push(`/apply/${dept}/stage-${stageNum - 1}`) : router.push("/recruitments"); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 md:left-12 z-50 w-12 h-12 rounded-full bg-slate-300 border-4 border-black shadow-[4px_4px_0px_#000] flex items-center justify-center hover:bg-white hover:scale-105 active:scale-95 transition-all"
      >
        <div className="w-0 h-0 border-t-[8px] border-t-transparent border-r-[12px] border-r-black border-b-[8px] border-b-transparent mr-1" />
      </button>

      {/* Main Hanging Signboard */}
      <div className="relative z-40 w-full max-w-[1000px] px-4 md:px-16 animate-pixel-slide-up" style={{ marginTop: "40px" }}>
        
        {/* Signboard Container */}
        <div className="bg-[#FFE4D6] border-4 border-black rounded-[12px] relative flex flex-col max-h-[85vh]" style={{ boxShadow: "8px 8px 0px 0px rgba(0,0,0,0.5)" }}>
          
          {/* Ropes */}
          <div className="absolute bottom-[100%] w-3 z-[-1]" style={{ left: "10%", height: "100vh", background: "repeating-linear-gradient(to bottom, #CC8844 0, #CC8844 12px, #A05522 12px, #A05522 16px)", borderLeft: "2px solid #000", borderRight: "2px solid #000" }} />
          <div className="absolute bottom-[100%] w-3 z-[-1]" style={{ right: "10%", height: "100vh", background: "repeating-linear-gradient(to bottom, #CC8844 0, #CC8844 12px, #A05522 12px, #A05522 16px)", borderLeft: "2px solid #000", borderRight: "2px solid #000" }} />

          {/* Header Bar (Dark Wood) */}
          <div className="bg-[#A05522] w-full h-[60px] shrink-0 border-b-4 border-black rounded-t-[8px] flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] [background-size:10px_10px]" />
            <span className="text-black text-[20px] font-bold tracking-widest relative z-10 drop-shadow-[1px_1px_0px_#fff] uppercase">
              {deptName || "DEPARTMENT"}
            </span>
            {/* Header Screws */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-black rounded-full shadow-[1px_1px_0px_#fff]" />
            
            {/* Retro Close Button */}
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

          {/* Form Body */}
          <div className="p-4 md:p-8 overflow-y-auto custom-scrollbar flex-grow">
            <div className="border-[3px] border-black bg-white p-4 md:p-6 relative">
              
              {/* Progress Indicator inside form area (Retro Style) */}
              {stageNum === 1 ? (
                <div className="absolute top-0 right-0 bg-black text-white px-3 py-1 text-[8px] font-bold uppercase">
                  PERSONAL INFO
                </div>
              ) : (
                <div className="absolute top-0 right-0 bg-black text-white px-3 py-1 text-[8px] font-bold uppercase">
                  STAGE {stageNum - 1}/{totalStages - 1}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-4">
                {/* Hidden honeypot */}
                <input type="text" name="_trap" className="hidden" tabIndex={-1} aria-hidden="true" />

                {error && (
                  <div className="p-3 mb-6 bg-red-100 border-[3px] border-red-500 flex items-center gap-3 text-xs text-red-700 font-bold uppercase">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                {existingSubmission && !isEditing && (
                   <div className="p-3 mb-6 bg-green-100 border-[3px] border-green-500 flex items-center gap-3 text-xs text-green-700 font-bold uppercase">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    SUBMITTED. {cycleOpen && existingSubmission.result === "pending" && "CLICK EDIT TO MODIFY."}
                  </div>
                )}

                {/* Grid Layout for Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  {stageConfig?.formFields.map((field) => (
                    <div key={field.id} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                      <FieldRenderer
                        field={field}
                        value={responses[field.id]}
                        onChange={(val) =>
                          setResponses((prev) => ({ ...prev, [field.id]: val }))
                        }
                        disabled={existingSubmission !== null && !isEditing}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-10 flex flex-col items-center gap-4 pb-2">
                  {(!existingSubmission || isEditing) && cycleOpen && (
                    <>
                      {/* Turnstile challenge — verified server-side on every submit */}
                      <div className="w-full bg-white border-[3px] border-[#C85A28] rounded-[8px] flex flex-col items-center py-3 gap-2">
                        <span className="text-[9px] font-bold text-black uppercase tracking-widest">
                          ► COMPLETE CHALLENGE TO SUBMIT
                        </span>
                        <TurnstileWidget
                          onSuccess={(token) => { setTurnstileToken(token); setCaptchaError(false); }}
                          onError={() => { setTurnstileToken(null); setCaptchaError(true); }}
                          onExpire={() => setTurnstileToken(null)}
                          theme="light"
                        />
                        {captchaError && (
                          <p className="text-[8px] text-red-600 font-bold uppercase tracking-widest">
                            ⚠ CAPTCHA FAILED — PLEASE RETRY
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={submitting || !turnstileToken}
                        onClick={playRetroSound}
                        className="bg-[#FFE4D6] hover:bg-[#FFDED6] text-black border-[3px] border-black rounded-[20px] py-3 px-8 text-[12px] font-bold tracking-widest transition-transform active:translate-y-1 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ boxShadow: "3px 3px 0px 0px #000" }}
                      >
                        {submitting ? "SUBMITTING..." : isEditing ? "SAVE CHANGES" : "SUBMIT"}
                        {!submitting && <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-black border-b-[5px] border-b-transparent" />}
                      </button>
                    </>
                  )}
                  {existingSubmission && !isEditing && (
                    <div className="flex gap-4">
                      {cycleOpen && existingSubmission.result === "pending" && (
                        <button
                          type="button"
                          onClick={() => { playRetroSound(); setIsEditing(true); }}
                          className="bg-white hover:bg-slate-100 text-black border-[3px] border-black rounded-[20px] py-3 px-8 text-[12px] font-bold tracking-widest transition-transform active:translate-y-1"
                          style={{ boxShadow: "3px 3px 0px 0px #000" }}
                        >
                          EDIT
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => { playRetroSound(); router.push("/recruitments"); }}
                        className="bg-[#FFE4D6] hover:bg-[#FFDED6] text-black border-[3px] border-black rounded-[20px] py-3 px-8 text-[12px] font-bold tracking-widest transition-transform active:translate-y-1"
                        style={{ boxShadow: "3px 3px 0px 0px #000" }}
                      >
                        VIEW STATUS
                      </button>
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="mt-4 flex justify-center">
                    <button
                      type="button"
                      onClick={() => { playRetroSound(); setIsEditing(false); setResponses(existingSubmission?.responses as Record<string, unknown> ?? {}); }}
                      className="text-xs text-[#A93710] font-bold hover:underline"
                    >
                      CANCEL EDIT
                    </button>
                  </div>
                )}
              </form>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
