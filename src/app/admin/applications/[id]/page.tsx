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
  BarChart3,
  Users,
  Settings,
  LogOut,
  AlertTriangle,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface StageSubmission {
  stage: number;
  submittedAt: string;
  result: "pending" | "passed" | "failed";
  adminNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  responses: Record<string, unknown>;
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
  activePreference: string;
  overallStatus: string;
  firstPrefProgress: PrefProgress;
  secondPrefProgress: PrefProgress;
  createdAt: string;
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
    <div className="space-y-3">
      {Object.entries(responses).map(([key, val]) => (
        <div key={key} className="space-y-1">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{key}</p>
          <p className="text-sm text-slate-200 bg-slate-800/50 rounded-lg p-3 leading-relaxed">
            {Array.isArray(val) ? val.join(", ") : String(val ?? "—")}
          </p>
        </div>
      ))}
    </div>
  );
}

function PrefPanel({
  progress,
  deptSlug,
  label,
  onAction,
  acting,
}: {
  progress: PrefProgress;
  deptSlug: string;
  label: string;
  onAction: (preference: "first" | "second", action: "advance" | "reject", note: string) => void;
  acting: boolean;
}) {
  const prefKey = label === "1st Preference" ? "first" : "second" as "first" | "second";
  const [note, setNote] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  const currentStageSubmission = progress.stages.find(
    (s) => s.stage === progress.currentStage
  );
  const canAct =
    progress.status === "active" &&
    currentStageSubmission &&
    currentStageSubmission.result === "pending";

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{label}</p>
          <h3 className="text-lg font-bold text-white mt-0.5">{DEPT_NAMES[deptSlug] ?? deptSlug}</h3>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          progress.status === "active" ? "bg-teal-500/15 text-teal-400"
          : progress.status === "passed" ? "bg-emerald-500/15 text-emerald-400"
          : progress.status === "rejected" ? "bg-rose-500/15 text-rose-400"
          : "bg-slate-700 text-slate-400"
        }`}>
          {progress.status}
        </span>
      </div>

      {/* Stage submissions */}
      <div className="space-y-3">
        {progress.stages.map((sub) => (
          <div key={sub.stage} className="border border-slate-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setExpanded(expanded === sub.stage ? null : sub.stage)}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-800/40 transition-all"
            >
              <div className="flex items-center gap-3">
                {sub.result === "passed" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : sub.result === "failed" ? (
                  <XCircle className="h-4 w-4 text-rose-400" />
                ) : (
                  <Clock className="h-4 w-4 text-amber-400" />
                )}
                <span className="text-sm font-semibold text-white">Stage {sub.stage}</span>
                <span className="text-[10px] font-bold text-slate-500">
                  {new Date(sub.submittedAt).toLocaleDateString("en-IN")}
                </span>
              </div>
              <ChevronRight className={`h-4 w-4 text-slate-500 transition-transform ${expanded === sub.stage ? "rotate-90" : ""}`} />
            </button>
            {expanded === sub.stage && (
              <div className="p-4 pt-0 border-t border-slate-800">
                <ResponseViewer responses={sub.responses} />
                {sub.adminNote && (
                  <div className="mt-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                    <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-1">Admin Note</p>
                    <p className="text-xs text-slate-300">{sub.adminNote}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        {progress.stages.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-4">No stages submitted yet</p>
        )}
      </div>

      {/* Action panel */}
      {canAct && (
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Reviewing Stage {progress.currentStage} Response
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional admin note (visible to applicant)"
            rows={2}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-slate-600 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => onAction(prefKey, "advance", note)}
              disabled={acting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm hover:bg-emerald-500/20 transition-all disabled:opacity-50"
            >
              {acting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Advance
            </button>
            <button
              onClick={() => onAction(prefKey, "reject", note)}
              disabled={acting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-sm hover:bg-rose-500/20 transition-all disabled:opacity-50"
            >
              {acting ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
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
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const res = await fetch(`/api/admin/applications/${id}`);
      const data = await res.json();
      if (data.success) setApplication(data.application);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleAction = async (
    preference: "first" | "second",
    action: "advance" | "reject",
    note: string
  ) => {
    if (!confirm(`Are you sure you want to ${action} this applicant from their ${preference} preference?`)) return;
    setActing(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, preference, note }),
      });
      const data = await res.json();
      setMessage(data.success ? data.message : data.error ?? "Error");
      if (data.success) await load();
    } catch {
      setMessage("Network error.");
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-teal-400 animate-spin" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <AlertTriangle className="h-10 w-10 text-amber-400 mx-auto" />
          <p className="text-white font-bold">Applicant not found</p>
          <button onClick={() => router.push("/admin/applications")} className="text-teal-400 text-sm hover:text-teal-300">← Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-56 bg-slate-900 border-r border-slate-800 flex flex-col z-20">
        <div className="p-5 border-b border-slate-800">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">MIC Admin</p>
          <p className="text-base font-bold text-white mt-1">Applicant</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {[
            { icon: <BarChart3 className="h-4 w-4" />, label: "Dashboard", href: "/admin/dashboard" },
            { icon: <Users className="h-4 w-4" />, label: "Applications", href: "/admin/applications", active: true },
            { icon: <Settings className="h-4 w-4" />, label: "Settings", href: "/admin/settings" },
          ].map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                item.active ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-800">
          <button onClick={() => signOut({ callbackUrl: "/admin/login" })} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="ml-56 p-8 space-y-6">
        <button onClick={() => router.push("/admin/applications")} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ChevronLeft className="h-4 w-4" /> Back to Applications
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="h-12 w-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-lg font-bold text-white">
            {application.userEmail.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">{application.userEmail}</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Applied {new Date(application.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="ml-auto">
            <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${
              application.overallStatus === "selected" ? "bg-emerald-500/15 text-emerald-400"
              : application.overallStatus === "rejected" ? "bg-rose-500/15 text-rose-400"
              : "bg-amber-500/15 text-amber-400"
            }`}>
              {application.overallStatus}
            </span>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl border text-sm ${
            message.includes("success") || message.includes("uccess")
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}>
            {message}
          </div>
        )}

        {/* Preference panels side by side */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <PrefPanel
            progress={application.firstPrefProgress}
            deptSlug={application.firstPreference}
            label="1st Preference"
            onAction={handleAction}
            acting={acting}
          />
          <PrefPanel
            progress={application.secondPrefProgress}
            deptSlug={application.secondPreference}
            label="2nd Preference"
            onAction={handleAction}
            acting={acting}
          />
        </div>
      </div>
    </div>
  );
}
