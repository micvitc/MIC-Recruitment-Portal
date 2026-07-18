"use client";

import React, { useState, useEffect, useRef } from "react";
import { Press_Start_2P } from "next/font/google";

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

export default function RetroLoader({ isLoading, onComplete, title = "BOOTING THE QUEST" }: RetroLoaderProps) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("INITIALIZING...");
  const [isVisible, setIsVisible] = useState(true);
  const progressRef = useRef(0);
  const loadedRef = useRef(false);

  useEffect(() => {
    loadedRef.current = !isLoading;
  }, [isLoading]);

  useEffect(() => {
    const interval = setInterval(() => {
      const current = progressRef.current;
      if (loadedRef.current) {
        // Fast-forward to 100% when loading completes
        if (current < 100) {
          const next = Math.min(100, current + 15);
          progressRef.current = next;
          setProgress(next);
        } else {
          clearInterval(interval);
          // Add a brief delay at 100% for satisfying game feel
          setTimeout(() => {
            setIsVisible(false);
            if (onComplete) onComplete();
          }, 250);
        }
      } else {
        // Slow progress up to 90% while waiting
        if (current < 90) {
          const next = current + Math.floor(Math.random() * 8) + 2;
          const finalNext = Math.min(90, next);
          progressRef.current = finalNext;
          setProgress(finalNext);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [onComplete]);

  // Update status messages based on progress percentage
  useEffect(() => {
    if (progress < 25) {
      setStatusText("ESTABLISHING CONNECTIVITY...");
    } else if (progress < 50) {
      setStatusText("RETRIEVING SERVER CONFIG...");
    } else if (progress < 75) {
      setStatusText("PARSING DEPARTMENTS MAP...");
    } else if (progress < 90) {
      setStatusText("RENDERING QUEST ENVIRONMENT...");
    } else if (progress < 100) {
      setStatusText("OPTIMIZING PIXELS...");
    } else {
      setStatusText("READY! PRESS START!");
    }
  }, [progress]);

  if (!isVisible) return null;

  // Build the retro progress bar blocks (10 total characters)
  const totalBlocks = 10;
  const activeBlocks = Math.floor(progress / (100 / totalBlocks));
  const barString = "█".repeat(activeBlocks) + "░".repeat(totalBlocks - activeBlocks);

  return (
    <div className={`${pressStart.variable} font-press-start fixed inset-0 z-[999] bg-[#DD9955] flex flex-col justify-center items-center select-none`}>
      {/* Background clouds to stay consistent with portal styling */}
      <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
        <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[10%] left-[10%] w-[200px] animate-retro-float pixelated" style={{ animationDelay: "0s" }} />
        <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute top-[40%] right-[15%] w-[240px] animate-retro-float pixelated" style={{ animationDelay: "1s" }} />
        <img src="/pixel_cloud_small.svg" alt="Cloud" className="absolute bottom-[20%] left-[20%] w-[180px] animate-retro-float pixelated" style={{ animationDelay: "2s" }} />
      </div>

      {/* Main retro box */}
      <div 
        className="w-[90%] max-w-[460px] bg-[#FFE4D6] rounded-[10px] border-[6px] border-black flex flex-col items-center p-6 relative z-10"
        style={{ boxShadow: "12px 12px 0px 0px rgba(0,0,0,0.4)" }}
      >
        {/* Header banner */}
        <div className="w-full bg-[#C85A28] border-4 border-black rounded-[6px] py-4 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-15 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] [background-size:10px_10px]" />
          <span className="text-white text-[12px] sm:text-[14px] font-bold tracking-widest relative z-10 drop-shadow-[2px_2px_0px_#000] uppercase">
            ░ {title} ░
          </span>
        </div>

        {/* Progress box */}
        <div className="w-full p-6 flex flex-col items-center gap-6 bg-[#FFDED6] mt-4 border-4 border-black rounded-[6px]">
          {/* Animated retro coin/loading graphic */}
          <div className="w-12 h-12 bg-yellow-400 border-4 border-black rounded-full flex items-center justify-center animate-bounce shadow-[3px_3px_0px_#000]">
            <span className="text-black font-bold text-[16px]">$</span>
          </div>

          {/* Progress Bar string representation */}
          <div className="text-center font-bold text-black text-[12px] sm:text-[14px] tracking-widest font-mono">
            [{barString}] {progress}%
          </div>

          {/* Progress Bar visual indicator */}
          <div className="w-full h-8 bg-white border-4 border-black p-1 rounded-sm flex items-center overflow-hidden">
            <div 
              className="h-full bg-[#52AE26] border-r-4 border-black transition-all duration-100 ease-out" 
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Status text */}
          <div className="h-10 flex items-center justify-center text-center">
            <span className="text-[10px] sm:text-[11px] text-[#A93710] font-bold animate-retro-blink uppercase leading-relaxed tracking-wider">
              {statusText}
            </span>
          </div>
        </div>

        {/* Corner pixel details */}
        <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-[#ffffff66]" />
        <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-black" />
        <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-black" />
        <div className="absolute left-2 bottom-2 w-1.5 h-1.5 bg-black" />
        <div className="absolute right-2 bottom-2 w-1.5 h-1.5 bg-black" />
      </div>
    </div>
  );
}
