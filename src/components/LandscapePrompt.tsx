"use client";

import React, { useState, useEffect } from "react";
import { Press_Start_2P } from "next/font/google";
import { Smartphone } from "lucide-react";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
});

export default function LandscapePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Check if it's a mobile device in portrait mode
      if (typeof window !== "undefined") {
        const isPortrait = window.innerHeight > window.innerWidth;
        const isMobile = window.innerWidth <= 768; // Standard mobile breakpoint
        
        if (isPortrait && isMobile && !dismissed) {
          setShowPrompt(true);
        } else {
          setShowPrompt(false);
        }
      }
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, [dismissed]);

  if (!showPrompt) return null;

  return (
    <div className={`${pressStart.variable} font-press-start fixed inset-0 z-[9999] bg-[#DD9955] flex flex-col items-center justify-center p-6 text-center select-none`}>
      <div 
        className="bg-[#FFE4D6] rounded-[10px] border-4 border-black p-6 w-full max-w-sm flex flex-col items-center gap-6 relative"
        style={{ boxShadow: "8px 8px 0px 0px rgba(0,0,0,0.3)" }}
      >
        <div className="bg-[#1188EE] border-4 border-black p-3 rounded-full mb-2 animate-bounce">
          <Smartphone className="w-8 h-8 text-white rotate-90" strokeWidth={2.5} />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-[14px] font-bold text-[#A93710] leading-loose drop-shadow-[1px_1px_0px_#fff] uppercase">
            LANDSCAPE MODE RECOMMENDED
          </h2>
          <p className="text-[9px] text-black leading-relaxed font-bold uppercase">
            Please rotate your device horizontally for the best experience.
          </p>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="mt-2 w-full bg-white hover:bg-slate-100 text-black border-4 border-black py-4 px-4 text-[10px] font-bold tracking-widest transition-transform active:translate-y-1"
          style={{ boxShadow: "4px 4px 0px 0px #000" }}
        >
          CONTINUE ANYWAY
        </button>

        {/* Corner pixels */}
        <div className="absolute top-1.5 left-1.5 w-1 h-1 bg-[#ffffff66]" />
        <div className="absolute top-1.5 left-1.5 w-1 h-1 bg-black" />
        <div className="absolute top-1.5 right-1.5 w-1 h-1 bg-black" />
        <div className="absolute left-1.5 bottom-1.5 w-1 h-1 bg-black" />
        <div className="absolute right-1.5 bottom-1.5 w-1 h-1 bg-black" />
      </div>
    </div>
  );
}
