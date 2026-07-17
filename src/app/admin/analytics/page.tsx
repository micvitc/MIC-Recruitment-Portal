"use client";

import React, { useEffect, useState } from "react";
import {
  Loader2,
  RefreshCw,
  TrendingUp,
  Award,
  Users,
  Compass,
  ChevronRight,
  TrendingDown,
  Percent,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Stats {
  total: number;
  inProgress: number;
  selected: number;
  rejected: number;
  conversionRate: string;
  byDepartment: {
    byFirst: Array<{ _id: string; count: number }>;
    bySecond: Array<{ _id: string; count: number }>;
  };
  dailyApplications: Array<{ _id: string; applications: number }>;
  recentActivity: Array<{
    userEmail: string;
    overallStatus: string;
    firstPreference: string;
    secondPreference: string;
    updatedAt: string;
  }>;
  byStage: Array<{ _id: number; count: number }>;
  departmentsList: Array<{
    _id: string;
    slug: string;
    name: string;
    maxCapacity: number;
    isActive: boolean;
  }>;
  acceptedByDept: Array<{ _id: string; count: number }>;
}

interface DeptStats {
  slug: string;
  name: string;
  maxCapacity: number;
  totalStages: number;
  firstPrefCount: number;
  secondPrefCount: number;
  acceptedCount: number;
  avgScores: {
    technical: number;
    communication: number;
    creativity: number;
  };
  stagesFunnel: Array<{ stageNum: number; count: number }>;
  yearDistribution: Array<{ year: string; count: number }>;
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

const DEPT_SHORT_NAMES: Record<string, string> = {
  development: "Dev",
  "competitive-coding": "CC",
  "ui-ux": "UI/UX",
  "ai-ml": "AI/ML",
  "cyber-security": "CyberSec",
  design: "Design",
  management: "Mgmt",
  entrepreneurship: "EP",
  "content-media": "Media",
};

export default function AdvancedAnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Drawer states
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [deptStats, setDeptStats] = useState<DeptStats | null>(null);
  const [deptLoading, setDeptLoading] = useState(false);

  const loadData = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let active = true;
    const init = async () => {
      if (active) {
        await loadData();
      }
    };
    init();
    return () => {
      active = false;
    };
  }, []);

  const handleOpenDeptDrawer = async (slug: string) => {
    setSelectedDept(slug);
    setDeptLoading(true);
    setDeptStats(null);
    try {
      const res = await fetch(`/api/admin/departments/${slug}/stats`);
      const data = await res.json();
      if (data.success) {
        setDeptStats(data.stats);
      }
    } catch {
      // ignore
    } finally {
      setDeptLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-teal-400 animate-spin" />
          <p className="text-sm text-zinc-400 font-medium">Loading advanced analytics...</p>
        </div>
      </div>
    );
  }

  // Prep data for department comparisons
  const depts = Object.keys(DEPT_NAMES);
  const comparativeData = depts.map((d) => {
    const firstCount = stats?.byDepartment.byFirst.find((item) => item._id === d)?.count ?? 0;
    const secondCount = stats?.byDepartment.bySecond.find((item) => item._id === d)?.count ?? 0;
    return {
      name: DEPT_SHORT_NAMES[d] || d,
      "First Preference": firstCount,
      "Second Preference": secondCount,
    };
  });

  // Calculate Tech vs Non-Tech Application Split
  const techDepts = ["development", "competitive-coding", "ui-ux", "ai-ml", "cyber-security"];
  const nonTechDepts = ["design", "management", "entrepreneurship", "content-media"];

  const techCount = stats?.byDepartment.byFirst
    .filter((d) => techDepts.includes(d._id))
    .reduce((acc, curr) => acc + curr.count, 0) ?? 0;

  const nonTechCount = stats?.byDepartment.byFirst
    .filter((d) => nonTechDepts.includes(d._id))
    .reduce((acc, curr) => acc + curr.count, 0) ?? 0;

  const totalSplit = techCount + nonTechCount;
  const techPct = totalSplit > 0 ? Math.round((techCount / totalSplit) * 100) : 0;
  const nonTechPct = totalSplit > 0 ? Math.round((nonTechCount / totalSplit) * 100) : 0;

  const splitData = [
    { name: "Technical Departments", value: techCount, color: "#2dd4bf" },
    { name: "Non-Technical Departments", value: nonTechCount, color: "#8b5cf6" },
  ];

  // Stage Distribution Funnel Data
  const stageData = (stats?.byStage ?? []).map((stage) => ({
    name: `Stage ${stage._id - 1}`,
    count: stage.count,
  }));

  // Capacity fill tracking per department
  const capacityList = (stats?.departmentsList ?? []).map((dept) => {
    const acceptedCount = stats?.acceptedByDept.find((a) => a._id === dept.slug)?.count ?? 0;
    const fillPercent = dept.maxCapacity > 0 ? Math.min(100, Math.round((acceptedCount / dept.maxCapacity) * 100)) : 0;
    return {
      ...dept,
      acceptedCount,
      fillPercent,
    };
  });

  return (
    <AdminLayout activePage="analytics">
      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <TrendingUp className="h-7 w-7 text-teal-400" />
              Advanced Analytics
            </h1>
            <p className="text-sm text-zinc-400 mt-1">Detailed funnel performance and capacity metrics</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setRefreshing(true);
              loadData();
            }}
            className="h-10 w-10 text-zinc-400 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: First vs Second Preference Detailed Comparison */}
          <Card className="lg:col-span-3">
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4 pb-4">
              <div>
                <CardTitle className="text-base font-bold">Department Interest Analytics</CardTitle>
                <CardDescription>
                  Comparing First Choice vs. Second Choice application volumes per department
                </CardDescription>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-md bg-teal-500" />
                  <span className="text-zinc-400 font-bold">First Preference</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-md bg-violet-600" />
                  <span className="text-zinc-400 font-bold">Second Preference</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparativeData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                  <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#52525b" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a" }}
                    itemStyle={{ color: "#f8fafc" }}
                    cursor={{ fill: "rgba(39, 39, 42, 0.3)" }}
                  />
                  <Bar dataKey="First Preference" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Second Preference" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Chart 2: Tech vs Non-Tech Application Split */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base font-bold">Domain Preferences</CardTitle>
              <CardDescription>First preference domain focus ratio</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col justify-between h-72 pb-2">
              <div className="h-44 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={splitData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {splitData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a" }}
                      itemStyle={{ color: "#f8fafc" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center">
                  <p className="text-2xl font-black text-white">{totalSplit}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                    Classified
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-teal-400" />
                    <span className="text-zinc-400">Technical ({techCount})</span>
                  </div>
                  <span className="text-white font-extrabold">{techPct}%</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-violet-500" />
                    <span className="text-zinc-400">Non-Technical ({nonTechCount})</span>
                  </div>
                  <span className="text-white font-extrabold">{nonTechPct}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart 3: Funnel stage distribution */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-bold">Stage Funnel Distribution</CardTitle>
              <CardDescription>Candidates currently active in each evaluation stage</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              {stageData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-zinc-500 font-semibold border border-dashed border-zinc-900 rounded-xl">
                  No candidates currently active in evaluation stages
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                    <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#52525b" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a" }}
                      itemStyle={{ color: "#2dd4bf" }}
                      cursor={{ fill: "rgba(39, 39, 42, 0.3)" }}
                    />
                    <Bar dataKey="count" name="Active Candidates" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Capacity Tracking Section */}
        <Card>
          <CardHeader className="border-b border-zinc-900 bg-zinc-900/10">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Award className="h-5 w-5 text-teal-400" />
              Department Placement & Capacity Fill
            </CardTitle>
            <CardDescription>
              Real-time monitoring. Click on any department card to view advanced metrics.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capacityList.length === 0 ? (
              <div className="col-span-full text-center py-6 text-xs text-zinc-500 font-semibold">
                No active department configurations found.
              </div>
            ) : (
              capacityList.map((dept) => (
                <div
                  key={dept.slug}
                  onClick={() => handleOpenDeptDrawer(dept.slug)}
                  className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/40 space-y-4 hover:border-teal-500/30 hover:bg-zinc-900/10 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white block truncate group-hover:text-teal-400 transition-colors">
                      {dept.name}
                    </span>
                    <Badge variant={dept.isActive ? "success" : "default"}>
                      {dept.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] uppercase font-bold text-zinc-500">
                      <span>Admission Capacity</span>
                      <span className="text-zinc-300">
                        {dept.acceptedCount} / {dept.maxCapacity}
                      </span>
                    </div>
                    {/* Custom progress bar */}
                    <div className="h-2 w-full bg-black rounded-full overflow-hidden border border-zinc-900/40">
                      <div
                        style={{ width: `${dept.fillPercent}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          dept.fillPercent >= 90
                            ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]"
                            : dept.fillPercent >= 70
                            ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                            : "bg-teal-500 shadow-[0_0_10px_rgba(45,212,191,0.4)]"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] font-semibold">
                    <span className="text-zinc-500">View Detailed Stats</span>
                    <ChevronRight className="h-3.5 w-3.5 text-zinc-500 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Slide-over analytics drawer */}
      <Sheet open={selectedDept !== null} onOpenChange={(open) => !open && setSelectedDept(null)}>
        <SheetContent className="max-w-md">
          {deptLoading ? (
            <div className="h-full flex items-center justify-center flex-col gap-3">
              <Loader2 className="h-8 w-8 text-teal-400 animate-spin" />
              <p className="text-xs text-zinc-500 font-semibold">Fetching department statistics...</p>
            </div>
          ) : deptStats ? (
            <div className="space-y-6">
              <SheetHeader>
                <SheetTitle className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Compass className="h-5 w-5 text-teal-450" />
                  {deptStats.name}
                </SheetTitle>
                <SheetDescription>Advanced Performance & Pool Demographics</SheetDescription>
              </SheetHeader>

              {/* Counts section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-zinc-900 bg-zinc-950/60 text-left">
                  <span className="text-[10px] text-zinc-500 uppercase font-extrabold tracking-wider block">
                    1st Preference
                  </span>
                  <span className="text-2xl font-black text-white mt-1 block">
                    {deptStats.firstPrefCount}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl border border-zinc-900 bg-zinc-950/60 text-left">
                  <span className="text-[10px] text-zinc-500 uppercase font-extrabold tracking-wider block">
                    2nd Preference
                  </span>
                  <span className="text-2xl font-black text-zinc-300 mt-1 block">
                    {deptStats.secondPrefCount}
                  </span>
                </div>
              </div>

              {/* Admission Capacity Fill info */}
              <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/60 space-y-3.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Admission Fill Status</span>
                  <span className="text-xs font-black text-teal-400">
                    {deptStats.acceptedCount} / {deptStats.maxCapacity} Selected
                  </span>
                </div>
                <div className="h-2 w-full bg-black rounded-full overflow-hidden border border-zinc-900">
                  <div
                    style={{
                      width: `${
                        deptStats.maxCapacity > 0
                          ? Math.min(100, Math.round((deptStats.acceptedCount / deptStats.maxCapacity) * 100))
                          : 0
                      }%`,
                    }}
                    className="h-full bg-teal-500 rounded-full"
                  />
                </div>
              </div>

              {/* Rubric Score Metrics */}
              <div className="space-y-3 text-left">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <Award className="h-4 w-4 text-teal-400" /> Average Evaluation Scores
                </h3>
                <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/60 space-y-4">
                  {[
                    { label: "Technical Ability", value: deptStats.avgScores.technical, color: "bg-teal-500" },
                    { label: "Communication Skills", value: deptStats.avgScores.communication, color: "bg-violet-500" },
                    { label: "Creativity & Devotion", value: deptStats.avgScores.creativity, color: "bg-amber-500" },
                  ].map((metric) => (
                    <div key={metric.label} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
                        <span>{metric.label}</span>
                        <span className="text-white font-extrabold">{metric.value} / 5</span>
                      </div>
                      <div className="h-1.5 w-full bg-black rounded-full overflow-hidden">
                        <div
                          style={{ width: `${(metric.value / 5) * 100}%` }}
                          className={`h-full rounded-full ${metric.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Funnel distribution */}
              <div className="space-y-3 text-left">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-teal-400" /> Active Stage Distribution
                </h3>
                <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/60 space-y-3">
                  {deptStats.stagesFunnel.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-2">No active candidates in review stages</p>
                  ) : (
                    deptStats.stagesFunnel.map((s) => (
                      <div key={s.stageNum} className="flex items-center justify-between text-xs font-bold text-zinc-300 border-b border-zinc-900/60 pb-2 last:border-0 last:pb-0">
                        <span>Stage {s.stageNum} reviewees</span>
                        <Badge variant="warning" className="px-2.5 py-0.5">
                          {s.count} candidates
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Year distribution */}
              <div className="space-y-3 text-left">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <Percent className="h-4 w-4 text-teal-400" /> Pool Year Distribution
                </h3>
                <div className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/60 space-y-3">
                  {deptStats.yearDistribution.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-2">No candidate pool data</p>
                  ) : (
                    deptStats.yearDistribution.map((y) => (
                      <div key={y.year} className="flex items-center justify-between text-xs font-bold text-zinc-300">
                        <span>Year {y.year} students</span>
                        <span className="text-white font-extrabold">{y.count} applied</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-zinc-500 font-semibold">
              Error fetching metrics
            </div>
          )}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
}
