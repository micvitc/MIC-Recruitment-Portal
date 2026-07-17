"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Press_Start_2P } from "next/font/google";
import DepartmentPopup, { DepartmentData } from "@/components/DepartmentPopup";
import { Loader2 } from "lucide-react";
import posthog from "posthog-js";
import RetroLoader from "@/components/RetroLoader";
import MicLogo from "@/components/MicLogo";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
});

const ROLE_TO_SLUG: Record<string, string> = {
  "UI/UX": "ui-ux",
  "AI/ML": "ai-ml",
  "Content & Media": "content-media",
};

interface QuestCardProps {
  title: string;
  desc: string;
  role: string;
  state: "available" | "selected" | "disabled";
  progressStatus?: string; // e.g. "in-progress", "passed", "pending"
  onSelect: () => void;
}

function QuestCard({ title, desc, role, state, progressStatus, onSelect }: QuestCardProps) {
  const isSelected = state === "selected";
  const isDisabled = state === "disabled";

  return (
    <div
      onClick={isDisabled ? undefined : onSelect}
      className={`w-[371px] h-[262px] flex flex-col items-start p-1 rounded-[10px] border-4 border-solid border-black relative shrink-0 select-none transition-all duration-150 ${
        isDisabled
          ? "bg-[#FFB59F]"
          : isSelected
          ? "bg-white cursor-pointer hover:-translate-y-3 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98]"
          : "bg-[#FFB59F] cursor-pointer hover:-translate-y-3 hover:scale-[1.02] active:translate-y-0 active:scale-[0.98]"
      } group`}
      style={{ boxShadow: "6px 6px 0px 0px rgba(0,0,0,0.15)" }}
    >
      {/* Card Header Tag */}
      <div className={`flex flex-col items-center py-2 relative self-stretch w-full rounded-[6px] border-b-4 border-solid border-black ${isSelected ? "bg-[#E29A2B]" : "bg-[#A93710]"}`}>
        <div className="relative flex items-center justify-center w-fit text-white drop-shadow-[2px_2px_0px_#000] font-bold text-[12px] tracking-wider uppercase leading-none whitespace-nowrap">
          {title}
        </div>
      </div>

      {/* Inner White Box */}
      <div className={`flex-grow w-full p-3 rounded-b-[6px] flex items-center justify-center ${isSelected ? "bg-[#FFF4E6]" : "bg-[#FFDED6]"}`}>
        <div className={`w-full h-full ${isDisabled ? "bg-[#FFCDC0]" : "bg-white"} border-4 border-solid border-black p-3.5 flex flex-col items-center justify-center text-center ${isSelected ? "gap-4" : ""}`}>
          <p className={`text-[10px] font-bold tracking-wide leading-relaxed uppercase ${isDisabled ? "text-[#A93710] drop-shadow-[1px_1px_0px_#fff]" : "text-black"}`}>
            {isDisabled ? "YOU HAVE ALREADY APPLIED FOR A SIMILAR QUEST" : isSelected ? "WANNA RECHECK YOUR GEAR FOR THE QUEST?" : desc}
          </p>
          
          {isSelected && progressStatus && (
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-[#E29A2B] text-black text-[9px] font-bold px-2 py-1 border-2 border-black uppercase tracking-wider">
                STATUS
              </span>
              <span className="bg-[#52AE26] text-white text-[9px] font-bold px-2 py-1 border-2 border-black uppercase tracking-wider shadow-[2px_2px_0px_#000]">
                {progressStatus.replace("-", " ")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Decorative Corner Pixels */}
      <div className="absolute top-1.5 left-1.5 w-1 h-1 bg-[#ffffff66]" />
      <div className="absolute top-1.5 left-1.5 w-1 h-1 bg-black" />
      <div className="absolute top-1.5 right-1.5 w-1 h-1 bg-black" />
      <div className="absolute left-1.5 bottom-1.5 w-1 h-1 bg-black" />
      <div className="absolute right-1.5 bottom-1.5 w-1 h-1 bg-black" />
    </div>
  );
}

function RetroPipe({ height, top, left, isTop }: { height: number; top: string; left: string; isTop: boolean }) {
  return (
    <div
      className="absolute select-none pointer-events-none z-10 w-[52px] pixelated"
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

function NormalArrow({ top, left, width = 50, height = 30 }: { top: string; left: string; width?: number; height?: number }) {
  return (
    <div
      className="absolute z-20 select-none pointer-events-none flex items-center justify-center transition-transform hover:scale-105"
      style={{ top, left, width: `${width}px`, height: `${height}px` }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 64 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[3px_3px_0px_rgba(0,0,0,0.35)] overflow-visible"
      >
        {/* Clean, sleek, normal arrow icon (non-pixelated, smooth diagonal lines and arrowhead) */}
        <path
          d="M3 14H44V5L62 18L44 31V22H3V14Z"
          fill="white"
          stroke="black"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
interface StageProgress {
  stage: number;
  result: "pending" | "passed" | "failed";
  submittedAt: string;
  adminNote?: string;
  responses: Record<string, unknown>;
}

interface ApplicationStatus {
  overallStatus: "in-progress" | "selected" | "rejected" | "waitlisted";
  firstPreference: string;
  firstPrefType: "tech" | "non-tech";
  secondPreference?: string;
  secondPrefType?: "tech" | "non-tech";
  firstPrefProgress: {
    status: "active" | "passed" | "rejected" | "pending";
    currentStage: number;
    stages: StageProgress[];
  };
  secondPrefProgress: {
    status: "active" | "passed" | "rejected" | "pending";
    currentStage: number;
    stages: StageProgress[];
  };
}

function playRetroSound(type: "select" | "jump" | "open" | "close" | "die") {
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
    } else if (type === "die") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch (e) {
    console.warn("Audio Context failed", e);
  }
}


export default function RecruitmentsPage() {
  const router = useRouter();
  const [selectedDepartment, setSelectedDepartment] = useState<DepartmentData | null>(null);
  const [birdScore, setBirdScore] = useState(0);
  const [birdFlap, setBirdFlap] = useState(false);
  const [isDead, setIsDead] = useState(false);
  const [scale, setScale] = useState(1);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const birdContainerRef = useRef<HTMLDivElement>(null);
  const birdSpriteRef = useRef<HTMLDivElement>(null);
  const lastScrollXRef = useRef(0);
  const latestScrollXRef = useRef(0);
  const latestScaleRef = useRef(1);
  const [scrollX, setScrollX] = useState(0);
  const [isScrollingLeft, setIsScrollingLeft] = useState(false);

  // Application State
  const [appStatus, setAppStatus] = useState<ApplicationStatus | null>(null);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [isLoadingApp, setIsLoadingApp] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // Backend design & dynamic configuration state
  const [techQuests, setTechQuests] = useState<DepartmentData[]>([]);
  const [nonTechQuests, setNonTechQuests] = useState<DepartmentData[]>([]);
  const [pageTitle, setPageTitle] = useState("Recruitments");
  const [pageSubtitle, setPageSubtitle] = useState("CHOOSE THE QUEST SUITS YOU THE MOST");

  const birdPhysicsRef = useRef({
    currentX: 0,
    currentY: 0,
    velocityY: 0,
    time: 0,
    isDead: false,
    rotation: 0,
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollX = e.currentTarget.scrollLeft;
    latestScrollXRef.current = currentScrollX;
    setScrollX(currentScrollX);

    if (currentScrollX < lastScrollXRef.current - 1) {
      setIsScrollingLeft(true);
    } else if (currentScrollX > lastScrollXRef.current + 1) {
      setIsScrollingLeft(false);
    }
    lastScrollXRef.current = currentScrollX;
  };

  // Responsive Scaling Matrix to fit viewport height perfectly
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== "undefined") {
        const heightScale = window.innerHeight / 1024;
        const cappedScale = Math.min(heightScale, 1.2); // Cap scale to prevent heavy pixel stretch
        latestScaleRef.current = cappedScale;
        setScale(cappedScale);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchStatus = useCallback(async () => {
    setIsLoadingApp(true);
    setError(null);
    try {
      const [statusRes, configRes] = await Promise.all([
        fetch(`/api/apply/status?t=${Date.now()}`),
        fetch(`/api/pages/recruitments?t=${Date.now()}`)
      ]);

      if (statusRes.ok && configRes.ok) {
        const statusData = await statusRes.json();
        const configData = await configRes.json();
        
        setAppStatus(statusData.application);
        setUser(statusData.user);
        setTechQuests(configData.techQuests || []);
        setNonTechQuests(configData.nonTechQuests || []);
        setPageTitle(configData.title || "Recruitments");
        setPageSubtitle(configData.subtitle || "CHOOSE THE QUEST SUITS YOU THE MOST");
      } else {
        if (statusRes.status === 429 || configRes.status === 429) {
          setError("API RATE LIMIT EXCEEDED. PLEASE WAIT A MOMENT AND TRY AGAIN.");
        } else {
          setError("FAILED TO CONNECT TO SERVER. PLEASE RETRY.");
        }
      }
    } catch (err) {
      console.error("Failed to fetch page configuration & status", err);
      setError("NETWORK ERROR. PLEASE CHECK YOUR CONNECTION.");
    } finally {
      setIsLoadingApp(false);
    }
  }, []);

  // Fetch application status
  useEffect(() => {
    let active = true;
    const init = async () => {
      if (active) {
        await fetchStatus();
      }
    };
    init();
    return () => {
      active = false;
    };
  }, [fetchStatus]);

  // Ultra-Smooth GPU Physics Engine for Flappy Bird (native 60/120fps camera follow & jump arcs)
  useEffect(() => {
    let animationFrameId: number;

    const renderLoop = () => {
      if (birdContainerRef.current && birdSpriteRef.current) {
        const p = birdPhysicsRef.current;
        p.time += 0.045;

        // 1. Smooth Camera-Follow Glide along horizontal scroll (lerp)
        const targetX = latestScrollXRef.current / (latestScaleRef.current || 1);
        p.currentX += (targetX - p.currentX) * 0.14; // Organic 14% damping per frame

        // 2. Vertical Floating Breathing Bob & Flapping Jump Physics
        const baseFloatY = Math.sin(p.time) * 11; // Smooth 11px sine wave hover
        let totalY = baseFloatY + p.currentY;
        const tiltAngle = Math.max(-25, Math.min(30, p.velocityY * 2));

        if (!p.isDead) {
          if (p.velocityY !== 0 || Math.abs(p.currentY) > 0.05) {
            p.currentY += p.velocityY;
            p.velocityY += 1.15; // Smooth gravity pull

            if (p.currentY >= 0 && p.velocityY > 0) {
              p.currentY = 0;
              p.velocityY = 0;
            }
          }
          p.rotation = tiltAngle;

          // Check hit top boundary
          if (p.currentY < -480) {
            p.isDead = true;
            p.velocityY = 0; // stop upward movement
            setIsDead(true);
            setBirdScore(0);
            playRetroSound("die");
          }
        } else {
          // Dying animation
          p.currentY += p.velocityY;
          p.velocityY += 1.5; // Fast gravity
          p.rotation += 15; // Spin out of control
          totalY = p.currentY; // Ignore sine wave hover when dead

          // Revive when off-screen bottom
          if (p.currentY > 600) {
            p.isDead = false;
            p.currentY = 0;
            p.velocityY = 0;
            p.rotation = 0;
            setIsDead(false);
          }
        }

        // Apply direct GPU-accelerated transform without CSS layout thrashing or transition lag
        birdContainerRef.current.style.transform = `translate3d(${p.currentX}px, 0px, 0px)`;
        birdSpriteRef.current.style.transform = `translate3d(0px, ${totalY}px, 0px) rotate(${p.rotation}deg)`;
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Keyboard navigation for horizontal scrolling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!scrollContainerRef.current) return;
      if (e.key === "ArrowRight") {
        scrollContainerRef.current.scrollBy({ left: 180, behavior: "smooth" });
      } else if (e.key === "ArrowLeft") {
        scrollContainerRef.current.scrollBy({ left: -180, behavior: "smooth" });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Map vertical wheel scroll to horizontal scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Only map if vertical scroll is dominant
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        container.scrollBy({ left: e.deltaY, behavior: "auto" });
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  const handleOpenPopup = (quest: DepartmentData, type: "tech" | "non-tech", slug: string) => {
    if (isLoadingApp) return;

    // Check if they already applied to this department
    const isFirstPref = appStatus?.firstPreference === slug;
    const isSecondPref = appStatus?.secondPreference === slug;

    if (isFirstPref || isSecondPref) {
      playRetroSound("select");
      const currentStage = isFirstPref ? appStatus.firstPrefProgress.currentStage : appStatus.secondPrefProgress.currentStage;
      posthog.capture("Quest Resume Clicked", { slug, stage: currentStage });
      router.push(`/apply/${slug}/stage-${currentStage}`);
      return;
    }

    // Check if they are locked out of this type
    if (appStatus?.firstPreference && appStatus.firstPrefType === type && !isFirstPref) {
      playRetroSound("die");
      return; // Disabled
    }
    if (appStatus?.secondPreference && appStatus.secondPrefType === type && !isSecondPref) {
      playRetroSound("die");
      return; // Disabled
    }

    playRetroSound("open");
    setSelectedDepartment(quest);
  };

  const handleApplyFromPopup = async (role: string) => {
    if (isApplying) return;
    
    if (!user) {
      router.push("/login?callbackUrl=/recruitments");
      return;
    }

    setIsApplying(true);
    playRetroSound("select");
    
    try {
      if (!appStatus) {
        // Init first preference
        const res = await fetch("/api/apply/init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firstPreference: role }),
        });
        const data = await res.json();
        if (data.success) {
          posthog.capture("First Preference Selected", { department: role });
          router.push(`/apply/${role}/stage-1`);
        } else {
          alert(data.error);
          setIsApplying(false);
        }
      } else if (!appStatus.secondPreference) {
        // Init second preference
        const res = await fetch("/api/apply/second-pref", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ secondPreference: role }),
        });
        const data = await res.json();
        if (data.success) {
          posthog.capture("Second Preference Selected", { department: role });
          router.push(`/apply/${role}/stage-1`);
        } else {
          alert(data.error);
          setIsApplying(false);
        }
      }
    } catch (err) {
      alert("Something went wrong");
      setIsApplying(false);
    }
  };

  const handleBirdClick = () => {
    if (birdPhysicsRef.current.isDead) return;
    playRetroSound("jump");
    setBirdScore((prev) => prev + 1);
    birdPhysicsRef.current.velocityY = -15; // Smooth instant upward jump arc in GPU physics loop
  };



  // Dynamic quests lists are fetched from backend on load

  return (
    <div
      className={`${pressStart.variable} font-press-start w-full h-[100dvh] overflow-x-auto overflow-y-hidden retro-scrollbar select-none bg-[#DD9955] relative`}
      ref={scrollContainerRef}
      onScroll={handleScroll}
    >
      {/* Floating Header Buttons (Fixed) */}
      <div className="fixed top-6 right-6 z-50 flex items-center gap-4">
        <button
          onClick={() => {
            playRetroSound("open");
            router.push("/faqs");
          }}
          className="bg-[#7CA922] hover:bg-[#8CB932] text-black px-4 py-3 border-4 border-black text-[12px] uppercase tracking-widest font-bold transition-transform hover:-translate-y-1 active:translate-y-0"
          style={{ boxShadow: "4px 4px 0px 0px #000" }}
        >
          FAQS
        </button>
        {user ? (
          <button
            onClick={() => router.push("/profile")}
            className="bg-[#1093EB] hover:bg-[#16B6F4] text-white px-4 py-3 border-4 border-black text-[12px] uppercase tracking-widest font-bold transition-transform hover:-translate-y-1 active:translate-y-0"
            style={{ boxShadow: "4px 4px 0px 0px #000" }}
          >
            VIEW PROFILE
          </button>
        ) : (
          <button
            onClick={() => router.push("/login?callbackUrl=/recruitments")}
            className="bg-[#1093EB] hover:bg-[#16B6F4] text-white px-4 py-3 border-4 border-black text-[12px] uppercase tracking-widest font-bold transition-transform hover:-translate-y-1 active:translate-y-0 flex items-center gap-2"
            style={{ boxShadow: "4px 4px 0px 0px #000" }}
          >
            <div className="bg-white rounded-full p-[2px] flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
            SIGN IN
          </button>
        )}
      </div>

      {/* Fixed Title Banner */}
      <div 
        className="fixed z-40 origin-top-left pointer-events-none"
        style={{ 
          left: `${320 * scale}px`, 
          top: `${24 * scale}px`, 
          transform: `scale(${scale})` 
        }}
      >
        <div 
          className="bg-black border-4 border-black px-8 py-6 flex flex-col items-start justify-center pointer-events-auto" 
          style={{ boxShadow: "8px 8px 0px 0px rgba(0,0,0,0.5)" }}
        >
          <h1 className="font-normal text-white text-[64px] tracking-[0] leading-[67px] uppercase whitespace-nowrap">
            {pageTitle}
          </h1>
          <p className="text-[12px] text-white font-bold tracking-[0] leading-[21px] mt-2 uppercase">
            {pageSubtitle}
          </p>
        </div>
      </div>

      {/* Fixed Logo */}
      <MicLogo />
      {error && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <div className="bg-[#FFE4D6] border-4 border-black p-8 max-w-lg w-full relative flex flex-col items-center gap-6" style={{ boxShadow: "8px 8px 0px 0px rgba(0,0,0,0.5)" }}>
            <div className="absolute top-0 left-0 w-full h-1 bg-white/50" />
            
            <div className="bg-[#A93710] text-white px-4 py-2 border-2 border-black text-[12px] uppercase tracking-widest font-bold -mt-12 mb-2" style={{ boxShadow: "4px 4px 0px 0px #000" }}>
              CONNECTION ERROR
            </div>

            <div className="text-[#A93710] text-[12px] sm:text-[14px] text-center leading-loose uppercase tracking-widest font-bold">
              {error}
            </div>

            <button 
              onClick={() => fetchStatus()}
              className="mt-2 bg-[#E29A2B] hover:bg-[#F0AD3D] border-4 border-black py-3 px-8 text-[12px] font-bold text-black uppercase tracking-wider active:scale-95 transition-transform"
              style={{ boxShadow: "4px 4px 0px 0px #000" }}
            >
              RETRY CONNECTION
            </button>
          </div>
        </div>
      )}

      <RetroLoader isLoading={isLoadingApp} title="LOADING MAP" />

      {/* Sized container to calculate correct scroll boundaries post-scaling */}
      <div
        style={{
          width: `${2865 * scale}px`,
          height: `${1024 * scale}px`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Pixel-Perfect Figma Canvas Sized at 2865x1024 and scaled using CSS Transform */}
        <div
          className="w-[2865px] h-[1024px] absolute top-0 left-0 bg-[linear-gradient(180deg,#1188EE_0%,#0E8AEA_25%,#1093EB_35%,#1197EC_46%,#16B6F4_52%,#10CBF1_56%,#0FC6F1_60%,#15DEF0_65%,#15DEF0_81%)] overflow-hidden origin-top-left"
          style={{
            transform: `scale(${scale})`,
          }}
        >
          {/* Floating Clouds (Figma Positions) */}
          <img
            src="/pixel_cloud_small.svg"
            alt="Cloud"
            className="absolute top-[300px] left-[1060px] w-[280px] opacity-85 animate-retro-float pixelated select-none pointer-events-none"
            style={{ animationDelay: "0s" }}
          />
          <img
            src="/pixel_cloud_small.svg"
            alt="Cloud"
            className="absolute top-[140px] left-[-40px] w-[320px] opacity-80 animate-retro-float pixelated select-none pointer-events-none"
            style={{ animationDelay: "1s" }}
          />
          <img
            src="/pixel_cloud_small.svg"
            alt="Cloud"
            className="absolute top-[39px] left-[1167px] w-[360px] opacity-90 animate-retro-float pixelated select-none pointer-events-none"
            style={{ animationDelay: "0.5s" }}
          />
          <img
            src="/pixel_cloud_small.svg"
            alt="Cloud"
            className="absolute top-[333px] left-[2509px] w-[260px] opacity-75 animate-retro-float pixelated select-none pointer-events-none"
            style={{ animationDelay: "1.8s" }}
          />
          <img
            src="/pixel_cloud_small.svg"
            alt="Cloud"
            className="absolute top-[140px] left-[1312px] w-[320px] opacity-85 animate-retro-float pixelated select-none pointer-events-none"
            style={{ animationDelay: "2.3s" }}
          />
          <img
            src="/pixel_cloud_small.svg"
            alt="Cloud"
            className="absolute top-[39px] left-[2519px] w-[360px] opacity-90 animate-retro-float pixelated select-none pointer-events-none"
            style={{ animationDelay: "0.2s" }}
          />

          {/* Background Skyline Silhouettes (Figma Positions) */}
          <img
            src="/pixel_cloud_large.svg"
            alt="Skyline Back Left"
            className="absolute top-[566px] left-0 w-[1437px] h-[458px] object-cover opacity-100 pointer-events-none select-none pixelated"
          />
          <img
            src="/pixel_cloud_large.svg"
            alt="Skyline Back Right"
            className="absolute top-[565px] left-[1389px] w-[1510px] h-[465px] object-cover opacity-100 pointer-events-none select-none pixelated"
          />

          {/* Midground Skyline Blocks (Continuous without gaps across 2865px canvas) */}
          {Array.from({ length: 12 }).map((_, idx) => (
            <img
              key={idx}
              src="/city_skyline.svg"
              alt="Skyline Block"
              className="absolute top-[631px] w-[246px] h-[249px] opacity-75 pointer-events-none select-none pixelated"
              style={{ left: `${idx * 245}px` }}
            />
          ))}
          {/* Green Bushes Silhouettes (Continuous without gaps across 2865px canvas) */}
          {Array.from({ length: 3 }).map((_, idx) => (
            <img
              key={`bush-${idx}`}
              src="/bushes_pixel.svg"
              alt={`Bushes ${idx}`}
              className="absolute top-[739px] w-[1456px] h-[200px] z-4 pointer-events-none select-none pixelated"
              style={{ left: `${idx * 1409}px` }}
            />
          ))}

          {/* Green Mario Pipes (Exact Figma Positions & Heights) */}
          {/* Top Pipes (pointing down) */}
          <RetroPipe left="169px" top="-4px" height={391} isTop={true} />
          <RetroPipe left="746px" top="-5px" height={468} isTop={true} />
          <RetroPipe left="1234px" top="-5px" height={443} isTop={true} />
          <RetroPipe left="1723px" top="0px" height={391} isTop={true} />
          <RetroPipe left="2214px" top="-1px" height={461} isTop={true} />
          <RetroPipe left="2705px" top="-45px" height={461} isTop={true} />

          {/* Bottom Pipes (pointing up) */}
          <RetroPipe left="196px" top="607px" height={301} isTop={false} />
          <RetroPipe left="909px" top="602px" height={301} isTop={false} />
          <RetroPipe left="1396px" top="545px" height={358} isTop={false} />
          <RetroPipe left="1885px" top="570px" height={333} isTop={false} />
          <RetroPipe left="2375px" top="602px" height={301} isTop={false} />







          {/* Score Counter (Flappy Bird Interaction) */}
          {birdScore > 0 && (
            <div className="absolute right-[160px] top-8 z-30 bg-black/80 border-4 border-black p-3 text-[11px] text-yellow-400 retro-shadow">
              FLAPS: {birdScore}
            </div>
          )}



          {/* Interactive Flappy Bird Character (Ultra-Smooth 60/120fps GPU Physics Engine) */}
          <div 
            ref={birdContainerRef}
            className="absolute z-25 cursor-pointer will-change-transform select-none"
            style={{ top: "480px", left: "240px" }}
            onClick={handleBirdClick}
          >
            <div ref={birdSpriteRef} className="will-change-transform origin-center">
              <img
                src="/flappy_bird.svg"
                alt="Flappy Bird"
                className={`w-[72px] h-[72px] pixelated drop-shadow-[3px_3px_0px_rgba(0,0,0,0.3)] transition-[transform,filter] duration-150 select-none pointer-events-none ${isScrollingLeft ? "scale-x-[-1]" : "scale-x-[1]"} ${isDead ? "grayscale brightness-50" : "hover:scale-110 active:scale-95"}`}
              />
            </div>
            {!isDead && (
              <div className="bg-black/80 text-[7px] text-white px-1.5 py-0.5 border border-black rounded-sm text-center -mt-2 animate-pulse whitespace-nowrap text-[8px] uppercase select-none pointer-events-none">
                TAP BIRD!
              </div>
            )}
          </div>

          {/* ================= TECH ROW ================= */}
          {/* Tech signboard */}
          <div 
            className="absolute bg-[#B87B21] text-black text-[22px] font-bold border-4 border-black z-20 flex items-center justify-center uppercase tracking-wider"
            style={{ 
              left: "64px", 
              top: "313px", 
              width: "240px", 
              height: "80px",
              boxShadow: "6px 6px 0px 0px #000"
            }}
          >
            TECH
          </div>

          <NormalArrow top="338px" left="305px" width={44} height={28} />

          {/* Tech Cards (Centered perfectly between exact Figma pipes without overlaps) */}
          {techQuests.map((q, idx) => {
            const leftPositions = [350, 830, 1319, 1809, 2300];
            const slug = ROLE_TO_SLUG[q.role] ?? q.role.toLowerCase().replace(/\s+/g, "-");
            
            let state: "available" | "selected" | "disabled" = "available";
            let progressStatus = undefined;

            if (appStatus?.firstPreference === slug) {
              state = "selected";
              progressStatus = appStatus.firstPrefProgress.status;
            } else if (appStatus?.secondPreference === slug) {
              state = "selected";
              progressStatus = appStatus.secondPrefProgress.status;
            } else if (appStatus?.firstPrefType === "tech" || appStatus?.secondPrefType === "tech") {
              state = "disabled";
            }

            return (
              <div
                key={`tech-card-${idx}`}
                className="absolute"
                style={{ left: `${leftPositions[idx]}px`, top: "211px", zIndex: 20 }}
              >
                <QuestCard
                  title={q.title}
                  desc={q.desc || q.subtitle}
                  role={q.role}
                  state={state}
                  progressStatus={progressStatus}
                  onSelect={() => handleOpenPopup(q, "tech", slug)}
                />
              </div>
            );
          })}

          {/* ================= NON-TECH ROW ================= */}
          {/* Non Tech signboard */}
          <div 
            className="absolute bg-[#B87B21] text-black text-[22px] font-bold border-4 border-black z-20 flex items-center justify-center uppercase tracking-wider"
            style={{ 
              left: "64px", 
              top: "588px", 
              width: "280px", 
              height: "80px",
              boxShadow: "6px 6px 0px 0px #000"
            }}
          >
            NON TECH
          </div>

          <NormalArrow top="613px" left="365px" width={64} height={32} />

          {/* Non-Tech Cards (Centered perfectly between exact Figma pipes without overlaps) */}
          {nonTechQuests.map((q, idx) => {
            const leftPositions = [450, 993, 1481, 1970];
            const slug = ROLE_TO_SLUG[q.role] ?? q.role.toLowerCase().replace(/\s+/g, "-");

            let state: "available" | "selected" | "disabled" = "available";
            let progressStatus = undefined;

            if (appStatus?.firstPreference === slug) {
              state = "selected";
              progressStatus = appStatus.firstPrefProgress.status;
            } else if (appStatus?.secondPreference === slug) {
              state = "selected";
              progressStatus = appStatus.secondPrefProgress.status;
            } else if (appStatus?.firstPrefType === "non-tech" || appStatus?.secondPrefType === "non-tech") {
              state = "disabled";
            }

            return (
              <div
                key={`nontech-card-${idx}`}
                className="absolute"
                style={{ left: `${leftPositions[idx]}px`, top: "621px", zIndex: 20 }}
              >
                <QuestCard
                  title={q.title}
                  desc={q.desc || q.subtitle}
                  role={q.role}
                  state={state}
                  progressStatus={progressStatus}
                  onSelect={() => handleOpenPopup(q, "non-tech", slug)}
                />
              </div>
            );
          })}

          {/* ================= SCROLLING SOIL GROUND PLATFORM (z-25) ================= */}
          <div className="absolute top-[925px] left-0 w-full h-[300px] z-25 flex flex-col select-none pointer-events-none">
            {/* Green Grass Trim */}
            <div className="w-full h-5 bg-[#52AE26] border-t-4 border-b-4 border-black flex flex-col justify-between shrink-0">
              <div className="w-full h-[3px] bg-[#72F418]" />
              <div className="w-full h-[3px] bg-[#3FA70E]" />
            </div>
            {/* Soil Base with Marquee Text (Extends down so scrollbar sits cleanly on dirt track without sky blue gaps) */}
            <div className="w-full flex-grow bg-[#DD9955] border-b-4 border-black relative overflow-hidden flex items-start pt-3">
              {/* Seamless Infinite Scrolling Text */}
                <div className="flex whitespace-nowrap animate-marquee">
                  <span className="inline-flex items-center shrink-0 text-[24px] text-[#CC7700] tracking-wider uppercase font-bold">
                    {Array(6).fill("MICROSOFT INNOVATIONS CLUB TENURE 2026-2027").map((text, idx) => (
                      <React.Fragment key={idx}>
                        <span>{text}</span>
                        <img src="/mic_logo_pixel.png" alt="MIC" className="w-8 h-8 md:w-10 md:h-10 mx-8 shrink-0" />
                      </React.Fragment>
                    ))}
                  </span>
                  <span className="inline-flex items-center shrink-0 text-[24px] text-[#CC7700] tracking-wider uppercase font-bold">
                    {Array(6).fill("MICROSOFT INNOVATIONS CLUB TENURE 2026-2027").map((text, idx) => (
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

      {/* ================= RETRO DEPARTMENT POPUP OVERLAY (z-50) ================= */}
      {selectedDepartment && (
        <DepartmentPopup
          department={selectedDepartment}
          onClose={() => {
            playRetroSound("close");
            setSelectedDepartment(null);
          }}
          onApply={handleApplyFromPopup}
        />
      )}

    </div>
  );
}
