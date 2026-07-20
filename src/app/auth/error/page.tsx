"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState, Fragment } from "react";
import { Press_Start_2P } from "next/font/google";
import MicLogo from "@/components/MicLogo";
import BackButton from "@/components/BackButton";
import { playRetroSound } from "@/lib/audio";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
});

function RetroPipe({ height, top, left, right, isTop }: { height: number; top?: string; left?: string; right?: string; isTop: boolean }) {
  return (
    <div
      className="absolute select-none pointer-events-none z-[-1] w-[52px] pixelated"
      style={{
        left,
        right,
        top,
        height: `${height}px`,
        transform: isTop ? "none" : "scaleY(-1)",
        borderStyle: "solid",
        borderWidth: "0 0 24px 0",
        borderColor: "transparent",
        borderImageSource: "url(/green_pipe.png)",
        borderImageSlice: "0 0 64 0 fill",
        borderImageRepeat: "repeat",
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

  const playRetroSoundLocal = () => {
    playRetroSound("jump");
  };

  return (
    <div className={`${pressStart.variable} font-press-start w-full h-[100dvh] overflow-hidden select-none bg-[#DD9955] relative flex justify-center items-center`}>
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

          <img src="/pixel_cloud_large.svg" alt="Skyline" className="absolute top-[566px] left-0 w-[1437px] h-[458px] object-cover opacity-100 pointer-events-none select-none pixelated" />
          <img src="/pixel_cloud_large.svg" alt="Skyline" className="absolute top-[566px] left-[1435px] w-[1437px] h-[458px] object-cover opacity-100 pointer-events-none select-none pixelated" />
          
          {Array.from({ length: 12 }).map((_, idx) => (
            <img key={idx} src="/city_skyline.svg" alt="Skyline Block" className="absolute top-[631px] w-[246px] h-[249px] opacity-75 pointer-events-none select-none pixelated" style={{ left: `${idx * 245}px` }} />
          ))}

          {Array.from({ length: 3 }).map((_, idx) => (
            <img
              key={`bush-${idx}`}
              src="/bushes_pixel.svg"
              alt={`Bushes ${idx}`}
              className="absolute top-[739px] w-[1456px] h-[200px] z-4 pointer-events-none select-none pixelated"
              style={{ left: `${idx * 1409}px` }}
            />
          ))}

          {/* Pipes moved to Foreground Error Box for perfect alignment */}
          

          <div className="absolute top-[925px] left-0 w-full h-[300px] z-25 flex flex-col select-none pointer-events-none">
            <div className="w-full h-5 bg-[#52AE26] border-t-4 border-b-4 border-black flex flex-col justify-between shrink-0">
              <div className="w-full h-[3px] bg-[#72F418]" />
              <div className="w-full h-[3px] bg-[#3FA70E]" />
            </div>
            <div className="w-full flex-grow bg-[#DD9955] border-b-4 border-black relative overflow-hidden flex items-start pt-3">
                <div className="flex whitespace-nowrap animate-marquee">
                  <span className="inline-flex items-center shrink-0 text-[18px] md:text-[22px] text-[#CC7700] tracking-wider uppercase font-bold">
                    {Array(6).fill("MICROSOFT INNOVATIONS CLUB TENURE 2026-2027").map((text, idx) => (
                      <Fragment key={idx}>
                        <span>{text}</span>
                        <img src="/mic_logo_pixel.png" alt="MIC" className="w-8 h-8 md:w-10 md:h-10 mx-8 shrink-0" />
                      </Fragment>
                    ))}
                  </span>
                  <span className="inline-flex items-center shrink-0 text-[18px] md:text-[22px] text-[#CC7700] tracking-wider uppercase font-bold">
                    {Array(6).fill("MICROSOFT INNOVATIONS CLUB TENURE 2026-2027").map((text, idx) => (
                      <Fragment key={idx}>
                        <span>{text}</span>
                        <img src="/mic_logo_pixel.png" alt="MIC" className="w-8 h-8 md:w-10 md:h-10 mx-8 shrink-0" />
                      </Fragment>
                    ))}
                  </span>
                </div>
            </div>
          </div>
        </div>
      </div>

      <MicLogo />
      
      {/* Back Button */}
      <BackButton onClick={() => router.push("/login")} />

      {/* Error Box */}
      <div className="relative z-40 w-full max-w-[650px] px-4 animate-pixel-slide-up mt-10">
        
        {/* Support Pipes - Positioned relative to the box so they never break alignment */}
        <RetroPipe left="48px" top="-400px" height={420} isTop={true} />
        <RetroPipe right="48px" top="-400px" height={420} isTop={true} />

        {/* Retro Window Container */}
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
            
            {/* Flappy Bird Icon */}
            <div className="w-16 h-16 bg-white border-4 border-black flex items-center justify-center p-1.5 shadow-[4px_4px_0px_#000] hover:animate-retro-shake">
              <img src="/flappy_bird.svg" alt="Bird" className="pixelated object-contain w-full h-full animate-retro-float-small" />
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
                onClick={() => { playRetroSoundLocal(); router.push("/recruitments"); }}
                className="flex-1 bg-white hover:bg-slate-100 text-black border-4 border-black py-4 px-4 text-[9px] md:text-[10px] font-bold tracking-widest transition-transform active:translate-y-1 flex items-center justify-center gap-2 cursor-pointer"
                style={{ boxShadow: "4px 4px 0px 0px #000" }}
              >
                Back to Map
              </button>

              <button
                onClick={() => { playRetroSoundLocal(); router.push("/login"); }}
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
