"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ChevronDown,
  ChevronUp,
  Save,
  CheckCircle2,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertDialog } from "@/components/ui/dialog";

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
  
  // AlertDialog state
  const [showCycleConfirm, setShowCycleConfirm] = useState(false);

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

  const handleToggleCycleConfirm = async () => {
    if (!cycle) return;
    setShowCycleConfirm(false);
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
      <div className="min-h-[100dvh] bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-teal-400 animate-spin" />
          <p className="text-sm text-zinc-400 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout activePage="settings">
      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Settings</h1>
          <p className="text-sm text-zinc-450 mt-1">Manage recruitment cycles and configure department stages</p>
        </div>

        {/* Recruitment cycle toggle */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-bold">Recruitment Forms Status</CardTitle>
            <CardDescription>Open or close applications for the recruitment cycle</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between flex-wrap gap-6 pt-0">
            <div>
              <p className="text-sm font-bold text-zinc-200">{cycle?.label ?? "MIC Recruitment 2026–27"}</p>
              <p className="text-xs text-zinc-500 mt-1">
                {cycle?.isOpen
                  ? "Students can currently access the portal to apply and modify responses."
                  : "All application forms and candidate edit controls are currently locked."}
              </p>
            </div>
            <Button
              variant={cycle?.isOpen ? "default" : "destructive"}
              onClick={() => setShowCycleConfirm(true)}
              disabled={toggling}
              className="px-6 font-bold h-11"
            >
              {toggling && <Loader2 className="h-4 w-4 animate-spin" />}
              {cycle?.isOpen ? "OPEN — Click to Close" : "CLOSED — Click to Open"}
            </Button>
          </CardContent>
        </Card>

        {/* Department configurations */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-zinc-900 bg-zinc-950/10">
            <CardTitle className="text-base font-bold">Department Configuration</CardTitle>
            <CardDescription>
              Toggle active status, cap admission counts, and configure stage sequences
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-zinc-900">
            {DEPTS.map((dept) => {
              const config = deptConfigs[dept.slug];
              const isExpanded = expanded === dept.slug;

              return (
                <div key={dept.slug} className="transition-colors hover:bg-zinc-950/10">
                  <button
                    onClick={() => setExpanded(isExpanded ? "" : dept.slug)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left transition-all hover:bg-zinc-900/30 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-white">{dept.name}</span>
                      <Badge variant={dept.type === "tech" ? "info" : "secondary"}>
                        {dept.type}
                      </Badge>
                      {config && (
                        <Badge variant={config.isActive ? "success" : "default"}>
                          {config.isActive ? "Active" : "Inactive"}
                        </Badge>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-zinc-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-zinc-500" />
                    )}
                  </button>

                  {isExpanded && config && (
                    <div className="px-6 pb-6 pt-2 space-y-5 bg-zinc-900/10">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Active toggle */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
                            Status State
                          </label>
                          <Button
                            variant={config.isActive ? "emerald" : "secondary"}
                            onClick={() =>
                              setDeptConfigs((p) => ({
                                ...p,
                                [dept.slug]: { ...p[dept.slug], isActive: !p[dept.slug].isActive },
                              }))
                            }
                            className="w-full font-bold text-sm h-10"
                          >
                            {config.isActive ? "Active / Enabled" : "Inactive / Disabled"}
                          </Button>
                        </div>

                        {/* Max capacity */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
                            Max Capacity Limit
                          </label>
                          <Input
                            type="number"
                            min={1}
                            max={200}
                            value={config.maxCapacity}
                            onChange={(e) =>
                              setDeptConfigs((p) => ({
                                ...p,
                                [dept.slug]: {
                                  ...p[dept.slug],
                                  maxCapacity: parseInt(e.target.value) || 1,
                                },
                              }))
                            }
                            className="font-bold"
                          />
                        </div>

                        {/* Total stages */}
                        <div className="space-y-2">
                          <label className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
                            Total Evaluation Stages
                          </label>
                          <Input
                            type="number"
                            min={1}
                            max={5}
                            value={config.totalStages}
                            onChange={(e) =>
                              setDeptConfigs((p) => ({
                                ...p,
                                [dept.slug]: {
                                  ...p[dept.slug],
                                  totalStages: parseInt(e.target.value) || 1,
                                },
                              }))
                            }
                            className="font-bold"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button
                          onClick={() => saveDept(dept.slug)}
                          disabled={saving[dept.slug]}
                          variant="emerald"
                          className="font-bold text-sm h-10 min-w-36 gap-2"
                        >
                          {saving[dept.slug] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : saved[dept.slug] ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          {saved[dept.slug] ? "Changes Saved!" : "Save Changes"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* AlertDialog to replace standard window.confirm */}
      <AlertDialog
        isOpen={showCycleConfirm}
        onClose={() => setShowCycleConfirm(false)}
        onConfirm={handleToggleCycleConfirm}
        title={cycle?.isOpen ? "Lock Recruitment Applications?" : "Unlock Recruitment Applications?"}
        description={
          cycle?.isOpen
            ? "Students will no longer be able to submit application requests or adjust their existing application settings. Are you sure you want to proceed?"
            : "This action will reopen forms and allow new candidates to submit forms and edit settings. Are you sure you want to proceed?"
        }
        confirmText={cycle?.isOpen ? "Yes, Lock Cycle" : "Yes, Unlock Cycle"}
        variant={cycle?.isOpen ? "destructive" : "default"}
        loading={toggling}
      />
    </AdminLayout>
  );
}
