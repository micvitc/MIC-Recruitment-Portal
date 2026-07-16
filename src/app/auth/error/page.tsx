"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Press_Start_2P } from "next/font/google";

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

function ErrorContent() {
  const params = useSearchParams();
  const router = useRouter();
  const error = params.get("error");
  const [scale, setScale] = useState(1);

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

  const messages: Record<string, { title: string; body: string }> = {
    AccessDenied: {
      title: "ACCESS DENIED",
      body: "Only @vitstudent.ac.in email addresses are allowed to apply. Please sign in with your VIT student email.",
    },
    Configuration: {
      title: "CONFIG ERROR",
      body: "There is a server configuration issue. Please contact the MIC team.",
    },
    Verification: {
      title: "VERIFICATION FAILED",
      body: "The sign-in link is invalid or has expired.",
    },
  };

  const content = messages[error ?? ""] ?? {
    title: "SIGN-IN ERROR",
    body: "Something went wrong during sign-in. Please try again.",
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

      {/* Error Box */}
      <div className="relative z-40 w-full max-w-[650px] px-4 animate-pixel-slide-up">
        <div 
          className="bg-[#FFE4D6] rounded-[10px] border-4 border-black flex flex-col items-center p-2 relative"
          style={{ boxShadow: "12px 12px 0px 0px rgba(0,0,0,0.4)" }}
        >
          {/* Header */}
          <div className="w-full bg-[#A93710] border-4 border-black rounded-[6px] py-4 flex items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] [background-size:10px_10px]" />
            <span className="text-white text-[12px] md:text-[14px] font-bold tracking-widest relative z-10 drop-shadow-[2px_2px_0px_#000] uppercase">
              ░ {content.title} ░
            </span>
          </div>

          <div className="w-full p-6 md:p-8 flex flex-col items-center gap-6 bg-[#FFDED6] mt-2 border-4 border-black rounded-[6px]">
            
            {/* Pixel Art Error/X Shield Icon */}
            <div className="w-16 h-16 bg-white border-4 border-black flex items-center justify-center p-1.5 shadow-[4px_4px_0px_#000] hover:animate-retro-shake">
              <svg className="w-full h-full pixelated" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 1h12v1H2V1zM2 2h1v9h-1V2zm12 0h1v9h-1V2zm-11 9h1v1H3v-1zm10 0h1v1h-1v-1zm-9 1h1v1H4v-1zm8 0h1v1h-1v-1zm-7 1h1v1H5v-1zm6 0h1v1H6v-1zm-5 1h4v1H6v-1z" fill="#000"/>
                <path d="M3 2h10v7H3V2zm0 7h1v1H3V9zm9 0h1v1h-1V9zm-8 1h1v1H4v-1zm6 0h1v1h-1v-1zm-5 1h4v1H5v-1z" fill="#A93710"/>
                {/* Red X shape in the shield */}
                <path d="M5 4h2v1H5V4zm4 0h2v1H9V4zm1 1h-1v1H9V5zm-2 1H6v1h2V6zm-1 1h1v1H7V7zm-2-2h1v1H5V5zm4 0h1v1H9V5z" fill="#fff"/>
              </svg>
            </div>

            <div className="text-center space-y-4 w-full">
              <h2 className="text-[12px] font-bold text-[#A93710] leading-loose drop-shadow-[1px_1px_0px_#fff] uppercase">
                SYSTEM MESSAGE
              </h2>
              <div className="text-[9px] md:text-[10px] text-black leading-loose font-bold flex flex-col gap-2 max-w-sm text-left mx-auto uppercase">
                <p className="flex items-start gap-2">
                  <span className="text-[#C85A28] shrink-0">►</span> 
                  <span>{content.body}</span>
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex w-full flex-col sm:flex-row gap-4 mt-4">
              <button
                onClick={() => { playRetroSound(); router.push("/recruitments"); }}
                className="flex-1 bg-white hover:bg-slate-100 text-black border-4 border-black py-4 px-4 text-[9px] md:text-[10px] font-bold tracking-widest transition-transform active:translate-y-1 flex items-center justify-center gap-2 cursor-pointer"
                style={{ boxShadow: "4px 4px 0px 0px #000" }}
              >
                Back to Map
              </button>

              <button
                onClick={() => { playRetroSound(); router.push("/login"); }}
                className="flex-1 bg-[#52AE26] hover:bg-[#72F418] text-white border-4 border-black py-4 px-4 text-[9px] md:text-[10px] font-bold tracking-widest transition-transform active:translate-y-1 flex items-center justify-center gap-2 cursor-pointer"
                style={{ boxShadow: "4px 4px 0px 0px #000" }}
              >
                Try Again
              </button>
            </div>

            <div className="w-full text-center mt-2">
              <span className="text-[8px] md:text-[9px] text-[#A93710] font-bold uppercase tracking-widest leading-loose block animate-pulse">
                [ ACCESS RESTRICTED TO VIT ACCOUNTS ]
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

export default function AuthErrorPage() {
  return (
    <Suspense fallback={null}>
      <ErrorContent />
    </Suspense>
  );
}
