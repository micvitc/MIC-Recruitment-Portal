"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Users,
  Settings,
  LogOut,
  Loader2,
  ArrowUpDown,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface Application {
  _id: string;
  userEmail: string;
  firstPreference: string;
  secondPreference: string;
  firstPrefType: string;
  overallStatus: string;
  activePreference: string;
  firstPrefProgress: { currentStage: number; status: string };
  secondPrefProgress: { currentStage: number; status: string };
  createdAt: string;
}

const DEPT_NAMES: Record<string, string> = {
  development: "Development",
  "competitive-coding": "Comp. Coding",
  "ui-ux": "UI/UX",
  "ai-ml": "AI/ML",
  "cyber-security": "Cyber Security",
  design: "Design",
  management: "Management",
  entrepreneurship: "Entrepreneurship",
  "content-media": "Content & Media",
};

const DEPTS = Object.keys(DEPT_NAMES);

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    "in-progress": "bg-amber-500/15 text-amber-400",
    selected: "bg-emerald-500/15 text-emerald-400",
    rejected: "bg-rose-500/15 text-rose-400",
    waitlisted: "bg-blue-500/15 text-blue-400",
  };
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${map[status] ?? "bg-slate-700 text-slate-400"}`}>
      {status}
    </span>
  );
}

export default function AdminApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1, limit: 25 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "25",
        ...(search && { q: search }),
        ...(deptFilter && { dept: deptFilter }),
        ...(statusFilter && { status: statusFilter }),
      });
      const res = await fetch(`/api/admin/applications?${params}`);
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications);
        setPagination(data.pagination);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [page, search, deptFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-56 bg-slate-900 border-r border-slate-800 flex flex-col z-20">
        <div className="p-5 border-b border-slate-800">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">MIC Admin</p>
          <p className="text-base font-bold text-white mt-1">Applications</p>
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
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="ml-56 p-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Applications</h1>
            <p className="text-sm text-slate-400 mt-1">{pagination.total} total applicants</p>
          </div>
          <a
            href="/api/admin/applications/export"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-xl text-white font-bold text-sm transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            Export to CSV
          </a>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-slate-600 transition-all w-64"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <select
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
              className="pl-9 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-slate-600 appearance-none cursor-pointer"
            >
              <option value="">All Departments</option>
              {DEPTS.map((d) => (
                <option key={d} value={d}>{DEPT_NAMES[d]}</option>
              ))}
            </select>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-slate-600 appearance-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="in-progress">In Progress</option>
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
            <option value="waitlisted">Waitlisted</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  {["Email", "1st Pref", "2nd Pref", "Stage", "Status", "Applied"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      <div className="flex items-center gap-1">
                        {h} <ArrowUpDown className="h-3 w-3 opacity-40" />
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <Loader2 className="h-6 w-6 text-teal-400 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 text-sm">
                      No applications found
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr
                      key={app._id}
                      onClick={() => router.push(`/admin/applications/${app._id}`)}
                      className="border-b border-slate-800/50 hover:bg-slate-800/40 cursor-pointer transition-all"
                    >
                      <td className="px-4 py-3 text-sm text-white font-medium">{app.userEmail}</td>
                      <td className="px-4 py-3 text-xs text-slate-300">{DEPT_NAMES[app.firstPreference] ?? app.firstPreference}</td>
                      <td className="px-4 py-3 text-xs text-slate-300">{DEPT_NAMES[app.secondPreference] ?? app.secondPreference}</td>
                      <td className="px-4 py-3 text-xs text-slate-400">
                        Stage {app.activePreference === "first"
                          ? app.firstPrefProgress.currentStage
                          : app.secondPrefProgress.currentStage}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={app.overallStatus} />
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                      </td>
                      <td className="px-4 py-3 text-xs text-teal-400 hover:text-teal-300">View →</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
              <p className="text-xs text-slate-500">
                Page {pagination.page} of {pagination.pages} · {pagination.total} results
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1}
                  className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={pagination.page >= pagination.pages}
                  className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-40 transition-all"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
