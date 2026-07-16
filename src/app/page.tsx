"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Press_Start_2P } from "next/font/google";
import RetroLoader from "@/components/RetroLoader";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
});

interface PageConfig {
  success: boolean;
  title: string;
  welcomeTitle: string;
  bulletPoints: string[];
  cycleOpen: boolean;
  footerBlinkText: string;
  marqueeText: string;
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

export default function Homepage() {
  const router = useRouter();
  const [scale, setScale] = useState(1);
  const [cycleOpen, setCycleOpen] = useState(true);
  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch recruitment page configuration on mount
  useEffect(() => {
    fetch("/api/pages/home")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPageConfig(data);
          setCycleOpen(data.cycleOpen);
        }
      })
      .catch(() => {})
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Responsive Scaling Matrix to fit viewport height perfectly
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

  const playRetroSound = (type: "select" | "open") => {
    if (typeof window === "undefined") return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "select") {
        osc.type = "square";
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.setValueAtTime(900, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === "open") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {
      console.warn("Audio Context failed", e);
    }
  };

  return (
    <>
      <RetroLoader isLoading={isLoading} title="BOOTING THE QUEST" />

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
            
            {/* Floating Clouds */}
            <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[300px] left-[1060px] w-[280px] opacity-85 animate-retro-float pixelated select-none pointer-events-none" style={{ animationDelay: "0s" }} />
            <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[140px] left-[-40px] w-[320px] opacity-80 animate-retro-float pixelated select-none pointer-events-none" style={{ animationDelay: "1s" }} />
            <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[39px] left-[1167px] w-[360px] opacity-90 animate-retro-float pixelated select-none pointer-events-none" style={{ animationDelay: "0.5s" }} />
            <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[333px] left-[2509px] w-[260px] opacity-75 animate-retro-float pixelated select-none pointer-events-none" style={{ animationDelay: "1.8s" }} />
            <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[140px] left-[1312px] w-[320px] opacity-85 animate-retro-float pixelated select-none pointer-events-none" style={{ animationDelay: "2.3s" }} />
            <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[39px] left-[2519px] w-[360px] opacity-90 animate-retro-float pixelated select-none pointer-events-none" style={{ animationDelay: "0.2s" }} />

            {/* Additional Small Clouds */}
            <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[220px] left-[400px] w-[200px] opacity-70 animate-retro-float pixelated select-none pointer-events-none" style={{ animationDelay: "1.2s" }} />
            <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[180px] left-[1800px] w-[240px] opacity-60 animate-retro-float pixelated select-none pointer-events-none" style={{ animationDelay: "0.8s" }} />
            <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[280px] left-[2100px] w-[180px] opacity-80 animate-retro-float pixelated select-none pointer-events-none" style={{ animationDelay: "1.5s" }} />

            {/* Background Skyline */}
            <img src="/pixel_cloud_large.svg" alt="Skyline" className="absolute top-[566px] left-0 w-[1437px] h-[458px] object-cover opacity-100 pointer-events-none select-none pixelated" />
            <img src="/pixel_cloud_large.svg" alt="Skyline" className="absolute top-[566px] left-[1437px] w-[1437px] h-[458px] object-cover opacity-100 pointer-events-none select-none pixelated" />
            
            {/* Midground Skyline Blocks */}
            {Array.from({ length: 12 }).map((_, idx) => (
              <img key={idx} src="/city_skyline.svg" alt="Skyline Block" className="absolute top-[631px] w-[246px] h-[249px] opacity-75 pointer-events-none select-none pixelated" style={{ left: `${idx * 245}px` }} />
            ))}

            {/* Green Bushes */}
            <img src="/bushes_pixel.svg" alt="Bushes Left" className="absolute top-[739px] left-0 w-[1456px] h-[200px] z-4 pointer-events-none select-none pixelated" />
            <img src="/bushes_pixel.svg" alt="Bushes Right" className="absolute top-[739px] left-[1456px] w-[1456px] h-[200px] z-4 pointer-events-none select-none pixelated" />

            {/* Green Pipes framing the center (Aligned vertically to hold the signboard) */}
            <RetroPipe left="900px" top="-5px" height={250} isTop={true} />
            <RetroPipe left="1900px" top="-5px" height={250} isTop={true} />
            
            <RetroPipe left="900px" top="730px" height={200} isTop={false} />
            <RetroPipe left="1900px" top="730px" height={200} isTop={false} />

            {/* Main Hero Center Box (Inside Scaled Canvas so it perfectly aligns with the pipes) */}
            <div className="absolute z-40 animate-pixel-slide-up" style={{ top: "220px", left: "860px", width: "1132px" }}>
              <div 
                className="bg-[#FFE4D6] rounded-[10px] border-[6px] border-black flex flex-col items-center p-4 relative"
                style={{ boxShadow: "16px 16px 0px 0px rgba(0,0,0,0.4)" }}
              >
                {/* Header */}
                <div className="w-full bg-[#C85A28] border-4 border-black rounded-[6px] py-6 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] [background-size:10px_10px]" />
                  <span className="text-white text-[20px] font-bold tracking-widest relative z-10 drop-shadow-[3px_3px_0px_#000] uppercase">
                    {pageConfig?.title || "░ MIC RECRUITMENT 2026-27 ░"}
                  </span>
                </div>

                <div className="w-full p-12 flex flex-col items-center gap-10 bg-[#FFDED6] mt-4 border-4 border-black rounded-[6px]">
                  {/* Content */}
                  <div className="text-center space-y-6">
                    <h2 className="text-[18px] font-bold text-[#A93710] leading-loose drop-shadow-[2px_2px_0px_#fff] uppercase">
                      {pageConfig?.welcomeTitle || "★ WELCOME TO THE QUEST ★"}
                    </h2>
                    <div className="text-[14px] text-black leading-loose font-bold flex flex-col gap-4 max-w-xl text-left mx-auto">
                      {(pageConfig?.bulletPoints || [
                        "9 DEPARTMENTS. 100 SEATS.",
                        "ONLY THE BEST COMPLETE THE QUEST.",
                        "ARE YOU READY, PLAYER?"
                      ]).map((bullet, idx) => (
                        <p key={idx} className="flex items-start gap-4 uppercase">
                          <span className="text-[#C85A28] text-[18px]">▸</span> {bullet}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex w-full gap-8 mt-6">
                    <button
                      onClick={() => { playRetroSound("open"); router.push("/recruitments"); }}
                      className="flex-1 bg-white hover:bg-slate-100 text-black border-4 border-black py-6 px-6 text-[14px] font-bold tracking-widest transition-transform active:translate-y-1 flex items-center justify-center gap-2"
                      style={{ boxShadow: "6px 6px 0px 0px #000" }}
                    >
                      VIEW QUESTS
                    </button>
                    
                    {cycleOpen ? (
                      <button
                      onClick={() => { playRetroSound("select"); router.push("/login"); }}
                      className="flex-1 bg-[#52AE26] hover:bg-[#72F418] text-white border-4 border-black py-6 px-6 text-[14px] font-bold tracking-widest transition-transform active:translate-y-1 flex items-center justify-center gap-2 group"
                      style={{ boxShadow: "6px 6px 0px 0px #000" }}
                    >
                      START QUEST <span className="group-hover:translate-x-1 transition-transform">►</span>
                    </button>
                    ) : (
                      <button
                        disabled
                        className="flex-1 bg-slate-300 text-slate-500 border-4 border-black py-6 px-6 text-[14px] font-bold tracking-widest flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
                        style={{ boxShadow: "6px 6px 0px 0px #000" }}
                      >
                        QUEST CLOSED ✖
                      </button>
                    )}
                  </div>

                  <div className="mt-8 pt-8 border-t-4 border-black/10 w-full text-center">
                    <span className="text-[12px] text-[#A93710] font-bold animate-retro-blink uppercase tracking-widest">
                      {pageConfig?.footerBlinkText || "[ PRESS BUTTON TO BEGIN ]"}
                    </span>
                  </div>
                </div>

                {/* Corner pixels */}
                <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-[#ffffff66]" />
                <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-black" />
                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-black" />
                <div className="absolute left-2 bottom-2 w-1.5 h-1.5 bg-black" />
                <div className="absolute right-2 bottom-2 w-1.5 h-1.5 bg-black" />
              </div>
            </div>

            {/* Ground */}
            <div className="absolute top-[925px] left-0 w-full h-[300px] z-25 flex flex-col select-none pointer-events-none">
              <div className="w-full h-5 bg-[#52AE26] border-t-4 border-b-4 border-black flex flex-col justify-between shrink-0">
                <div className="w-full h-[3px] bg-[#72F418]" />
                <div className="w-full h-[3px] bg-[#3FA70E]" />
              </div>
              <div className="w-full flex-grow bg-[#DD9955] border-b-4 border-black relative overflow-hidden flex items-start pt-3">
                <div className="flex whitespace-nowrap animate-marquee">
                  <span className="inline-block text-[24px] text-[#CC7700] tracking-wider uppercase font-bold pr-10">
                    {Array(6).fill(pageConfig?.marqueeText || "MICROSOFT INNOVATIONS CLUB TENURE 2026-2027").join("  ★  ")}
                  </span>
                  <span className="inline-block text-[24px] text-[#CC7700] tracking-wider uppercase font-bold pr-10">
                    {Array(6).fill(pageConfig?.marqueeText || "MICROSOFT INNOVATIONS CLUB TENURE 2026-2027").join("  ★  ")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Static Header Elements */}
        <div className="absolute top-6 left-8 z-30">
          <img src="/mic_logo_pixel.png" alt="MIC Logo" className="pixelated w-[110px] h-[79px] select-none pointer-events-none hover:animate-retro-shake" />
        </div>

        <div className="absolute top-8 right-8 z-30">
          <button
            onClick={() => { playRetroSound("open"); router.push("/faqs"); }}
            className="bg-[#7CA922] hover:bg-[#8CB932] text-black text-[11px] font-bold py-2 px-5 border-4 border-black cursor-pointer uppercase tracking-wider transition-transform active:translate-y-1"
            style={{ boxShadow: "4px 4px 0px 0px #000" }}
          >
            FAQS
          </button>
        </div>
      </div>
    </>
  );
}

