"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut, SessionProvider } from "next-auth/react";
import { Loader2, ArrowLeft, CheckCircle2, XCircle, Clock, FileText, LogOut } from "lucide-react";
import { Press_Start_2P } from "next/font/google";
import BackButton from "@/components/BackButton";
import MobileBackground from "@/components/MobileBackground";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
});

interface StageProgress {
  stage: number;
  result: "pending" | "passed" | "failed";
  submittedAt: string;
  adminNote?: string;
  responses: Record<string, unknown>;
}

interface ApplicationStatus {
  fullName: string;
  phone: string;
  regNo: string;
  year: string;
  branch: string;
  whyMic: string;
  overallStatus: "in-progress" | "selected" | "rejected" | "waitlisted";
  firstPreference: string;
  secondPreference?: string;
  firstPrefProgress: {
    status: "active" | "passed" | "rejected" | "pending";
    currentStage: number;
    stages: StageProgress[];
  };
  secondPrefProgress?: {
    status: "active" | "passed" | "rejected" | "pending";
    currentStage: number;
    stages: StageProgress[];
  };
}

export default function ProfilePageWrapper() {
  return (
    <SessionProvider>
      <ProfilePage />
    </SessionProvider>
  );
}

function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [appStatus, setAppStatus] = useState<ApplicationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetch("/api/apply/status")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.application) {
            setAppStatus(data.application);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  if (loading || status === "loading") {
    return (
      <div className={`${pressStart.variable} font-press-start`}>
        {/* Mobile Loading */}
        <div className="block md:hidden">
          <MobileBackground>
            <div className="flex-1 flex items-center justify-center pt-24 px-4">
              <div className="bg-[#C8862A] border-4 border-black p-6 flex flex-col items-center justify-center rounded-sm max-w-xs w-full" style={{ boxShadow: "4px 4px 0px 0px #000" }}>
                <div className="text-white text-[12px] animate-retro-blink uppercase tracking-widest text-center" style={{ textShadow: "2px 2px 0 #000" }}>
                  LOADING GEAR...
                </div>
              </div>
            </div>
          </MobileBackground>
        </div>
        {/* Desktop Loading */}
        <div className="hidden md:flex min-h-[100dvh] bg-[#1188EE] items-center justify-center">
          <div className="bg-[#B87B21] border-4 border-black p-6 flex items-center justify-center" style={{ boxShadow: "6px 6px 0px 0px #000" }}>
            <div className="text-white text-[14px] animate-retro-blink uppercase tracking-widest drop-shadow-[2px_2px_0px_#000]">
              LOADING GEAR...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${pressStart.variable} font-press-start`}>
      {/* ── MOBILE VERSION ── */}
      <div className="block md:hidden">
        <MobileProfileView
          session={session}
          appStatus={appStatus}
          router={router}
          onSignOut={handleSignOut}
        />
      </div>

      {/* ── DESKTOP VERSION ── */}
      <div className="hidden md:block">
        <DesktopProfileView
          session={session}
          appStatus={appStatus}
          router={router}
          onSignOut={handleSignOut}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * MOBILE PROFILE VIEW
 * ───────────────────────────────────────────────────────────────────────────── */
function MobileProfileView({
  session,
  appStatus,
  router,
  onSignOut,
}: {
  session: any;
  appStatus: ApplicationStatus | null;
  router: any;
  onSignOut: () => void;
}) {
  return (
    <MobileBackground>
      {/* Top Header Bar */}
      <div className="relative z-20 flex items-center justify-between px-3 pt-3 flex-shrink-0">
        <img
          src="/mic_logo_pixel.png"
          alt="MIC Logo"
          className="pixelated w-[52px] h-[37px] drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)] cursor-pointer"
          onClick={() => router.push("/recruitments")}
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/recruitments")}
            className="bg-[#7CA922] text-black text-[9px] font-bold py-1.5 px-3 border-2 border-black uppercase tracking-wider flex items-center gap-1 cursor-pointer active:translate-y-0.5"
            style={{ boxShadow: "2px 2px 0px 0px #000" }}
          >
            <ArrowLeft className="h-3 w-3" /> MAP
          </button>
          <button
            onClick={onSignOut}
            className="bg-[#A93710] text-white text-[9px] font-bold py-1.5 px-3 border-2 border-black uppercase tracking-wider flex items-center gap-1 cursor-pointer active:translate-y-0.5"
            style={{ boxShadow: "2px 2px 0px 0px #000" }}
          >
            <LogOut className="h-3 w-3" /> EXIT
          </button>
        </div>
      </div>

      {/* Main Scroll Content */}
      <div className="relative z-10 p-4 space-y-5">
        
        {/* Header / Overall Status Card */}
        <div className="bg-[#FFE4D6] border-4 border-black p-4 relative rounded-sm" style={{ boxShadow: "4px 4px 0px 0px #000" }}>
          <div className="flex flex-col gap-2">
            <h1 className="text-[18px] font-bold text-black tracking-widest uppercase drop-shadow-[1px_1px_0px_#A93710]">
              PLAYER GEAR
            </h1>
            <p className="text-[9px] text-black/70 uppercase tracking-wider break-all font-sans">
              {session?.user?.email}
            </p>

            {appStatus && (
              <div className="mt-2 bg-white border-2 border-black p-3 flex items-center justify-between" style={{ boxShadow: "2px 2px 0px 0px #000" }}>
                <span className="text-[9px] font-bold uppercase tracking-wider text-black/70">OVERALL STATUS:</span>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 border-2 border-black ${
                  appStatus.overallStatus === "selected" ? "bg-[#72F418] text-black"
                  : appStatus.overallStatus === "rejected" ? "bg-[#FF4444] text-white"
                  : appStatus.overallStatus === "waitlisted" ? "bg-[#FBBF24] text-black"
                  : "bg-[#1093EB] text-white"
                }`}>
                  {appStatus.overallStatus.replace("-", " ")}
                </span>
              </div>
            )}
          </div>
        </div>

        {!appStatus ? (
          /* Error / No application mobile card */
          <div className="bg-[#FFE4D6] border-4 border-black p-6 text-center space-y-4 rounded-sm" style={{ boxShadow: "4px 4px 0px 0px #000" }}>
            <div className="bg-[#A93710] text-white px-3 py-1.5 border-2 border-black text-[10px] uppercase font-bold inline-block">
              NO APPLICATION FOUND
            </div>
            <FileText className="h-12 w-12 text-black mx-auto" />
            <p className="text-[10px] text-black uppercase tracking-wide leading-relaxed">
              You have not submitted an application yet.
            </p>
            <button
              onClick={() => router.push("/recruitments")}
              className="w-full py-3 bg-[#72F418] hover:bg-[#52AE26] text-black border-2 border-black font-bold text-[10px] uppercase tracking-widest transition-transform active:translate-y-0.5 cursor-pointer"
              style={{ boxShadow: "3px 3px 0px 0px #000" }}
            >
              START APPLICATION
            </button>
          </div>
        ) : (
          <>
            {/* Personal Information Card */}
            <div className="bg-[#FFE4D6] border-4 border-black p-4 space-y-4 rounded-sm" style={{ boxShadow: "4px 4px 0px 0px #000" }}>
              <div className="bg-[#1188EE] border-2 border-black py-2 px-3 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold tracking-widest uppercase drop-shadow-[1px_1px_0px_#000]">
                  ░ PLAYER DATA ░
                </span>
              </div>

              <div className="space-y-3 font-sans">
                <div>
                  <p className="text-[8px] font-press-start text-black/70 uppercase tracking-wider mb-1">Full Name</p>
                  <div className="text-[11px] font-bold text-black border-2 border-black bg-white p-2 rounded-sm" style={{ boxShadow: "2px 2px 0px 0px #000" }}>
                    {appStatus.fullName || "—"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[8px] font-press-start text-black/70 uppercase tracking-wider mb-1">Phone</p>
                    <div className="text-[10px] font-bold text-black border-2 border-black bg-white p-2 rounded-sm truncate" style={{ boxShadow: "2px 2px 0px 0px #000" }}>
                      {appStatus.phone || "—"}
                    </div>
                  </div>
                  <div>
                    <p className="text-[8px] font-press-start text-black/70 uppercase tracking-wider mb-1">Reg No</p>
                    <div className="text-[10px] font-bold text-black border-2 border-black bg-white p-2 rounded-sm truncate" style={{ boxShadow: "2px 2px 0px 0px #000" }}>
                      {appStatus.regNo || "—"}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-[8px] font-press-start text-black/70 uppercase tracking-wider mb-1">Year</p>
                    <div className="text-[10px] font-bold text-black border-2 border-black bg-white p-2 rounded-sm truncate" style={{ boxShadow: "2px 2px 0px 0px #000" }}>
                      {appStatus.year || "—"}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[8px] font-press-start text-black/70 uppercase tracking-wider mb-1">Branch</p>
                    <div className="text-[10px] font-bold text-black border-2 border-black bg-white p-2 rounded-sm truncate" style={{ boxShadow: "2px 2px 0px 0px #000" }}>
                      {appStatus.branch || "—"}
                    </div>
                  </div>
                </div>

                {appStatus.whyMic && (
                  <div>
                    <p className="text-[8px] font-press-start text-black/70 uppercase tracking-wider mb-1">Why MIC?</p>
                    <div className="text-[11px] text-black border-2 border-black bg-white p-2.5 rounded-sm leading-normal max-h-32 overflow-y-auto" style={{ boxShadow: "2px 2px 0px 0px #000" }}>
                      {appStatus.whyMic}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Preference 1 Timeline */}
            <MobileTimelineCard
              title="1ST PREFERENCE"
              prefName={appStatus.firstPreference}
              prefStatus={appStatus.firstPrefProgress.status}
              stages={appStatus.firstPrefProgress.stages}
            />

            {/* Preference 2 Timeline (if present) */}
            {appStatus.secondPreference && appStatus.secondPrefProgress && (
              <MobileTimelineCard
                title="2ND PREFERENCE"
                prefName={appStatus.secondPreference}
                prefStatus={appStatus.secondPrefProgress.status}
                stages={appStatus.secondPrefProgress.stages}
              />
            )}
          </>
        )}
      </div>
    </MobileBackground>
  );
}

/* ── Mobile Preference Timeline Component ── */
function MobileTimelineCard({
  title,
  prefName,
  prefStatus,
  stages,
}: {
  title: string;
  prefName: string;
  prefStatus: string;
  stages: StageProgress[];
}) {
  return (
    <div className="bg-[#FFE4D6] border-4 border-black p-4 space-y-4 rounded-sm" style={{ boxShadow: "4px 4px 0px 0px #000" }}>
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-black pb-3">
        <div>
          <p className="text-[8px] font-bold text-black/60 uppercase tracking-widest">{title}</p>
          <h2 className="text-[13px] font-bold text-black uppercase tracking-wider drop-shadow-[1px_1px_0px_#fff]">
            {prefName.replace("-", " ")}
          </h2>
        </div>
        <div className={`px-2 py-1 border-2 border-black text-[9px] uppercase font-bold tracking-wider ${
          prefStatus === "active" ? "bg-[#1093EB] text-white"
          : prefStatus === "passed" ? "bg-[#72F418] text-black"
          : prefStatus === "rejected" ? "bg-[#FF4444] text-white"
          : "bg-slate-300 text-black"
        }`} style={{ boxShadow: "2px 2px 0px 0px #000" }}>
          {prefStatus}
        </div>
      </div>

      {/* Stages List */}
      <div className="relative pl-5 border-l-4 border-black space-y-4 pt-1">
        {stages.length === 0 ? (
          <p className="text-[9px] text-black/70 uppercase tracking-wider">No stages submitted yet.</p>
        ) : (
          stages.map((stage, idx) => (
            <div key={idx} className="relative">
              {/* Timeline Dot */}
              <div className={`absolute -left-[27px] top-1.5 h-4 w-4 border-2 border-black ${
                stage.result === "passed" ? "bg-[#72F418]"
                : stage.result === "failed" ? "bg-[#FF4444]"
                : "bg-[#FBBF24]"
              }`} style={{ boxShadow: "1px 1px 0px 0px #000" }} />

              <div className="bg-white border-2 border-black p-3 space-y-2" style={{ boxShadow: "2px 2px 0px 0px #000" }}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-black uppercase">Stage {stage.stage}</span>
                  <span className="text-[8px] text-black/60 font-semibold uppercase">
                    {new Date(stage.submittedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 border-t border-dashed border-black/30 pt-2">
                  {stage.result === "passed" ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-[#52AE26]" />
                      <span className="text-[9px] font-bold text-[#52AE26] uppercase">PASSED</span>
                    </>
                  ) : stage.result === "failed" ? (
                    <>
                      <XCircle className="h-4 w-4 text-[#FF4444]" />
                      <span className="text-[9px] font-bold text-[#FF4444] uppercase">NOT SELECTED</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 text-[#D97706]" />
                      <span className="text-[9px] font-bold text-[#D97706] uppercase">UNDER REVIEW</span>
                    </>
                  )}
                </div>

                {stage.adminNote && (
                  <div className="mt-2 p-2 bg-[#FFF4E6] border border-black text-[9px] leading-normal font-sans">
                    <p className="font-bold text-[#A93710] font-press-start text-[8px] uppercase mb-1">ADMIN NOTE:</p>
                    <p className="text-black uppercase">{stage.adminNote}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * DESKTOP PROFILE VIEW (Original)
 * ───────────────────────────────────────────────────────────────────────────── */
function DesktopProfileView({
  session,
  appStatus,
  router,
  onSignOut,
}: {
  session: any;
  appStatus: ApplicationStatus | null;
  router: any;
  onSignOut: () => void;
}) {
  if (!appStatus) {
    return (
      <div className="min-h-[100dvh] bg-[#1188EE] pb-20">
        <BackButton onClick={() => router.push("/recruitments")} />
        <div className="flex justify-end p-6 md:px-8 max-w-4xl mx-auto w-full">
          <button onClick={onSignOut} className="flex items-center gap-2 bg-[#A93710] hover:bg-[#E29A2B] text-white px-4 py-2 border-4 border-black text-[10px] sm:text-[12px] uppercase tracking-widest transition-transform hover:-translate-y-1 active:translate-y-0" style={{ boxShadow: "4px 4px 0px 0px #000" }}>
            <LogOut className="h-4 w-4" /> SIGN OUT
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 -mt-16">
          <div className="bg-[#FFE4D6] border-4 border-black p-8 max-w-md w-full text-center space-y-6" style={{ boxShadow: "8px 8px 0px 0px #000" }}>
            <div className="bg-[#A93710] text-white px-4 py-2 border-2 border-black text-[12px] uppercase tracking-widest font-bold -mt-12 mb-2 inline-block" style={{ boxShadow: "4px 4px 0px 0px #000" }}>
              ERROR: NO APPLICATION
            </div>
            <FileText className="h-16 w-16 text-black mx-auto" />
            <p className="text-[12px] leading-loose text-black uppercase tracking-wide">You haven&apos;t applied to any departments yet.</p>
            <button
              onClick={() => router.push("/recruitments")}
              className="mt-4 px-6 py-4 bg-[#1093EB] hover:bg-[#16B6F4] text-white border-4 border-black font-bold text-[12px] uppercase tracking-widest transition-transform hover:-translate-y-1 active:translate-y-0 w-full"
              style={{ boxShadow: "4px 4px 0px 0px #000" }}
            >
              START APPLICATION
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderTimeline = (
    prefName: string,
    prefStatus: string,
    stages: StageProgress[]
  ) => {
    return (
      <div className="bg-[#FFF4E6] border-4 border-black p-6 md:p-8 space-y-8" style={{ boxShadow: "6px 6px 0px 0px #000" }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-4 border-black pb-4">
          <h2 className="text-[16px] font-black text-black uppercase tracking-widest drop-shadow-[1px_1px_0px_#fff]">{prefName.replace("-", " ")}</h2>
          <div className={`px-3 py-2 border-2 border-black text-[10px] uppercase font-bold tracking-widest ${
            prefStatus === "active" ? "bg-[#FFF4E6] text-[#A93710]"
            : prefStatus === "passed" ? "bg-[#34D399] text-black"
            : prefStatus === "rejected" ? "bg-[#F87171] text-black"
            : "bg-[#94A3B8] text-black"
          }`} style={{ boxShadow: "3px 3px 0px 0px #000" }}>
            {prefStatus}
          </div>
        </div>

        <div className="relative pl-6 border-l-4 border-black space-y-10 pt-2">
          {stages.length === 0 && (
            <div className="text-[10px] text-black uppercase tracking-widest">No stages submitted yet.</div>
          )}
          {stages.map((stage, idx) => (
            <div key={idx} className="relative">
              <div className={`absolute -left-[37px] top-1 h-6 w-6 border-4 border-black ${
                stage.result === "passed" ? "bg-[#34D399]"
                : stage.result === "failed" ? "bg-[#F87171]"
                : "bg-[#FBBF24]"
              }`} style={{ boxShadow: "2px 2px 0px 0px #000" }} />
              
              <div className="bg-white border-4 border-black p-4" style={{ boxShadow: "4px 4px 0px 0px #000" }}>
                <div className="flex flex-col gap-2 mb-4">
                  <h3 className="text-[12px] font-bold text-black uppercase tracking-widest">Stage {stage.stage} Submitted</h3>
                  <span className="text-[10px] text-black/60 font-semibold uppercase tracking-widest">
                    {new Date(stage.submittedAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center gap-3 mb-4 border-t-2 border-dashed border-black/20 pt-4">
                  {stage.result === "passed" ? (
                    <><CheckCircle2 className="h-5 w-5 text-[#34D399]" /><span className="text-[10px] font-bold text-[#34D399] uppercase tracking-widest">Passed</span></>
                  ) : stage.result === "failed" ? (
                    <><XCircle className="h-5 w-5 text-[#F87171]" /><span className="text-[10px] font-bold text-[#F87171] uppercase tracking-widest">Not Selected</span></>
                  ) : (
                    <><Clock className="h-5 w-5 text-[#FBBF24]" /><span className="text-[10px] font-bold text-[#FBBF24] uppercase tracking-widest">Under Review</span></>
                  )}
                </div>

                {stage.adminNote && (
                  <div className="mt-4 p-4 bg-[#FFF4E6] border-2 border-black">
                    <p className="text-[10px] text-[#A93710] font-bold uppercase tracking-widest mb-3">Feedback from Admin</p>
                    <p className="text-[10px] text-black leading-loose uppercase font-sans">{stage.adminNote}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-[100dvh] bg-[linear-gradient(180deg,#1188EE_0%,#0E8AEA_25%,#1093EB_35%,#1197EC_46%,#16B6F4_52%,#10CBF1_56%,#0FC6F1_60%,#15DEF0_65%,#15DEF0_81%)] flex flex-col pb-20">
      <BackButton onClick={() => router.push("/recruitments")} />
      <div className="flex justify-end p-6 md:px-8 max-w-[1200px] mx-auto w-full">
        <button onClick={onSignOut} className="flex items-center gap-2 bg-[#A93710] hover:bg-[#E29A2B] text-white px-4 py-2 border-4 border-black text-[10px] sm:text-[12px] uppercase tracking-widest transition-transform hover:-translate-y-1 active:translate-y-0" style={{ boxShadow: "4px 4px 0px 0px #000" }}>
          <LogOut className="h-4 w-4" /> SIGN OUT
        </button>
      </div>
      <div className="flex-1 max-w-[1200px] w-full mx-auto p-6 md:p-8 pt-0 space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 bg-white border-4 border-black p-6 md:p-8 relative" style={{ boxShadow: "8px 8px 0px 0px #000" }}>
          <div className="absolute top-0 left-0 w-full h-2 bg-black/5" />
          <div className="space-y-4">
            <button onClick={() => router.push("/recruitments")} className="text-[10px] sm:text-[12px] font-bold text-black hover:text-[#1093EB] flex items-center gap-2 mb-4 transition-colors uppercase tracking-widest">
              <ArrowLeft className="h-4 w-4" /> BACK TO MAP
            </button>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-black tracking-widest uppercase drop-shadow-[2px_2px_0px_#A93710]">YOUR GEAR</h1>
            <p className="text-[10px] sm:text-[12px] text-black/60 uppercase tracking-widest break-all font-sans">{session?.user?.email}</p>
          </div>
          
          <div className="bg-[#FFF4E6] border-4 border-black px-6 py-4 flex flex-col gap-2" style={{ boxShadow: "4px 4px 0px 0px #000" }}>
            <p className="text-[10px] uppercase tracking-widest font-bold text-black/60">OVERALL STATUS</p>
            <p className={`text-[12px] sm:text-[14px] font-bold uppercase tracking-widest ${
              appStatus.overallStatus === "selected" ? "text-[#34D399]"
              : appStatus.overallStatus === "rejected" ? "text-[#F87171]"
              : appStatus.overallStatus === "waitlisted" ? "text-[#FBBF24]"
              : "text-black"
            }`}>
              {appStatus.overallStatus.replace("-", " ")}
            </p>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white border-4 border-black p-6 md:p-8 space-y-6" style={{ boxShadow: "8px 8px 0px 0px #000" }}>
          <h2 className="text-[14px] sm:text-[16px] font-black text-black uppercase tracking-widest border-b-4 border-black pb-4">
            Personal Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
            <div className="space-y-1">
              <p className="text-[9px] font-press-start text-black/60 uppercase tracking-wider">Full Name</p>
              <p className="text-sm font-bold text-black border-2 border-black bg-[#FFF4E6] p-3 rounded" style={{ boxShadow: "2px 2px 0px 0px #000" }}>
                {appStatus.fullName || "—"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-press-start text-black/60 uppercase tracking-wider">Phone Number</p>
              <p className="text-sm font-bold text-black border-2 border-black bg-[#FFF4E6] p-3 rounded" style={{ boxShadow: "2px 2px 0px 0px #000" }}>
                {appStatus.phone || "—"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-press-start text-black/60 uppercase tracking-wider">Registration Number</p>
              <p className="text-sm font-bold text-black border-2 border-black bg-[#FFF4E6] p-3 rounded" style={{ boxShadow: "2px 2px 0px 0px #000" }}>
                {appStatus.regNo || "—"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[9px] font-press-start text-black/60 uppercase tracking-wider">Year of Study</p>
              <p className="text-sm font-bold text-black border-2 border-black bg-[#FFF4E6] p-3 rounded" style={{ boxShadow: "2px 2px 0px 0px #000" }}>
                {appStatus.year || "—"}
              </p>
            </div>
            <div className="space-y-1 md:col-span-2 lg:col-span-2">
              <p className="text-[9px] font-press-start text-black/60 uppercase tracking-wider">Branch / Programme</p>
              <p className="text-sm font-bold text-black border-2 border-black bg-[#FFF4E6] p-3 rounded" style={{ boxShadow: "2px 2px 0px 0px #000" }}>
                {appStatus.branch || "—"}
              </p>
            </div>
            {appStatus.whyMic ? (
              <div className="space-y-1 md:col-span-2 lg:col-span-3">
                <p className="text-[9px] font-press-start text-black/60 uppercase tracking-wider">Why do you want to join MIC?</p>
                <p className="text-sm text-black border-2 border-black bg-[#FFF4E6] p-3 rounded leading-relaxed" style={{ boxShadow: "2px 2px 0px 0px #000" }}>
                  {appStatus.whyMic}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Timelines */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-6">
            <h2 className="text-[14px] sm:text-[16px] font-black text-white uppercase tracking-widest drop-shadow-[2px_2px_0px_#000]">1st Preference</h2>
            {renderTimeline(appStatus.firstPreference, appStatus.firstPrefProgress.status, appStatus.firstPrefProgress.stages)}
          </div>
          
          {appStatus.secondPreference && appStatus.secondPrefProgress && (
            <div className="space-y-6">
              <h2 className="text-[14px] sm:text-[16px] font-black text-white uppercase tracking-widest drop-shadow-[2px_2px_0px_#000]">2nd Preference</h2>
              {renderTimeline(appStatus.secondPreference, appStatus.secondPrefProgress.status, appStatus.secondPrefProgress.stages)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
