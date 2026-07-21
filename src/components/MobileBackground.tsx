import React from 'react';

export default function MobileBackground({ children }: { children?: React.ReactNode }) {
  const MARQUEE_TEXT = "MICROSOFT INNOVATIONS CLUB TENURE 2026-2027";

  return (
    <div className="relative w-full h-[100dvh] flex flex-col overflow-hidden select-none bg-[#1093EB]">
      {/* Background Gradient */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{
        background: "linear-gradient(180deg,#1188EE 0%,#0E8AEA 25%,#1093EB 35%,#1197EC 46%,#16B6F4 52%,#10CBF1 56%,#0FC6F1 60%,#15DEF0 65%,#15DEF0 81%)"
      }} />

      {/* Scattered Sky Clouds (from desktop) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img src="/pixel_cloud_small.svg" alt="" className="absolute top-[90px] left-[10px] w-[120px] opacity-75 animate-retro-float pixelated" style={{ animationDelay: "0.3s" }} />
        <img src="/pixel_cloud_small.svg" alt="" className="absolute top-[50px] right-[15px] w-[100px] opacity-65 animate-retro-float pixelated" style={{ animationDelay: "1.1s" }} />
        <img src="/pixel_cloud_small.svg" alt="" className="absolute top-[220px] right-[40px] w-[80px] opacity-55 animate-retro-float pixelated" style={{ animationDelay: "0.6s" }} />
        <img src="/pixel_cloud_small.svg" alt="" className="absolute top-[300px] left-[20px] w-[90px] opacity-50 animate-retro-float pixelated" style={{ animationDelay: "1.8s" }} />
      </div>

      {/* Main Content Area (Children) */}
      <div className="relative z-10 flex-grow flex flex-col w-full overflow-y-auto overflow-x-hidden">
        {children}
        <div className="flex-grow" /> {/* Push background to bottom */}
        
        {/* ── Massive Bottom Scene (Matches image_2.png) ── */}
        <div className="relative w-full flex-shrink-0 mt-8 pointer-events-none" style={{ height: "260px" }}>
          
          {/* City Skyline */}
          <div className="absolute w-full overflow-hidden flex" style={{ bottom: "30px", height: "220px" }}>
             {Array.from({ length: 4 }).map((_, i) => (
               <img key={`city-${i}`} src="/city_skyline.svg" alt="" className="h-full pixelated opacity-75 flex-shrink-0" style={{ width: "45%", marginLeft: i === 0 ? "0" : "-5%" }} />
             ))}
          </div>
          
          {/* Lush Grass/Bushes */}
          <div className="absolute w-full z-10" style={{ bottom: "25px", height: "150px" }}>
             <div className="w-full h-full pixelated animate-none" style={{
               backgroundImage: "url(/bushes_pixel.svg)",
               backgroundRepeat: "repeat-x",
               backgroundSize: "auto 100%",
               backgroundPosition: "bottom"
             }} />
          </div>
          
          {/* Ground Strip (Checker Pattern) */}
          <div 
            className="absolute bottom-0 w-full border-t-[4px] border-black border-b-[4px] z-20" 
            style={{ 
              height: "35px", 
              background: "repeating-linear-gradient(45deg, #72F418, #72F418 12px, #52AE26 12px, #52AE26 24px)" 
            }} 
          />
        </div>
      </div>

      {/* Footer Marquee */}
      <div className="relative z-20 w-full flex-shrink-0 bg-[#DD9955] border-t-[4px] border-black overflow-hidden flex items-start pt-2" style={{ height: "60px" }}>
        <div className="flex whitespace-nowrap animate-marquee">
          <span className="inline-flex items-center shrink-0 text-[18px] text-[#CC7700] tracking-wider uppercase font-bold">
            {Array(6).fill(MARQUEE_TEXT).map((text, idx) => (
              <React.Fragment key={`mq1-${idx}`}>
                <span>{text}</span>
                <img src="/mic_logo_pixel.png" alt="MIC" className="w-6 h-6 mx-4 shrink-0" />
              </React.Fragment>
            ))}
          </span>
          <span className="inline-flex items-center shrink-0 text-[18px] text-[#CC7700] tracking-wider uppercase font-bold">
            {Array(6).fill(MARQUEE_TEXT).map((text, idx) => (
              <React.Fragment key={`mq2-${idx}`}>
                <span>{text}</span>
                <img src="/mic_logo_pixel.png" alt="MIC" className="w-6 h-6 mx-4 shrink-0" />
              </React.Fragment>
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}
