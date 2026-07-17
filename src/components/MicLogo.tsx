"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function MicLogo() {
  const router = useRouter();

  const playRetroSound = () => {
    if (typeof window === "undefined") return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
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
    } catch (e) {
      console.warn("Audio Context failed", e);
    }
  };

  return (
    <div className="fixed top-6 left-4 z-50 pointer-events-none">
      <img
        src="/mic_logo_pixel.png"
        alt="MIC Logo"
        className="pixelated w-[110px] h-[79px] select-none pointer-events-auto animate-retro-float-small drop-shadow-[4px_4px_0px_rgba(0,0,0,0.6)] cursor-pointer hover:scale-105 transition-transform"
        onClick={() => {
          playRetroSound();
          router.push("/");
        }}
      />
    </div>
  );
}
