"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BarChart3,
  Users,
  Settings,
  LogOut,
  Loader2,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronUp,
  Save,
  CheckCircle2,
} from "lucide-react";

const DEPTS = [
  { slug: "development", name: "Development", type: "tech" },
  { slug: "competitive-coding", name: "Competitive Coding", type: "tech" },
  { slug: "ui-ux", name: "UI/UX", type: "tech" },
  { slug: "ai-ml", name: "AI/ML", type: "tech" },
  { slug: "cyber-security", name: "Cyber Security", type: "tech" },
  { slug: "design", name: "Design", type: "non-tech" },
  { slug: "management", name: "Management", type: "non-tech" },
  { slug: "entrepreneurship", name: "Entrepreneurship", type: "non-tech" },
  { slug: "content-media", name: "Content & Media", type: "non-tech" },
];

interface DeptConfig {
  slug: string;
  isActive: boolean;
  maxCapacity: number;
  totalStages: number;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [cycle, setCycle] = useState<{ isOpen: boolean; label: string } | null>(null);
  const [deptConfigs, setDeptConfigs] = useState<Record<string, DeptConfig>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [toggling, setToggling] = useState(false);
  const [expanded, setExpanded] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        const [cycleRes, ...deptRes] = await Promise.all([
          fetch("/api/admin/cycle"),
          ...DEPTS.map((d) => fetch(`/api/admin/departments/${d.slug}`)),
        ]);
        const cycleData = await cycleRes.json();
        if (cycleData.success) setCycle(cycleData.cycle);

        const configs: Record<string, DeptConfig> = {};
        for (let i = 0; i < deptRes.length; i++) {
          const data = await deptRes[i].json();
          if (data.success && data.department) {
            const dept = data.department;
            configs[dept.slug] = {
              slug: dept.slug,
              isActive: dept.isActive,
              maxCapacity: dept.maxCapacity,
              totalStages: dept.totalStages,
            };
          }
        }
        setDeptConfigs(configs);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleCycle = async () => {
    if (!cycle) return;
    if (!confirm(`${cycle.isOpen ? "Close" : "Open"} recruitment?`)) return;
    setToggling(true);
    const res = await fetch("/api/admin/cycle", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isOpen: !cycle.isOpen }),
    });
    const data = await res.json();
    if (data.success) setCycle(data.cycle);
    setToggling(false);
  };

  const saveDept = async (slug: string) => {
    const config = deptConfigs[slug];
    if (!config) return;
    setSaving((p) => ({ ...p, [slug]: true }));
    try {
      await fetch(`/api/admin/departments/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: config.isActive,
          maxCapacity: config.maxCapacity,
          totalStages: config.totalStages,
        }),
      });
      setSaved((p) => ({ ...p, [slug]: true }));
      setTimeout(() => setSaved((p) => ({ ...p, [slug]: false })), 2500);
    } catch {
      // ignore
    } finally {
      setSaving((p) => ({ ...p, [slug]: false }));
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
          <p className="text-base font-bold text-white mt-1">Settings</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {[
            { icon: <BarChart3 className="h-4 w-4" />, label: "Dashboard", href: "/admin/dashboard" },
            { icon: <Users className="h-4 w-4" />, label: "Applications", href: "/admin/applications" },
            { icon: <Settings className="h-4 w-4" />, label: "Settings", href: "/admin/settings", active: true },
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
      <div className="ml-56 p-8 space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Settings</h1>
          <p className="text-sm text-slate-400 mt-1">Manage recruitment cycle and department configurations</p>
        </div>

        {/* Recruitment cycle toggle */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-white">Recruitment Cycle</h2>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-200">{cycle?.label ?? "MIC Recruitment 2026–27"}</p>
              <p className="text-xs text-slate-500 mt-1">
                {cycle?.isOpen
                  ? "Students can apply and edit their responses."
                  : "Applications and edits are locked."}
              </p>
            </div>
            <button
              onClick={toggleCycle}
              disabled={toggling}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-xl border font-bold text-sm transition-all ${
                cycle?.isOpen
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
              }`}
            >
              {toggling ? <Loader2 className="h-4 w-4 animate-spin" /> : cycle?.isOpen ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
              {cycle?.isOpen ? "OPEN — Click to Close" : "CLOSED — Click to Open"}
            </button>
          </div>
        </div>

        {/* Department configurations */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-800">
            <h2 className="text-base font-bold text-white">Department Configuration</h2>
            <p className="text-xs text-slate-400 mt-1">Toggle active status, set max capacity, and configure stage counts.</p>
          </div>

          <div className="divide-y divide-slate-800">
            {DEPTS.map((dept) => {
              const config = deptConfigs[dept.slug];
              const isExpanded = expanded === dept.slug;

              return (
                <div key={dept.slug}>
                  <button
                    onClick={() => setExpanded(isExpanded ? "" : dept.slug)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-800/30 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold text-white`}>{dept.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        dept.type === "tech" ? "bg-cyan-500/15 text-cyan-400" : "bg-violet-500/15 text-violet-400"
                      }`}>
                        {dept.type}
                      </span>
                      {config && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          config.isActive ? "bg-emerald-500/15 text-emerald-400" : "bg-slate-700 text-slate-500"
                        }`}>
                          {config.isActive ? "Active" : "Inactive"}
                        </span>
                      )}
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                  </button>

                  {isExpanded && config && (
                    <div className="px-5 pb-5 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Active toggle */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Active</label>
                          <button
                            onClick={() =>
                              setDeptConfigs((p) => ({
                                ...p,
                                [dept.slug]: { ...p[dept.slug], isActive: !p[dept.slug].isActive },
                              }))
                            }
                            className={`w-full py-2.5 rounded-xl border font-bold text-sm transition-all ${
                              config.isActive
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                                : "bg-slate-800 border-slate-700 text-slate-400"
                            }`}
                          >
                            {config.isActive ? "Enabled" : "Disabled"}
                          </button>
                        </div>

                        {/* Max capacity */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Max Capacity</label>
                          <input
                            type="number"
                            min={1}
                            max={200}
                            value={config.maxCapacity}
                            onChange={(e) =>
                              setDeptConfigs((p) => ({
                                ...p,
                                [dept.slug]: { ...p[dept.slug], maxCapacity: parseInt(e.target.value) || 1 },
                              }))
                            }
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-slate-600"
                          />
                        </div>

                        {/* Total stages */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Total Stages</label>
                          <input
                            type="number"
                            min={1}
                            max={5}
                            value={config.totalStages}
                            onChange={(e) =>
                              setDeptConfigs((p) => ({
                                ...p,
                                [dept.slug]: { ...p[dept.slug], totalStages: parseInt(e.target.value) || 1 },
                              }))
                            }
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-slate-600"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => saveDept(dept.slug)}
                        disabled={saving[dept.slug]}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 font-bold text-sm hover:bg-teal-500/20 transition-all disabled:opacity-50"
                      >
                        {saving[dept.slug] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : saved[dept.slug] ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        {saved[dept.slug] ? "Saved!" : "Save Changes"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
