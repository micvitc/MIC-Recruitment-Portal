"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  onClick?: () => void;
}

let globalAudioCtx: AudioContext | null = null;

export default function BackButton({ onClick }: BackButtonProps) {
  const router = useRouter();

  const playRetroSound = () => {
    if (typeof window === "undefined") return;
    try {
      if (!globalAudioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        globalAudioCtx = new AudioContextClass();
      }
      const ctx = globalAudioCtx;
      if (ctx.state === "suspended") {
        ctx.resume();
      }
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
    } catch (e) {
      console.warn("Audio Context failed", e);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playRetroSound();
    if (onClick) {
      onClick();
    } else {
      // Fallback if history is empty
      if (window.history.length > 2 || document.referrer.includes(window.location.host)) {
        router.back();
      } else {
        router.push("/");
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      className="fixed top-1/2 -translate-y-1/2 left-6 md:left-8 z-[100] w-14 h-14 md:w-16 md:h-16 bg-[#D1D5DB] hover:bg-[#E5E7EB] rounded-full border-4 border-black flex items-center justify-center cursor-pointer"
      style={{ boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)" }}
      title="Go Back"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-1 pointer-events-none">
        <path d="M20 3L6 12L20 21V3Z" fill="black" />
      </svg>
    </button>
  );
}
