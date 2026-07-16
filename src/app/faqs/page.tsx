"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Press_Start_2P } from "next/font/google";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
});

export default function FaqsPage() {
  const router = useRouter();

  const playRetroSound = (type: "select" | "jump" | "open" | "close") => {
    if (typeof window === "undefined") return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "jump") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === "select") {
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
      } else if (type === "close") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {
      console.warn("Audio Context failed", e);
    }
  };

  const faqs = [
    {
      q: "When will the Recruitments Start?",
      a: "Recruitments officially kick off right after our club orientation session! Keep an eye on our official club announcements and social media channels for exact registration deadlines and interview schedules.",
    },
    {
      q: "What skills do I need to have in common?",
      a: "Curiosity, consistency, and a passion to learn! Whether you are a beginner or an experienced coder/designer, we value proactive teamwork, creative problem-solving, and an eagerness to build impactful projects.",
    },
    {
      q: "How many tasks will be assigned to us in a month?",
      a: "Generally, members work on 1-2 practical team tasks or club projects per month. We ensure the workload remains flexible so you can easily balance coursework alongside club innovations and hackathons.",
    },
    {
      q: "Another question",
      a: "Can I explore both Tech and Non-Tech domains? Yes! You are welcome to explore multiple pathways during recruitments. In the final stage, you will be assigned to the core domain where your skills and interest shine brightest.",
    },
  ];

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

      {/* ================= HOVERING FLAPPY BIRD ================= */}
      <div className="absolute top-[46%] left-[7%] md:left-[10%] z-10 animate-retro-float pointer-events-none">
        <img
          src="/flappy_bird.svg"
          alt="Flappy Bird"
          className="w-[56px] h-[56px] md:w-[72px] md:h-[72px] pixelated drop-shadow-[3px_3px_0px_rgba(0,0,0,0.3)]"
        />
      </div>

      {/* ================= CITY BUILDINGS & BUSHES ALONG HORIZON ================= */}
      <div className="absolute bottom-[60px] md:bottom-[76px] left-0 w-full h-[250px] md:h-[350px] overflow-hidden pointer-events-none z-0 flex items-end">
        {/* Continuous Large Background Cloud Silhouettes */}
        <div className="absolute bottom-0 left-0 flex w-[3000px] opacity-100">
          <img
            src="/pixel_cloud_large.svg"
            alt="Skyline Back Left"
            className="w-[1437px] h-[280px] md:h-[360px] object-cover pixelated shrink-0"
          />
          <img
            src="/pixel_cloud_large.svg"
            alt="Skyline Back Right"
            className="w-[1510px] h-[280px] md:h-[360px] object-cover pixelated shrink-0"
          />
        </div>
        {/* Continuous City Skyline */}
        <div className="absolute bottom-0 left-0 flex w-[3000px] opacity-80 z-1">
          {Array.from({ length: 14 }).map((_, idx) => (
            <img
              key={`city-${idx}`}
              src="/city_skyline.svg"
              alt="City Block"
              className="w-[246px] h-[210px] md:h-[249px] object-cover pixelated shrink-0"
            />
          ))}
        </div>
        {/* Continuous Green Bushes right above soil */}
        <div className="absolute bottom-0 left-0 flex w-[3000px] z-1">
          <img
            src="/bushes_pixel.svg"
            alt="Bushes"
            className="w-[1456px] h-[120px] md:h-[160px] object-cover pixelated shrink-0 opacity-95"
          />
          <img
            src="/bushes_pixel.svg"
            alt="Bushes Right"
            className="w-[1456px] h-[120px] md:h-[160px] object-cover pixelated shrink-0 opacity-95"
          />
        </div>
      </div>

      {/* ================= SCROLLING SOIL GROUND PLATFORM ================= */}
      <div className="absolute bottom-0 left-0 w-full h-[60px] md:h-[76px] z-10 flex flex-col select-none pointer-events-none">
        {/* Green Grass Trim */}
        <div className="w-full h-4 md:h-5 bg-[#52AE26] border-t-4 border-b-4 border-black flex flex-col justify-between shrink-0">
          <div className="w-full h-[3px] bg-[#72F418]" />
          <div className="w-full h-[3px] bg-[#3FA70E]" />
        </div>
        {/* Soil Base with Marquee Text */}
        <div className="w-full flex-grow bg-[#DD9955] border-b-4 border-black relative overflow-hidden flex items-center">
          <div className="flex whitespace-nowrap animate-marquee">
            <span className="inline-block text-[18px] md:text-[22px] text-[#CC7700] tracking-wider uppercase font-bold pr-10">
              {Array(6).fill("MICROSOFT INNOVATIONS CLUB TENURE 2026-2027").join("  ★  ")}
            </span>
            <span className="inline-block text-[18px] md:text-[22px] text-[#CC7700] tracking-wider uppercase font-bold pr-10">
              {Array(6).fill("MICROSOFT INNOVATIONS CLUB TENURE 2026-2027").join("  ★  ")}
            </span>
          </div>
        </div>
      </div>

      {/* ================= TOP LEFT LOGO ================= */}
      <div className="absolute left-6 top-6 z-30 flex items-center gap-3">
        <img
          src="/mic_logo_pixel.png"
          alt="MIC Logo"
          className="w-[85px] h-[61px] md:w-[110px] md:h-[79px] pixelated pointer-events-none"
        />
      </div>

      {/* ================= TOP RIGHT CLOSE BUTTON (Close_icon.svg) ================= */}
      <button
        onClick={() => {
          playRetroSound("close");
          router.push("/recruitments");
        }}
        className="fixed top-6 right-6 md:right-10 z-50 cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-100 flex items-center justify-center select-none"
        title="Back to Recruitments"
      >
        <img
          src="/Close_icon.svg"
          alt="Close"
          className="w-[40px] h-[38px] md:w-[46px] md:h-[44px] pixelated pointer-events-none"
        />
      </button>

      {/* ================= HANGING WOODEN SIGNBOARD (CENTERED) ================= */}
      <div className="relative flex flex-col items-center w-full max-w-[760px] px-2 md:px-4 z-20 my-auto pb-12">
        {/* Hanging Ropes/Chains from Top of Viewport down to board */}
        <div
          className="absolute -top-[600px] left-[20%] w-[18px] h-[605px] pointer-events-none flex flex-col border-x-4 border-black bg-[#B87B21] z-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, #CC9339, #CC9339 8px, #B87B21 8px, #B87B21 16px)",
          }}
        />
        <div
          className="absolute -top-[600px] right-[20%] w-[18px] h-[605px] pointer-events-none flex flex-col border-x-4 border-black bg-[#B87B21] z-0"
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
          {/* Authentic Retro Bevel Border Highlights & Shadows */}
          <div className="absolute inset-1 border-t-4 border-l-4 border-[#E5A039] border-b-4 border-r-4 border-[#9E6517] pointer-events-none" />

          {/* 4 Silver Corner Screws/Nails */}
          <div className="absolute top-3 left-3 w-3.5 h-3.5 rounded-full bg-[#D4D4D4] border-2 border-black shadow-inner flex items-center justify-center pointer-events-none z-10">
            <div className="w-1.5 h-0.5 bg-[#666] rotate-45" />
          </div>
          <div className="absolute top-3 right-3 w-3.5 h-3.5 rounded-full bg-[#D4D4D4] border-2 border-black shadow-inner flex items-center justify-center pointer-events-none z-10">
            <div className="w-1.5 h-0.5 bg-[#666] rotate-45" />
          </div>
          <div className="absolute bottom-3 left-3 w-3.5 h-3.5 rounded-full bg-[#D4D4D4] border-2 border-black shadow-inner flex items-center justify-center pointer-events-none z-10">
            <div className="w-1.5 h-0.5 bg-[#666] rotate-45" />
          </div>
          <div className="absolute bottom-3 right-3 w-3.5 h-3.5 rounded-full bg-[#D4D4D4] border-2 border-black shadow-inner flex items-center justify-center pointer-events-none z-10">
            <div className="w-1.5 h-0.5 bg-[#666] rotate-45" />
          </div>

          {/* Header Text: Have some questions? */}
          <h1 className="text-center font-press-start text-[#FFB59F] text-[18px] md:text-[22px] tracking-wider uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)] mt-2 mb-6 z-10">
            Have some questions?
          </h1>

          {/* Accordion FAQ Questions List (shadcn Accordion) */}
          <Accordion
            type="single"
            collapsible
            className="w-full flex flex-col z-10 max-h-[55vh] overflow-y-auto pr-1 retro-scrollbar"
          >
            {faqs.map((faq, idx) => (
              <AccordionItem key={`faq-item-${idx}`} value={`item-${idx}`}>
                <AccordionTrigger onPlaySound={() => playRetroSound("select")}>
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent>
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </main>
  );
}
