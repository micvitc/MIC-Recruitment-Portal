"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  Loader2,
  Star,
  AlertTriangle,
  Award,
} from "lucide-react";

interface StageSubmission {
  stage: number;
  submittedAt: string;
  result: "pending" | "passed" | "failed";
  adminNote?: string;
  responses: Record<string, unknown>;
}

interface PrefProgress {
  currentStage: number;
  status: "active" | "passed" | "rejected" | "pending";
  stages: StageSubmission[];
}

interface Application {
  _id: string;
  firstPreference: string;
  secondPreference: string;
  firstPrefType: string;
  secondPrefType: string;
  activePreference: "first" | "second";
  overallStatus: "in-progress" | "selected" | "rejected" | "waitlisted";
  firstPrefProgress: PrefProgress;
  secondPrefProgress: PrefProgress;
  createdAt: string;
  updatedAt: string;
}

const DEPT_NAMES: Record<string, string> = {
  development: "Development",
  "competitive-coding": "Competitive Coding",
  "ui-ux": "UI/UX",
  "ai-ml": "AI/ML",
  "cyber-security": "Cyber Security",
  design: "Design",
  management: "Management",
  entrepreneurship: "Entrepreneurship",
  "content-media": "Content & Media",
};

const DEPT_COLORS: Record<string, string> = {
  development: "cyan",
  "competitive-coding": "amber",
  "ui-ux": "violet",
  "ai-ml": "emerald",
  "cyber-security": "rose",
  design: "pink",
  management: "blue",
  entrepreneurship: "orange",
  "content-media": "teal",
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    "in-progress": { label: "In Progress", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    selected: { label: "Selected 🎉", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    rejected: { label: "Not Selected", cls: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
    waitlisted: { label: "Waitlisted", cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    active: { label: "Active", cls: "bg-teal-500/10 text-teal-400 border-teal-500/20" },
    pending: { label: "Pending", cls: "bg-slate-500/10 text-slate-400 border-slate-700" },
    passed: { label: "Passed ✓", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    rejected_pref: { label: "Not Selected", cls: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  };
  const item = map[status] ?? map["pending"];
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${item.cls}`}>
      {item.label}
    </span>
  );
}

function StageTimeline({
  progress,
  deptSlug,
  prefLabel,
  totalStages,
  onContinue,
  cycleOpen,
}: {
  progress: PrefProgress;
  deptSlug: string;
  prefLabel: string;
  totalStages: number;
  onContinue?: () => void;
  cycleOpen: boolean;
}) {
  const color = DEPT_COLORS[deptSlug] ?? "teal";

  return (
    <div className={`rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md p-5 space-y-4`}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{prefLabel}</p>
          <h3 className={`text-lg font-bold text-${color}-400`}>
            {DEPT_NAMES[deptSlug] ?? deptSlug}
          </h3>
        </div>
        <StatusBadge status={progress.status === "rejected" ? "rejected_pref" : progress.status} />
      </div>

      {/* Stage dots */}
      <div className="space-y-3">
        {Array.from({ length: Math.max(1, totalStages - 1) }).map((_, i) => {
          const stageNum = i + 2; // actual stage number in DB
          const displayStageNum = i + 1; // stage number displayed to user
          const submission = progress.stages.find((s) => s.stage === stageNum);
          const isCurrentStage = stageNum === progress.currentStage && progress.status === "active";
          const isPast = submission !== undefined;

          return (
            <div key={stageNum} className="flex items-start gap-3">
              {/* Icon */}
              <div className="shrink-0 mt-0.5">
                {submission?.result === "passed" ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : submission?.result === "failed" ? (
                  <XCircle className="h-5 w-5 text-rose-400" />
                ) : isPast ? (
                  <Clock className="h-5 w-5 text-amber-400" />
                ) : isCurrentStage ? (
                  <div className={`h-5 w-5 rounded-full border-2 border-${color}-500 bg-${color}-500/20 flex items-center justify-center`}>
                    <div className={`h-2 w-2 rounded-full bg-${color}-400`} />
                  </div>
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-slate-700 bg-slate-900" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-semibold ${isPast || isCurrentStage ? "text-white" : "text-slate-600"}`}>
                    Stage {displayStageNum}
                  </span>
                  {submission?.result === "pending" && (
                    <span className="text-[10px] text-amber-400 font-bold uppercase">Under Review</span>
                  )}
                  {submission?.result === "passed" && (
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">Passed</span>
                  )}
                  {submission?.result === "failed" && (
                    <span className="text-[10px] text-rose-400 font-bold uppercase">Not Selected</span>
                  )}
                  {isCurrentStage && !isPast && (
                    <span className={`text-[10px] text-${color}-400 font-bold uppercase animate-pulse`}>Fill Now →</span>
                  )}
                </div>
                {submission && (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Submitted {new Date(submission.submittedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                )}
                {submission?.adminNote && (
                  <p className="text-[11px] text-slate-400 mt-1 italic">&ldquo;{submission.adminNote}&rdquo;</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      {progress.status === "active" && cycleOpen && onContinue && (
        <button
          onClick={onContinue}
          className={`w-full py-3 rounded-xl bg-${color}-500/10 border border-${color}-500/30 text-${color}-400 font-bold text-sm flex items-center justify-center gap-2 hover:bg-${color}-500/20 transition-all`}
        >
          {progress.currentStage === 1 ? "Fill Personal Information" : `Continue Stage ${progress.currentStage - 1}`} <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );}

export default function ApplicationStatusPage() {
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [cycleOpen, setCycleOpen] = useState(true);
  const [totalStages] = useState(2); // from DB ideally, hardcoded as 2 for now

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/apply/status");
        if (res.ok) {
          const data = await res.json();
          setApplication(data.application);
          setCycleOpen(data.cycleOpen ?? true);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-teal-400 animate-spin" />
      </div>
    );
  }

  if (!application) {
    return (
      <main className="min-h-[100dvh] bg-slate-950 flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center space-y-6">
          <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto" />
          <h1 className="text-xl font-bold text-white">No Application Found</h1>
          <p className="text-slate-400 text-sm">You haven&apos;t started an application yet.</p>
          <button
            onClick={() => router.push("/apply")}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-sm hover:brightness-110 transition-all"
          >
            Apply Now
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black p-4 md:p-8">
      <div className="fixed top-0 right-1/3 -z-10 h-96 w-96 rounded-full bg-teal-500/6 blur-[120px]" />

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="pt-4 space-y-1">
          <p className="text-xs text-teal-400 font-bold uppercase tracking-widest">MIC Recruitment 2026–27</p>
          <h1 className="text-3xl font-extrabold text-white">Application Status</h1>
        </div>

        {/* Cycle status banner */}
        <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
          cycleOpen
            ? "bg-teal-500/5 border-teal-500/20"
            : "bg-amber-500/5 border-amber-500/20"
        }`}>
          <div className={`h-2.5 w-2.5 rounded-full ${cycleOpen ? "bg-teal-400 animate-pulse" : "bg-amber-400"}`} />
          <p className="text-sm font-semibold text-white">
            {cycleOpen ? "Recruitment is open" : "Recruitment is closed"}
          </p>
          <p className="text-xs text-slate-400 ml-auto">
            {cycleOpen ? "You can still edit pending responses." : "No further edits allowed."}
          </p>
        </div>

        {/* Overall status */}
        {application.overallStatus === "selected" && (
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-4">
            <Award className="h-10 w-10 text-emerald-400 shrink-0" />
            <div>
              <p className="text-lg font-extrabold text-white">Congratulations! 🎉</p>
              <p className="text-sm text-emerald-300 mt-0.5">You&apos;ve been selected for MIC. Check your email for next steps.</p>
            </div>
          </div>
        )}

        {/* Applied on */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Star className="h-3.5 w-3.5" />
          Applied on {new Date(application.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
          {" · "}
          <StatusBadge status={application.overallStatus} />
        </div>

        {/* Personal Info Card */}
        {(() => {
          const personalInfoStage =
            application.firstPrefProgress.stages.find((s) => s.stage === 1) ||
            application.secondPrefProgress?.stages.find((s) => s.stage === 1);
          if (!personalInfoStage) return null;

          return (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md p-6 space-y-4">
              <h3 className="text-base font-bold text-white border-b border-slate-800 pb-2">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Full Name</p>
                  <p className="text-sm font-semibold text-slate-200 mt-1">{String(personalInfoStage.responses.fullName || "—")}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Phone Number</p>
                  <p className="text-sm font-semibold text-slate-200 mt-1">{String(personalInfoStage.responses.phone || "—")}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Registration Number</p>
                  <p className="text-sm font-semibold text-slate-200 mt-1">{String(personalInfoStage.responses.regNo || "—")}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Year of Study</p>
                  <p className="text-sm font-semibold text-slate-200 mt-1">{String(personalInfoStage.responses.year || "—")}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Branch / Programme</p>
                  <p className="text-sm font-semibold text-slate-200 mt-1">{String(personalInfoStage.responses.branch || "—")}</p>
                </div>
                {personalInfoStage.responses.whyMic ? (
                  <div className="sm:col-span-2">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Why do you want to join MIC?</p>
                    <p className="text-sm text-slate-300 mt-1 leading-relaxed bg-slate-950/45 p-3 rounded-lg border border-slate-800/40">
                      {String(personalInfoStage.responses.whyMic)}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })()}

        {/* Preferences */}
        <div className="space-y-4">
          <StageTimeline
            progress={application.firstPrefProgress}
            deptSlug={application.firstPreference}
            prefLabel="1st Preference"
            totalStages={totalStages}
            cycleOpen={cycleOpen}
            onContinue={() =>
              router.push(`/apply/${application.firstPreference}/stage-${application.firstPrefProgress.currentStage}`)
            }
          />

          {application.secondPreference ? (
            <StageTimeline
              progress={application.secondPrefProgress}
              deptSlug={application.secondPreference}
              prefLabel="2nd Preference"
              totalStages={totalStages}
              cycleOpen={cycleOpen}
              onContinue={
                application.secondPrefProgress.status === "active"
                  ? () => router.push(`/apply/${application.secondPreference}/stage-${application.secondPrefProgress.currentStage}`)
                  : undefined
              }
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/20 p-6 flex flex-col items-center justify-center text-center space-y-3">
              <p className="text-sm text-slate-400">You haven&apos;t selected a 2nd Preference yet.</p>
              <button
                onClick={() => router.push("/recruitments")}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700 transition-colors"
              >
                Choose 2nd Preference
              </button>
            </div>
          )}
        </div>

        {/* Info note */}
        <p className="text-xs text-slate-600 text-center leading-relaxed">
          Your 2nd preference will only be activated if you are not selected through your 1st preference. Results are communicated via email.
        </p>
      </div>
    </main>
  );
}
