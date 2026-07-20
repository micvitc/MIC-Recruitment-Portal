"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut, SessionProvider } from "next-auth/react";
import { Loader2, ArrowLeft, CheckCircle2, XCircle, Clock, FileText, LogOut } from "lucide-react";
import { Press_Start_2P } from "next/font/google";
import BackButton from "@/components/BackButton";

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

  if (loading || status === "loading") {
    return (
      <div className={`min-h-[100dvh] bg-[#1188EE] flex items-center justify-center ${pressStart.variable} font-press-start`}>
        <div className="bg-[#B87B21] border-4 border-black p-6 flex items-center justify-center" style={{ boxShadow: "6px 6px 0px 0px #000" }}>
          <div className="text-white text-[14px] animate-retro-blink uppercase tracking-widest drop-shadow-[2px_2px_0px_#000]">
            LOADING GEAR...
          </div>
        </div>
      </div>
    );
  }

  if (!appStatus) {
    return (
      <div className={`min-h-[100dvh] bg-[#1188EE] pb-20 ${pressStart.variable} font-press-start`}>
        <BackButton onClick={() => router.push("/recruitments")} />
        <div className="flex justify-end p-6 md:px-8 max-w-4xl mx-auto w-full">
          <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-2 bg-[#A93710] hover:bg-[#E29A2B] text-white px-4 py-2 border-4 border-black text-[10px] sm:text-[12px] uppercase tracking-widest transition-transform hover:-translate-y-1 active:translate-y-0" style={{ boxShadow: "4px 4px 0px 0px #000" }}>
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
    const timelineStages = stages;

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
          {timelineStages.length === 0 && (
            <div className="text-[10px] text-black uppercase tracking-widest">No stages submitted yet.</div>
          )}
          {timelineStages.map((stage, idx) => (
            <div key={idx} className="relative">
              {/* Timeline Dot */}
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
                    <p className="text-[10px] text-black leading-loose uppercase">{stage.adminNote}</p>
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
    <div className={`min-h-[100dvh] bg-[linear-gradient(180deg,#1188EE_0%,#0E8AEA_25%,#1093EB_35%,#1197EC_46%,#16B6F4_52%,#10CBF1_56%,#0FC6F1_60%,#15DEF0_65%,#15DEF0_81%)] flex flex-col ${pressStart.variable} font-press-start pb-20`}>
      <BackButton onClick={() => router.push("/recruitments")} />
      <div className="flex justify-end p-6 md:px-8 max-w-[1200px] mx-auto w-full">
        <button onClick={() => signOut({ callbackUrl: "/" })} className="flex items-center gap-2 bg-[#A93710] hover:bg-[#E29A2B] text-white px-4 py-2 border-4 border-black text-[10px] sm:text-[12px] uppercase tracking-widest transition-transform hover:-translate-y-1 active:translate-y-0" style={{ boxShadow: "4px 4px 0px 0px #000" }}>
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
            <p className="text-[10px] sm:text-[12px] text-black/60 uppercase tracking-widest break-all">{session?.user?.email}</p>
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
