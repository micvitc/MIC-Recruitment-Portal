"use client";

import { signIn } from "next-auth/react";
import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Press_Start_2P } from "next/font/google";
import MicLogo from "@/components/MicLogo";
import { playRetroSound } from "@/lib/audio";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
});

export default function AdminLoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (data?.user?.role === "admin") {
          router.replace("/admin/dashboard");
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [router]);



  if (checking) {
    return (
      <div className={`${pressStart.variable} font-press-start min-h-screen bg-slate-950 flex flex-col items-center justify-center select-none`}>
        <div className="text-teal-400 text-[12px] animate-retro-blink uppercase tracking-widest drop-shadow-[2px_2px_0px_#000]">
          VERIFYING ACCESS...
        </div>
      </div>
    );
  }

  return (
    <main
      className={`${pressStart.variable} font-press-start relative min-h-screen w-full flex flex-col items-center justify-center p-4 select-none overflow-hidden bg-[linear-gradient(180deg,#1188EE_0%,#0E8AEA_25%,#1093EB_35%,#1197EC_46%,#16B6F4_52%,#10CBF1_56%,#0FC6F1_60%,#15DEF0_65%,#15DEF0_81%)]`}
    >
      {/* ================= BACKGROUND SKY & CLOUDS ================= */}
      <img
        src="/pixel_cloud_small.svg"
        alt="Cloud"
        className="absolute top-[12%] left-[6%] w-[180px] md:w-[260px] opacity-90 animate-retro-float pixelated pointer-events-none z-0"
      />
      <img
        src="/pixel_cloud_small.svg"
        alt="Cloud"
        className="absolute top-[18%] right-[8%] w-[200px] md:w-[280px] opacity-85 animate-retro-float pixelated pointer-events-none z-0"
        style={{ animationDelay: "1s" }}
      />
      <img
        src="/pixel_cloud_small.svg"
        alt="Cloud"
        className="absolute top-[42%] right-[12%] w-[160px] md:w-[240px] opacity-80 animate-retro-float pixelated pointer-events-none z-0"
        style={{ animationDelay: "2s" }}
      />
      <img
        src="/pixel_cloud_small.svg"
        alt="Cloud"
        className="absolute top-[35%] left-[24%] w-[150px] md:w-[220px] opacity-75 animate-retro-float pixelated pointer-events-none z-0"
        style={{ animationDelay: "0.7s" }}
      />

      {/* ================= TOP LEFT LOGO ================= */}
      <MicLogo />

      {/* ================= TOP RIGHT HOME BUTTON ================= */}
      <button
        onClick={() => {
          playRetroSound();
          router.push("/");
        }}
        className="fixed top-6 right-6 md:right-10 z-50 bg-[#A93710] hover:bg-[#E29A2B] text-white px-4 py-3 border-4 border-black text-[10px] uppercase tracking-widest font-bold transition-transform hover:-translate-y-1 active:translate-y-0"
        style={{ boxShadow: "4px 4px 0px 0px #000" }}
      >
        Home
      </button>

      {/* ================= HANGING WOODEN SIGNBOARD ================= */}
      <div className="relative flex flex-col items-center w-full max-w-[480px] px-2 md:px-4 z-20 my-auto pb-12">
        {/* Hanging Ropes/Chains from Top of Viewport down to board */}
        <div
          className="absolute -top-[600px] left-[20%] w-[12px] h-[605px] pointer-events-none flex flex-col border-x-4 border-black bg-[#B87B21] z-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, #CC9339, #CC9339 8px, #B87B21 8px, #B87B21 16px)",
          }}
        />
        <div
          className="absolute -top-[600px] right-[20%] w-[12px] h-[605px] pointer-events-none flex flex-col border-x-4 border-black bg-[#B87B21] z-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, #CC9339, #CC9339 8px, #B87B21 8px, #B87B21 16px)",
          }}
        />

        {/* Wooden Signboard Main Box */}
        <div
          className="w-full bg-[#C4872B] border-4 border-black p-6 md:p-8 relative rounded-sm flex flex-col z-10"
          style={{ boxShadow: "8px 8px 0px 0px rgba(0,0,0,0.65)" }}
        >
          {/* Bevel highlights */}
          <div className="absolute inset-1 border-t-4 border-l-4 border-[#E5A039] border-b-4 border-r-4 border-[#9E6517] pointer-events-none" />

          {/* Screws */}
          <div className="absolute top-3 left-3 w-3.5 h-3.5 rounded-full bg-[#D4D4D4] border-2 border-black shadow-inner flex items-center justify-center pointer-events-none">
            <div className="w-1.5 h-0.5 bg-[#666] rotate-45" />
          </div>
          <div className="absolute top-3 right-3 w-3.5 h-3.5 rounded-full bg-[#D4D4D4] border-2 border-black shadow-inner flex items-center justify-center pointer-events-none">
            <div className="w-1.5 h-0.5 bg-[#666] rotate-45" />
          </div>
          <div className="absolute bottom-3 left-3 w-3.5 h-3.5 rounded-full bg-[#D4D4D4] border-2 border-black shadow-inner flex items-center justify-center pointer-events-none">
            <div className="w-1.5 h-0.5 bg-[#666] rotate-45" />
          </div>
          <div className="absolute bottom-3 right-3 w-3.5 h-3.5 rounded-full bg-[#D4D4D4] border-2 border-black shadow-inner flex items-center justify-center pointer-events-none">
            <div className="w-1.5 h-0.5 bg-[#666] rotate-45" />
          </div>

          {/* Shield Icon with Retro borders */}
          <div
            className="mx-auto w-16 h-16 bg-[#1093EB] border-4 border-black flex items-center justify-center relative mb-6"
            style={{ boxShadow: "4px 4px 0px 0px #000" }}
          >
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>

          <h1 className="text-center text-[#FFE4D6] text-[16px] md:text-[20px] tracking-wider uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.65)] mb-4">
            Admin Access
          </h1>

          <p className="text-[10px] md:text-[11px] leading-loose text-black uppercase tracking-wider text-center mb-6">
            Sign in with your MIC admin Google account.
          </p>

          <button
            onClick={() => {
              playRetroSound();
              signIn("google", { callbackUrl: "/admin/dashboard" });
            }}
            className="w-full flex items-center justify-center gap-4 py-4 px-6 border-4 border-black bg-white hover:bg-slate-100 text-slate-950 font-bold text-[11px] tracking-wider uppercase transition-transform active:translate-y-1 cursor-pointer"
            style={{ boxShadow: "4px 4px 0px 0px #000" }}
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          <p className="text-[8px] md:text-[9px] leading-relaxed text-[#A93710] text-center uppercase tracking-wide mt-6 font-semibold">
            Access is restricted to accounts with admin role in the MIC database.
          </p>
        </div>
      </div>
    </main>
  );
}
