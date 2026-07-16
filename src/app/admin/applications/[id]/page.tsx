"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  FileText,
  MessageSquare,
  Award,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog } from "@/components/ui/dialog";

interface StageSubmission {
  stage: number;
  submittedAt: string;
  result: "pending" | "passed" | "failed";
  adminNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  responses: Record<string, unknown>;
  scores?: Record<string, number>;
}

interface PrefProgress {
  currentStage: number;
  status: string;
  stages: StageSubmission[];
}

interface Application {
  _id: string;
  userEmail: string;
  firstPreference: string;
  secondPreference: string;
  firstPrefType: string;
  secondPrefType: string;
  activePreference: "first" | "second";
  overallStatus: string;
  firstPrefProgress: PrefProgress;
  secondPrefProgress: PrefProgress;
  createdAt: string;
}
interface ClientDepartment {
  slug: string;
  name: string;
  type: "tech" | "non-tech";
  totalStages: number;
  isActive: boolean;
  maxCapacity: number;
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

function ResponseViewer({ responses }: { responses: Record<string, unknown> }) {
  return (
    <div className="space-y-4">
      {Object.entries(responses).map(([key, val]) => (
        <div key={key} className="space-y-1.5">
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">{key}</p>
          <div className="text-sm text-zinc-200 bg-zinc-950 border border-zinc-900 rounded-xl p-4 leading-relaxed whitespace-pre-wrap">
            {Array.isArray(val) ? val.join(", ") : String(val ?? "—")}
          </div>
        </div>
      ))}
    </div>
  );
}

function PrefPanel({
  progress,
  deptSlug,
  label,
  onActionTrigger,
  acting,
  totalStages,
}: {
  progress: PrefProgress;
  deptSlug: string;
  label: string;
  onActionTrigger: (preference: "first" | "second", action: "advance" | "reject", note: string, scores?: Record<string, number>) => void;
  acting: boolean;
  totalStages: number;
}) {
  const prefKey = label === "1st Preference" ? "first" : "second";
  const [note, setNote] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({ technical: 0, communication: 0, creativity: 0 });
  const [expandedStage, setExpandedStage] = useState<number | null>(null);

  const currentStageSubmission = progress.stages.find(
    (s) => s.stage === progress.currentStage
  );
  const canAct =
    progress.status === "active" &&
    currentStageSubmission &&
    currentStageSubmission.result === "pending";

  // Build timeline steps
  const timelineSteps = [];

  // Step 1: Initial submission (always completed if progress exists)
  timelineSteps.push({
    stageNum: 1,
    title: "Application Submitted",
    description: "Candidate submitted initial form",
    state: "passed" as const,
    date: progress.stages.find((s) => s.stage === 1)?.submittedAt || null,
  });

  // Steps 2 to totalStages + 1: Evaluation stages
  for (let s = 1; s <= totalStages; s++) {
    const stageDbNum = s + 1; // stage 2 in db corresponds to Stage 1 review
    const submission = progress.stages.find((x) => x.stage === stageDbNum);

    let state: "passed" | "failed" | "pending" | "upcoming" = "upcoming";
    if (submission) {
      if (submission.result === "passed") state = "passed";
      else if (submission.result === "failed") state = "failed";
      else state = "pending";
    } else if (progress.status === "rejected" || progress.status === "passed") {
      state = "upcoming";
    } else if (progress.currentStage > stageDbNum) {
      state = "passed";
    }

    timelineSteps.push({
      stageNum: stageDbNum,
      title: `Stage ${s} Evaluation`,
      description: submission?.result === "pending" ? "Awaiting review" : `Stage ${s} review complete`,
      state,
      submission,
      date: submission?.submittedAt || null,
    });
  }

  // Final Step: Outcome
  let outcomeState: "passed" | "failed" | "upcoming" = "upcoming";
  if (progress.status === "passed") outcomeState = "passed";
  else if (progress.status === "rejected") outcomeState = "failed";

  timelineSteps.push({
    stageNum: 99,
    title: progress.status === "passed" ? "Accepted" : progress.status === "rejected" ? "Rejected" : "Outcome Decision",
    description: progress.status === "passed" ? "Candidate selected" : progress.status === "rejected" ? "Preference closed" : "Funnel pending",
    state: outcomeState,
    date: null,
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-zinc-900">
        <div>
          <CardDescription className="text-[10px] uppercase font-extrabold tracking-widest text-zinc-500">
            {label}
          </CardDescription>
          <CardTitle className="text-base font-extrabold mt-0.5">
            {DEPT_NAMES[deptSlug] ?? deptSlug}
          </CardTitle>
        </div>
        <Badge
          variant={
            progress.status === "active"
              ? "info"
              : progress.status === "passed"
              ? "success"
              : progress.status === "rejected"
              ? "destructive"
              : "default"
          }
        >
          {progress.status}
        </Badge>
      </CardHeader>

      <CardContent className="p-6 space-y-8">
        {/* Interactive Vertical Timeline */}
        <div className="space-y-6 relative pl-4 before:absolute before:left-[27px] before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-900">
          {timelineSteps.map((step, idx) => {
            const isLast = idx === timelineSteps.length - 1;
            const hasDetail = step.submission && step.stageNum > 1;
            const isExpanded = expandedStage === step.stageNum;

            return (
              <div key={idx} className="relative pl-8 space-y-2">
                {/* Node icon circle */}
                <div
                  className={`absolute left-[-21px] top-0.5 h-6 w-6 rounded-full border flex items-center justify-center z-10 transition-all ${
                    step.state === "passed"
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                      : step.state === "failed"
                      ? "bg-rose-500/10 border-rose-500 text-rose-400"
                      : step.state === "pending"
                      ? "bg-amber-500/10 border-amber-500 text-amber-400 animate-pulse"
                      : "bg-zinc-950 border-zinc-800 text-zinc-700"
                  }`}
                >
                  {step.state === "passed" ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : step.state === "failed" ? (
                    <XCircle className="h-3.5 w-3.5" />
                  ) : step.state === "pending" ? (
                    <Clock className="h-3.5 w-3.5" />
                  ) : (
                    <div className="h-1.5 w-1.5 rounded-full bg-zinc-800" />
                  )}
                </div>

                {/* Node label */}
                <div
                  onClick={() => {
                    if (hasDetail) {
                      setExpandedStage(isExpanded ? null : step.stageNum);
                    }
                  }}
                  className={`flex flex-col text-left transition-all ${
                    hasDetail ? "cursor-pointer group hover:opacity-90" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-xs font-bold ${
                        step.state !== "upcoming" ? "text-white" : "text-zinc-500"
                      }`}
                    >
                      {step.title}
                    </span>
                    {step.date && (
                      <span className="text-[9px] font-semibold text-zinc-500">
                        {new Date(step.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                    )}
                    {hasDetail && (
                      <span className="text-[9px] text-teal-400 font-bold group-hover:underline flex items-center gap-0.5">
                        {isExpanded ? "Hide Details" : "View Details"}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-500 font-medium">
                    {step.description}
                  </span>
                </div>

                {/* Expanded Stage submission info */}
                {isExpanded && step.submission && (
                  <div className="border border-zinc-900 rounded-xl bg-zinc-950/40 p-4 space-y-4 mt-2 animate-pixel-slide-up">
                    <ResponseViewer responses={step.submission.responses} />

                    {step.submission.scores && Object.keys(step.submission.scores).length > 0 && (
                      <div className="p-3 rounded-xl bg-teal-500/5 border border-teal-500/10 flex items-center gap-4 flex-wrap">
                        <Award className="h-4 w-4 text-teal-400 shrink-0" />
                        <div className="flex gap-4 flex-wrap">
                          {Object.entries(step.submission.scores).map(([metric, score]) => (
                            <div key={metric} className="text-xs font-bold text-white">
                              <span className="text-zinc-500 capitalize">{metric}:</span> {score}/5
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {step.submission.adminNote && (
                      <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 flex gap-3">
                        <MessageSquare className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-amber-400 uppercase font-extrabold tracking-wider">
                            Reviewer Note
                          </span>
                          <p className="text-xs text-zinc-300 mt-1">{step.submission.adminNote}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Panel */}
        {canAct && (
          <div className="border-t border-zinc-900 pt-6 space-y-4">
            <Badge variant="warning" className="uppercase font-bold tracking-wider text-[10px]">
              Reviewing Stage {progress.currentStage - 1} Submission
            </Badge>

            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold block">
                Evaluation Notes (visible to applicant)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write stage evaluation details, feedback, or interview instructions..."
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-700 resize-none transition-all"
              />
            </div>

            <div className="space-y-3 bg-zinc-950 border border-zinc-900 rounded-xl p-4">
              <p className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                Grading Rubric (Required to Advance)
              </p>
              {["Technical", "Communication", "Creativity"].map((metric) => {
                const key = metric.toLowerCase();
                return (
                  <div key={metric} className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold text-zinc-300">{metric} score</span>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setScores((s) => ({ ...s, [key]: val }))}
                          className={`h-8 w-8 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                            scores[key] === val
                              ? "bg-teal-500 text-slate-950 shadow-[0_0_10px_rgba(20,184,166,0.3)]"
                              : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="destructive"
                onClick={() => onActionTrigger(prefKey, "reject", note)}
                disabled={acting}
                className="flex-1 font-bold h-11"
              >
                Reject Candidate
              </Button>
              <Button
                variant="emerald"
                onClick={() => {
                  if (Object.values(scores).some((s) => s === 0)) {
                    alert("Please grade all Rubric criteria (1-5) before advancing.");
                    return;
                  }
                  onActionTrigger(prefKey, "advance", note, scores);
                }}
                disabled={acting}
                className="flex-1 font-bold h-11"
              >
                Advance Stage
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ApplicantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [dept1, setDept1] = useState<ClientDepartment | null>(null);
  const [dept2, setDept2] = useState<ClientDepartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [message, setMessage] = useState("");

  // Custom alert confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    preference: "first" | "second";
    action: "advance" | "reject";
    note: string;
    scores?: Record<string, number>;
  } | null>(null);

  const load = async () => {
    try {
      const res = await fetch(`/api/admin/applications/${id}`);
      const data = await res.json();
      if (data.success) {
        setApplication(data.application);
        setDept1(data.dept1);
        setDept2(data.dept2);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const init = async () => {
      if (active) {
        await load();
      }
    };
    init();
    return () => {
      active = false;
    };
  }, [id]);

  const handleActionConfirmTrigger = (
    preference: "first" | "second",
    action: "advance" | "reject",
    note: string,
    scores?: Record<string, number>
  ) => {
    setConfirmDialog({
      isOpen: true,
      preference,
      action,
      note,
      scores,
    });
  };

  const handleActionExecute = async () => {
    if (!confirmDialog) return;
    const { preference, action, note, scores } = confirmDialog;
    setConfirmDialog(null);
    setActing(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, preference, note, scores }),
      });
      const data = await res.json();
      setMessage(data.success ? data.message : data.error ?? "Action failed.");
      if (data.success) await load();
    } catch {
      setMessage("Network communication failure.");
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-teal-400 animate-spin" />
          <p className="text-sm text-zinc-400 font-medium">Loading details...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="max-w-xs text-center p-6 border-zinc-900 space-y-4 bg-zinc-950">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-white">Application Not Found</h2>
          <Button onClick={() => router.push("/admin/applications")} className="w-full font-bold">
            Back to Applications
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <AdminLayout activePage="applications">
      <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Back Link */}
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/applications")}
          className="gap-2 text-zinc-450 hover:text-white pl-0 -ml-1 text-xs"
        >
          <ChevronLeft className="h-4 w-4" /> Back to Applications
        </Button>

        {/* Header */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="h-12 w-12 rounded-full bg-zinc-950 border border-zinc-900 flex items-center justify-center text-lg font-bold text-teal-400">
            {application.userEmail.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{application.userEmail}</h1>
            <p className="text-xs text-zinc-500 mt-1">
              Registered on{" "}
              {new Date(application.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="ml-auto">
            <Badge
              variant={
                application.overallStatus === "selected"
                  ? "success"
                  : application.overallStatus === "rejected"
                  ? "destructive"
                  : "warning"
              }
              className="text-xs px-3.5 py-1.5"
            >
              {application.overallStatus}
            </Badge>
          </div>
        </div>

        {/* Status notification messages */}
        {message && (
          <div
            className={`p-4 rounded-xl border text-sm font-bold ${
              message.toLowerCase().includes("success")
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/20 text-rose-400"
            }`}
          >
            {message}
          </div>
        )}

        {/* Personal Info Card */}
        {(() => {
          const personalInfoStage =
            application.firstPrefProgress.stages.find((s) => s.stage === 1) ||
            application.secondPrefProgress.stages.find((s) => s.stage === 1);
          if (!personalInfoStage) return null;

          return (
            <Card>
              <CardHeader className="border-b border-zinc-900 pb-4">
                <CardTitle className="text-base font-bold text-white">Personal Information</CardTitle>
                <CardDescription>General registration parameters submitted by student</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">Full Name</p>
                  <p className="text-sm font-semibold text-zinc-200 mt-1.5">
                    {String(personalInfoStage.responses.fullName || "—")}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">Phone Number</p>
                  <p className="text-sm font-semibold text-zinc-200 mt-1.5">
                    {String(personalInfoStage.responses.phone || "—")}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">Registration No</p>
                  <p className="text-sm font-semibold text-zinc-200 mt-1.5">
                    {String(personalInfoStage.responses.regNo || "—")}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">Year of Study</p>
                  <p className="text-sm font-semibold text-zinc-200 mt-1.5">
                    {String(personalInfoStage.responses.year || "—")}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">Branch / Program</p>
                  <p className="text-sm font-semibold text-zinc-200 mt-1.5">
                    {String(personalInfoStage.responses.branch || "—")}
                  </p>
                </div>
                {!!personalInfoStage.responses.whyMic && (
                  <div className="md:col-span-2 lg:col-span-3">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold">Why MIC?</p>
                    <p className="text-sm text-zinc-300 mt-2 leading-relaxed bg-black border border-zinc-900 p-4 rounded-xl">
                      {String(personalInfoStage.responses.whyMic)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })()}

        {/* Preference panel columns */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <PrefPanel
            progress={application.firstPrefProgress}
            deptSlug={application.firstPreference}
            label="1st Preference"
            onActionTrigger={handleActionConfirmTrigger}
            acting={acting}
            totalStages={dept1?.totalStages ?? 2}
          />
          {application.secondPreference ? (
            <PrefPanel
              progress={application.secondPrefProgress}
              deptSlug={application.secondPreference}
              label="2nd Preference"
              onActionTrigger={handleActionConfirmTrigger}
              acting={acting}
              totalStages={dept2?.totalStages ?? 2}
            />
          ) : (
            <Card className="flex items-center justify-center p-8 border-dashed border-zinc-900">
              <div className="text-center">
                <p className="text-xs text-zinc-500 font-bold">No 2nd Preference Selection</p>
                <p className="text-[10px] text-zinc-650 mt-1">Applicant selected only one department choice</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* AlertDialog to replace standard window.confirm for applicant updates */}
      <AlertDialog
        isOpen={confirmDialog?.isOpen ?? false}
        onClose={() => setConfirmDialog(null)}
        onConfirm={handleActionExecute}
        title={confirmDialog?.action === "advance" ? "Advance Candidate Stage?" : "Reject Candidate?"}
        description={
          confirmDialog?.action === "advance"
            ? `Are you sure you want to ADVANCE this candidate to the next stage in their ${confirmDialog?.preference} preference department?`
            : `Are you sure you want to REJECT this candidate from their ${confirmDialog?.preference} preference department?`
        }
        confirmText={confirmDialog?.action === "advance" ? "Yes, Advance" : "Yes, Reject"}
        variant={confirmDialog?.action === "reject" ? "destructive" : "default"}
        loading={acting}
      />
    </AdminLayout>
  );
}
