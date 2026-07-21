"use client";

import React, { useState, useEffect, useRef } from "react";
import { Press_Start_2P } from "next/font/google";
import MicLogo from "@/components/MicLogo";
import MobileBackground from "@/components/MobileBackground";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
});

interface RetroLoaderProps {
  isLoading: boolean;
  onComplete?: () => void;
  title?: string;
}

const STATUS_MESSAGES = [
  "ESTABLISHING CONNECTIVITY...",
  "RETRIEVING SERVER CONFIG...",
  "PARSING DEPARTMENTS MAP...",
  "PREPARING YOUR RECRUITMENT ADVENTURE",
  "RENDERING QUEST ENVIRONMENT...",
  "OPTIMIZING PIXELS...",
  "READY! PRESS START!",
];

function RetroPipe({ height, top, left, isTop }: { height: number; top: string; left: string; isTop: boolean }) {
  return (
    <div
      className="absolute select-none pointer-events-none z-30 w-[52px] pixelated"
      style={{
        left,
        top,
        height: `${height}px`,
        transform: isTop ? "none" : "scaleY(-1)",
        borderStyle: "solid",
        borderWidth: "0 0 24px 0",
        borderColor: "transparent",
        borderImageSource: "url(/green_pipe.png)",
        borderImageSlice: "0 0 64 0 fill",
        borderImageRepeat: "stretch",
      }}
    />
  );
}

export default function RetroLoader({
  isLoading,
  onComplete,
  title,
}: RetroLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState(STATUS_MESSAGES[0]);
  const [isVisible, setIsVisible] = useState(true);
  const [scale, setScale] = useState(1);
  
  const progressRef = useRef(0);
  const loadedRef = useRef(false);

  // Responsive Scaling Matrix to match homepage
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        const heightScale = window.innerHeight / 1024;
        const widthScale = window.innerWidth / 1200;
        const cappedScale = Math.min(heightScale, widthScale, 1.2);
        setScale(cappedScale);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    loadedRef.current = !isLoading;
  }, [isLoading]);

  // Progress bar logic
  useEffect(() => {
    const interval = setInterval(() => {
      const current = progressRef.current;
      if (loadedRef.current) {
        if (current < 100) {
          const next = Math.min(100, current + 15);
          progressRef.current = next;
          setProgress(next);
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setIsVisible(false);
            if (onComplete) onComplete();
          }, 400);
        }
      } else {
        if (current < 90) {
          const next = current + Math.floor(Math.random() * 6) + 2;
          const finalNext = Math.min(90, next);
          progressRef.current = finalNext;
          setProgress(finalNext);
        }
      }
    }, 120);

    return () => clearInterval(interval);
  }, [onComplete]);

  // Status text based on progress
  useEffect(() => {
    if (progress < 15) setStatusText(STATUS_MESSAGES[0]);
    else if (progress < 30) setStatusText(STATUS_MESSAGES[1]);
    else if (progress < 50) setStatusText(STATUS_MESSAGES[2]);
    else if (progress < 75) setStatusText(STATUS_MESSAGES[3]);
    else if (progress < 90) setStatusText(STATUS_MESSAGES[4]);
    else if (progress < 100) setStatusText(STATUS_MESSAGES[5]);
    else setStatusText(STATUS_MESSAGES[6]);
  }, [progress]);

  if (!isVisible) return null;

  const MARQUEE_TEXT = "MICROSOFT INNOVATIONS CLUB TENURE 2026-2027";

  return (
    <div className={`${pressStart.variable} font-press-start fixed inset-0 z-[999] w-full h-[100dvh] overflow-hidden select-none bg-black flex justify-center items-center`}>
      
      {/* ── MOBILE LAYOUT (Matches 3.png) ── */}
      <div className="block md:hidden relative w-full h-[100dvh]">
        <MobileBackground>
          {/* Top bar */}
          <div className="relative z-20 flex items-center justify-between px-3 pt-3 flex-shrink-0">
            <img
              src="/mic_logo_pixel.png"
              alt="MIC Logo"
              className="pixelated w-[52px] h-[37px] drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]"
            />
          </div>

          {/* Main Content Area */}
          <div className="relative z-10 flex flex-col items-center flex-grow pt-4">
            <h1 className="relative z-20 text-white font-bold leading-tight uppercase tracking-normal text-center px-4" style={{ fontSize: "clamp(16px, 5vw, 22px)", textShadow: "2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000" }}>
              {title || "LOADING MAP"}
            </h1>

            {/* Wooden Progress Panel */}
            <div className="relative w-[90%] max-w-[340px] mt-8 bg-[#C8862A] border-[3px] border-[#2A1A00] p-4 flex flex-col items-center rounded-sm"
                 style={{ boxShadow: "4px 4px 0 rgba(0,0,0,0.5)" }}>
              
              {/* Top Pipes that touch the board and go up */}
              <div className="absolute bottom-[100%] left-[10px] w-[14px] bg-[#52AE26] border-x-[3px] border-black z-0" style={{ height: "50vh" }} />
              <div className="absolute bottom-[100%] right-[10px] w-[14px] bg-[#52AE26] border-x-[3px] border-black z-0" style={{ height: "50vh" }} />

              {/* Corner screws */}
              {[
                { top: 4, left: 4 }, { top: 4, right: 4 },
                { bottom: 4, left: 4 }, { bottom: 4, right: 4 },
              ].map((pos, i) => (
                <div key={i} className="absolute w-[4px] h-[4px] rounded-full bg-[#333] border border-black" style={pos} />
              ))}

              <p className="text-black font-bold uppercase text-[9px] tracking-wide mb-3 text-center px-2">
                {statusText}
              </p>

              <div className="flex items-center w-full gap-2 px-2">
                <div className="w-4 h-4 rounded-full bg-[#52AE26] border-[2px] border-black shrink-0" />
                <div className="flex-grow h-[14px] bg-white border-[2px] border-black rounded-[2px] overflow-hidden">
                  <div className="h-full bg-[linear-gradient(180deg,#72F418_0%,#52AE26_100%)] transition-all duration-150 ease-out"
                       style={{ width: `${progress}%`, borderRight: progress < 100 ? "2px solid #000" : "none" }} />
                </div>
                <div className="w-4 h-4 rounded-full bg-[#52AE26] border-[2px] border-black shrink-0" />
              </div>

              <p className="text-black font-bold text-[10px] mt-3">
                {progress}%
              </p>
            </div>
          </div>
        </MobileBackground>
      </div>

      {/* ── DESKTOP LAYOUT (Original) ── */}
      <div
        className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2"
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
          <img src="/pixel_cloud_large.svg" alt="Skyline" className="absolute top-[566px] left-[1435px] w-[1437px] h-[458px] object-cover opacity-100 pointer-events-none select-none pixelated" />
          
          {/* Midground Skyline Blocks */}
          {Array.from({ length: 12 }).map((_, idx) => (
            <img key={idx} src="/city_skyline.svg" alt="Skyline Block" className="absolute top-[631px] w-[246px] h-[249px] opacity-75 pointer-events-none select-none pixelated" style={{ left: `${idx * 245}px` }} />
          ))}

          {/* Green Bushes */}
          {Array.from({ length: 3 }).map((_, idx) => (
            <img
              key={`bush-${idx}`}
              src="/bushes_pixel.svg"
              alt={`Bushes ${idx}`}
              className="absolute top-[739px] w-[1456px] h-[200px] z-4 pointer-events-none select-none pixelated"
              style={{ left: `${idx * 1409}px` }}
            />
          ))}

          {/* Green Pipes framing the center (Aligned vertically to hold the signboard) */}
          <RetroPipe left="960px" top="-5px" height={250} isTop={true} />
          <RetroPipe left="1840px" top="-5px" height={250} isTop={true} />

          {/* ── HERO CENTER PANEL (Matches positioning of page.tsx) ── */}
          <div className="absolute z-40 animate-pixel-slide-up flex flex-col items-center" style={{ top: "110px", left: "860px", width: "1132px" }}>
            
            {/* ── LOADING QUEST TITLE ── */}
            <div className="flex items-center justify-center mb-8 w-full">
              {/* Title */}
              <h1 className="text-white uppercase tracking-widest drop-shadow-[6px_6px_0px_#000]" style={{ fontSize: "48px", letterSpacing: "0.1em" }}>
                {title || "LOADING QUEST..."}
              </h1>
            </div>

            {/* WOODEN PROGRESS PANEL */}
            <div className="w-[1000px]">
              {/* Wooden board */}
              <div
                className="relative rounded-[12px] border-[8px] border-black p-10 flex flex-col gap-8"
                style={{
                  background: "linear-gradient(135deg,#C8862A 0%,#B0701A 35%,#C8862A 60%,#A86010 100%)",
                  boxShadow: "12px 12px 0px 0px rgba(0,0,0,0.5), inset 0 4px 0px rgba(255,220,140,0.3)",
                }}
              >
                {/* Wood grain lines */}
                <div className="absolute inset-0 rounded-[4px] pointer-events-none overflow-hidden opacity-20">
                  {[15, 30, 45, 60, 75, 90].map((pct) => (
                    <div key={pct} className="absolute left-0 right-0" style={{ top: `${pct}%`, height: 2, background: "#000" }} />
                  ))}
                </div>

                {/* Status text */}
                <p className="text-center font-bold uppercase tracking-widest text-black z-10" style={{ fontSize: "22px", letterSpacing: "0.12em" }}>
                  {statusText}
                </p>

                {/* Progress bar */}
                <div className="flex items-center gap-5 z-10">
                  {/* Left cap */}
                  <div
                    className="shrink-0 rounded-full border-[6px] border-black"
                    style={{ width: 56, height: 56, background: "linear-gradient(135deg,#52AE26,#3a8a1a)" }}
                  />

                  {/* Bar track */}
                  <div
                    className="flex-1 relative border-[6px] border-black overflow-hidden"
                    style={{ height: 50, background: "#fff", borderRadius: 4 }}
                  >
                    {/* Fill */}
                    <div
                      className="absolute inset-y-0 left-0 transition-all duration-150 ease-out"
                      style={{
                        width: `${progress}%`,
                        background: "linear-gradient(180deg,#72F418 0%,#52AE26 50%,#3FA70E 100%)",
                        borderRight: progress < 100 ? "6px solid #000" : "none",
                      }}
                    />
                    {/* Shine stripe */}
                    <div
                      className="absolute inset-y-0 left-0 pointer-events-none"
                      style={{
                        width: `${progress}%`,
                        background: "linear-gradient(180deg,rgba(255,255,255,0.35) 0%,transparent 50%)",
                      }}
                    />
                  </div>

                  {/* Right cap */}
                  <div
                    className="shrink-0 rounded-full border-[6px] border-black"
                    style={{ width: 56, height: 56, background: "linear-gradient(135deg,#52AE26,#3a8a1a)" }}
                  />
                </div>

                {/* Percentage */}
                <p className="text-center font-bold text-black z-10" style={{ fontSize: "28px" }}>
                  {progress}%
                </p>

                {/* Corner screws */}
                {[
                  { top: 12, left: 12 },
                  { top: 12, right: 12 },
                  { bottom: 12, left: 12 },
                  { bottom: 12, right: 12 },
                ].map((pos, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full border-4 border-black"
                    style={{
                      ...pos,
                      width: 20,
                      height: 20,
                      background: "#8B5E1A",
                      boxShadow: "inset 2px 2px 0 rgba(255,220,140,0.4)",
                    }}
                  />
                ))}
              </div>
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
                <span className="inline-flex items-center shrink-0 text-[24px] text-[#CC7700] tracking-wider uppercase font-bold">
                  {Array(6).fill(MARQUEE_TEXT).map((text, idx) => (
                    <React.Fragment key={idx}>
                      <span>{text}</span>
                      <img src="/mic_logo_pixel.png" alt="MIC" className="w-8 h-8 md:w-10 md:h-10 mx-8 shrink-0" />
                    </React.Fragment>
                  ))}
                </span>
                <span className="inline-flex items-center shrink-0 text-[24px] text-[#CC7700] tracking-wider uppercase font-bold">
                  {Array(6).fill(MARQUEE_TEXT).map((text, idx) => (
                    <React.Fragment key={idx}>
                      <span>{text}</span>
                      <img src="/mic_logo_pixel.png" alt="MIC" className="w-8 h-8 md:w-10 md:h-10 mx-8 shrink-0" />
                    </React.Fragment>
                  ))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Static Header Elements */}
      <div className="hidden md:block">
        <MicLogo />
      </div>
    </div>
  );
}
