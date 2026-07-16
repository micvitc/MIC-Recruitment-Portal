"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Users,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ToggleLeft,
  ToggleRight,
  Loader2,
  LogOut,
  Settings,
  BarChart3,
  Clock,
  RefreshCw,
} from "lucide-react";

interface Stats {
  total: number;
  inProgress: number;
  selected: number;
  rejected: number;
  conversionRate: string;
  recentActivity: Array<{
    userEmail: string;
    overallStatus: string;
    firstPreference: string;
    secondPreference: string;
    updatedAt: string;
  }>;
}

interface Cycle {
  isOpen: boolean;
  cycleId: string;
  label: string;
  openedAt?: string;
  closedAt?: string;
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className={`bg-slate-900/50 border border-slate-800 rounded-2xl p-5 space-y-3 hover:border-slate-700 transition-all`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">{label}</span>
        <div className={`p-2 rounded-xl ${color}`}>{icon}</div>
      </div>
      <div>
        <p className="text-3xl font-extrabold text-white">{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
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

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [statsRes, cycleRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/cycle"),
      ]);
      const [statsData, cycleData] = await Promise.all([
        statsRes.json(),
        cycleRes.json(),
      ]);
      if (statsData.success) setStats(statsData.stats);
      if (cycleData.success) setCycle(cycleData.cycle);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const toggleCycle = async () => {
    if (!cycle) return;
    if (!confirm(`Are you sure you want to ${cycle.isOpen ? "CLOSE" : "OPEN"} recruitment?`)) return;
    setToggling(true);
    try {
      const res = await fetch("/api/admin/cycle", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen: !cycle.isOpen }),
      });
      const data = await res.json();
      if (data.success) setCycle(data.cycle);
    } catch {
      // ignore
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-teal-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-56 bg-slate-900 border-r border-slate-800 flex flex-col z-20">
        <div className="p-5 border-b border-slate-800">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">MIC Admin</p>
          <p className="text-base font-bold text-white mt-1">Dashboard</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {[
            { icon: <BarChart3 className="h-4 w-4" />, label: "Dashboard", href: "/admin/dashboard", active: true },
            { icon: <Users className="h-4 w-4" />, label: "Applications", href: "/admin/applications", active: false },
            { icon: <Settings className="h-4 w-4" />, label: "Settings", href: "/admin/settings", active: false },
          ].map((item) => (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                item.active
                  ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="ml-56 p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Overview</h1>
            <p className="text-sm text-slate-400 mt-1">MIC Recruitment 2026–27</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setRefreshing(true); loadData(); }}
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-all"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>

            {/* Recruitment toggle */}
            <button
              onClick={toggleCycle}
              disabled={toggling}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border font-bold text-sm transition-all ${
                cycle?.isOpen
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
              }`}
            >
              {toggling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : cycle?.isOpen ? (
                <ToggleRight className="h-5 w-5" />
              ) : (
                <ToggleLeft className="h-5 w-5" />
              )}
              Recruitment {cycle?.isOpen ? "OPEN" : "CLOSED"}
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Users className="h-4 w-4 text-teal-400" />}
            label="Total Applicants"
            value={stats?.total ?? 0}
            color="bg-teal-500/10"
          />
          <StatCard
            icon={<Clock className="h-4 w-4 text-amber-400" />}
            label="In Progress"
            value={stats?.inProgress ?? 0}
            color="bg-amber-500/10"
          />
          <StatCard
            icon={<CheckCircle2 className="h-4 w-4 text-emerald-400" />}
            label="Selected"
            value={stats?.selected ?? 0}
            color="bg-emerald-500/10"
          />
          <StatCard
            icon={<TrendingUp className="h-4 w-4 text-violet-400" />}
            label="Conversion Rate"
            value={`${stats?.conversionRate ?? "0"}%`}
            sub={`${stats?.rejected ?? 0} not selected`}
            color="bg-violet-500/10"
          />
        </div>

        {/* Recent activity + Quick actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent activity */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">Recent Activity</h2>
              <button
                onClick={() => router.push("/admin/applications")}
                className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
              >
                View all →
              </button>
            </div>
            <div className="space-y-3">
              {(stats?.recentActivity ?? []).length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">No activity yet</p>
              ) : (
                (stats?.recentActivity ?? []).map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-all cursor-pointer" onClick={() => router.push("/admin/applications")}>
                    <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                      {item.userEmail.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{item.userEmail}</p>
                      <p className="text-[10px] text-slate-500">
                        {DEPT_NAMES[item.firstPreference] ?? item.firstPreference} → {DEPT_NAMES[item.secondPreference] ?? item.secondPreference}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.overallStatus === "selected"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : item.overallStatus === "rejected"
                          ? "bg-rose-500/15 text-rose-400"
                          : "bg-amber-500/15 text-amber-400"
                    }`}>
                      {item.overallStatus}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-base font-bold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/admin/applications")}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all text-left"
              >
                <Users className="h-5 w-5 text-teal-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-white">Review Applications</p>
                  <p className="text-[11px] text-slate-400">Advance or reject applicants through stages</p>
                </div>
              </button>
              <button
                onClick={() => router.push("/admin/settings")}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all text-left"
              >
                <Settings className="h-5 w-5 text-violet-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-white">Department Settings</p>
                  <p className="text-[11px] text-slate-400">Edit questions, capacity, and active status</p>
                </div>
              </button>
              <button
                onClick={toggleCycle}
                disabled={toggling}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all text-left disabled:opacity-50"
              >
                {cycle?.isOpen ? (
                  <XCircle className="h-5 w-5 text-rose-400 shrink-0" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                )}
                <div>
                  <p className="text-sm font-bold text-white">
                    {cycle?.isOpen ? "Close Recruitment" : "Open Recruitment"}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {cycle?.isOpen
                      ? "Stop accepting new applications and edits"
                      : "Allow students to apply and edit responses"}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
