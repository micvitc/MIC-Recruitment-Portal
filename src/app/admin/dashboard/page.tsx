"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Clock,
  Compass,
  Zap,
  TrendingUp,
  ShieldAlert,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AuditLogEntry {
  _id: string;
  adminEmail: string;
  action: string;
  target: string;
  details?: string;
  createdAt: string;
}

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
  auditLogs?: AuditLogEntry[];
}

interface Cycle {
  isOpen: boolean;
  cycleId: string;
  label: string;
  openedAt?: string;
  closedAt?: string;
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
  
  // Custom dialog state
  const [showCycleConfirm, setShowCycleConfirm] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-teal-400 animate-spin" />
          <p className="text-sm text-zinc-400 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case "cycle_toggle":
        return "destructive";
      case "stage_select":
        return "success";
      case "stage_advance":
        return "info";
      case "candidate_reject":
        return "destructive";
      case "dept_update":
        return "warning";
      default:
        return "default";
    }
  };

  const departmentData = Object.keys(DEPT_NAMES).map((slug) => {
    const first = stats?.byDepartment?.byFirst?.find((d) => d._id === slug)?.count || 0;
    const second = stats?.byDepartment?.bySecond?.find((d) => d._id === slug)?.count || 0;
    return { name: DEPT_NAMES[slug], First: first, Second: second };
  }).sort((a, b) => (b.First + b.Second) - (a.First + a.Second));

  return (
    <AdminLayout activePage="dashboard">
      <div className="relative min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/60 via-black to-black">
        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                Overview
              </h1>
              <p className="text-sm text-zinc-400 mt-1 font-medium">MIC Recruitment Cycle 2026–27</p>
            </div>
          <div className="flex items-center gap-3">
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

            {/* Recruitment Toggle */}
            <Button
              variant={cycle?.isOpen ? "default" : "destructive"}
              onClick={() => setShowCycleConfirm(true)}
              disabled={toggling}
              className="px-5 font-bold shadow-md h-10 gap-2"
            >
              {toggling && <Loader2 className="h-4 w-4 animate-spin" />}
              Recruitment {cycle?.isOpen ? "OPEN" : "CLOSED"}
            </Button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:-translate-y-1 hover:shadow-2xl hover:shadow-teal-900/20 transition-all duration-300 border-zinc-800/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
                Total Applicants
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-500/5 text-teal-400 border border-teal-500/10">
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-white">{stats?.total ?? 0}</div>
              <p className="text-xs text-zinc-500 mt-2 font-medium">Submissions in current cycle</p>
            </CardContent>
          </Card>

          <Card className="hover:-translate-y-1 hover:shadow-2xl hover:shadow-amber-900/20 transition-all duration-300 border-zinc-800/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
                In Progress
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 text-amber-400 border border-amber-500/10">
                <Clock className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-white">{stats?.inProgress ?? 0}</div>
              <p className="text-xs text-zinc-500 mt-2 font-medium">Currently being reviewed</p>
            </CardContent>
          </Card>

          <Card className="hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-900/20 transition-all duration-300 border-zinc-800/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
                Selected
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 text-emerald-400 border border-emerald-500/10">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-white">{stats?.selected ?? 0}</div>
              <p className="text-xs text-zinc-500 mt-2 font-medium">Accepted into MIC</p>
            </CardContent>
          </Card>

          <Card className="hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-900/20 transition-all duration-300 border-zinc-800/60">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
                Conversion Rate
              </CardTitle>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-500/5 text-violet-400 border border-violet-500/10">
                <TrendingUp className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold text-white">{stats?.conversionRate ?? "0"}%</div>
              <p className="text-xs text-zinc-500 mt-2 font-medium">{stats?.rejected ?? 0} applications rejected</p>
            </CardContent>
          </Card>
        </div>

        {/* Basic Analytics & Department Breakdown */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Application Flow */}
            <Card className="border-zinc-800/60 bg-zinc-950/40 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-base font-bold text-white">Daily Application Flow</CardTitle>
                <CardDescription className="text-zinc-400">Submissions received over calendar days</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.dailyApplications} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis
                      dataKey="_id"
                      stroke="#71717a"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) =>
                        new Date(val).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                      }
                    />
                    <YAxis stroke="#71717a" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "rgba(9, 9, 11, 0.8)", borderColor: "#27272a", borderRadius: "12px", backdropFilter: "blur(8px)" }}
                      itemStyle={{ color: "#2dd4bf" }}
                      labelStyle={{ color: "#a1a1aa", fontWeight: "bold", marginBottom: "4px" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="applications"
                      name="Submissions"
                      stroke="url(#colorUv)"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#2dd4bf", strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: "#34d399", strokeWidth: 0 }}
                    />
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#2dd4bf" />
                        <stop offset="100%" stopColor="#34d399" />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Department Breakdown */}
            <Card className="border-zinc-800/60 bg-zinc-950/40 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-base font-bold text-white">Department Demand</CardTitle>
                <CardDescription className="text-zinc-400">Applicants per department (First & Second Preference)</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#71717a"
                      fontSize={11}
                      tickLine={false}
                      tickFormatter={(val) => (val.length > 10 ? val.substring(0, 10) + "..." : val)}
                    />
                    <YAxis stroke="#71717a" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      cursor={{ fill: "#27272a", opacity: 0.4 }}
                      contentStyle={{ backgroundColor: "rgba(9, 9, 11, 0.8)", borderColor: "#27272a", borderRadius: "12px", backdropFilter: "blur(8px)" }}
                      itemStyle={{ color: "#fff", fontWeight: "bold" }}
                      labelStyle={{ color: "#a1a1aa", fontWeight: "bold", marginBottom: "4px" }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                    <Bar dataKey="First" stackId="a" fill="#2dd4bf" radius={[0, 0, 4, 4]} />
                    <Bar dataKey="Second" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lower Grid: Activity & Audit Feed + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
          {/* Tabbed Activity Feed & Audit logs */}
          <Card className="border-zinc-800/60 bg-zinc-950/40 backdrop-blur-md">
            <CardHeader className="pb-0">
              <CardTitle className="text-base font-bold text-white">Activity Tracking</CardTitle>
              <CardDescription className="text-zinc-400">Monitor live candidates and administrative operations</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Tabs defaultValue="activity" className="w-full">
                <TabsList className="grid grid-cols-2 w-full mb-4 bg-zinc-900/50">
                  <TabsTrigger value="activity" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Recent Activity</TabsTrigger>
                  <TabsTrigger value="audit" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">Admin Audit Logs</TabsTrigger>
                </TabsList>
                
                <TabsContent value="activity" className="space-y-4">
                  {(stats?.recentActivity ?? []).length === 0 ? (
                    <div className="text-sm text-zinc-500 text-center py-10 font-medium">No activity yet</div>
                  ) : (
                    (stats?.recentActivity ?? []).map((item, i) => {
                      const borderColor = 
                        item.overallStatus === "selected" ? "border-emerald-500/50" :
                        item.overallStatus === "rejected" ? "border-red-500/50" : "border-amber-500/50";
                      
                      return (
                      <div
                        key={i}
                        onClick={() => router.push("/admin/applications")}
                        className={`flex items-center gap-4 p-3 rounded-xl bg-zinc-900/20 border-l-2 ${borderColor} border-y border-r border-y-zinc-800/40 border-r-zinc-800/40 hover:bg-zinc-800/40 hover:shadow-lg transition-all cursor-pointer`}
                      >
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                          {item.userEmail.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-zinc-200 truncate">{item.userEmail}</p>
                          <p className="text-[11px] text-zinc-500 mt-0.5 font-medium">
                            {DEPT_NAMES[item.firstPreference] ?? item.firstPreference} →{" "}
                            {DEPT_NAMES[item.secondPreference] ?? item.secondPreference}
                          </p>
                        </div>
                        <Badge
                          variant={
                            item.overallStatus === "selected"
                              ? "success"
                              : item.overallStatus === "rejected"
                              ? "destructive"
                              : "warning"
                          }
                          className="shadow-sm"
                        >
                          {item.overallStatus}
                        </Badge>
                      </div>
                    )})
                  )}
                </TabsContent>

                <TabsContent value="audit" className="space-y-4">
                  {(stats?.auditLogs ?? []).length === 0 ? (
                    <div className="text-sm text-zinc-500 text-center py-10 flex flex-col items-center justify-center gap-2">
                      <ShieldAlert className="h-8 w-8 text-zinc-600/50" />
                      <span className="font-medium">No administrator audit logs recorded yet</span>
                    </div>
                  ) : (
                    (stats?.auditLogs ?? []).map((item) => (
                      <div
                        key={item._id}
                        className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900/20 border border-zinc-800/40 hover:border-zinc-700 hover:bg-zinc-800/30 transition-all text-left group"
                      >
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <span className="text-xs font-bold text-zinc-200 truncate max-w-44 group-hover:text-white transition-colors">
                              {item.adminEmail}
                            </span>
                            <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-950/50 px-2 py-0.5 rounded-full">
                              {new Date(item.createdAt).toLocaleTimeString(undefined, {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={getActionBadgeVariant(item.action)} className="shadow-sm">
                              {item.action.replace("_", " ")}
                            </Badge>
                            <span className="text-xs font-bold text-teal-400/90 truncate max-w-48">
                              {item.target}
                            </span>
                          </div>
                          {item.details && (
                            <p className="text-xs text-zinc-400 font-medium leading-relaxed bg-zinc-950/30 p-2 rounded-lg border border-zinc-800/30 mt-1">
                              {item.details}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-zinc-800/60 bg-zinc-950/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-base font-bold text-white">Quick Actions</CardTitle>
              <CardDescription className="text-zinc-400">Shortcut workflows for recruitment admins</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                onClick={() => router.push("/admin/applications")}
                className="w-full flex items-center justify-start gap-5 p-6 rounded-2xl border-zinc-800/80 hover:border-teal-500/50 bg-zinc-900/20 hover:bg-teal-500/5 hover:shadow-lg hover:shadow-teal-900/10 hover:-translate-y-0.5 group text-left h-auto transition-all duration-300"
              >
                <div className="p-3 rounded-xl bg-gradient-to-br from-teal-500/20 to-teal-500/5 text-teal-400 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-zinc-200 group-hover:text-teal-400 transition-colors">Review Submissions</p>
                  <p className="text-xs text-zinc-500 font-medium mt-1">
                    Advance, select, or reject applicant cycles
                  </p>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push("/admin/settings")}
                className="w-full flex items-center justify-start gap-5 p-6 rounded-2xl border-zinc-800/80 hover:border-violet-500/50 bg-zinc-900/20 hover:bg-violet-500/5 hover:shadow-lg hover:shadow-violet-900/10 hover:-translate-y-0.5 group text-left h-auto transition-all duration-300"
              >
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-500/5 text-violet-400 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                  <Compass className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-zinc-200 group-hover:text-violet-400 transition-colors">Manage Departments</p>
                  <p className="text-xs text-zinc-500 font-medium mt-1">
                    Toggle statuses, cycle parameters, and forms
                  </p>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowCycleConfirm(true)}
                className="w-full flex items-center justify-start gap-5 p-6 rounded-2xl border-zinc-800/80 hover:border-amber-500/50 bg-zinc-900/20 hover:bg-amber-500/5 hover:shadow-lg hover:shadow-amber-900/10 hover:-translate-y-0.5 group text-left h-auto transition-all duration-300"
              >
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 text-amber-400 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-zinc-200 group-hover:text-amber-400 transition-colors">
                    {cycle?.isOpen ? "Suspend Submissions" : "Resume Submissions"}
                  </p>
                  <p className="text-xs text-zinc-500 font-medium mt-1">
                    {cycle?.isOpen
                      ? "Temporarily close forms for new applicants"
                      : "Allow open submissions and editing forms"}
                  </p>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>

      {/* AlertDialog to replace standard window.confirm */}
      <AlertDialog
        isOpen={showCycleConfirm}
        onClose={() => setShowCycleConfirm(false)}
        onConfirm={handleToggleCycleConfirm}
        title={cycle?.isOpen ? "Suspend Recruitment Cycle?" : "Resume Recruitment Cycle?"}
        description={
          cycle?.isOpen
            ? "This will prevent applicants from submitting new forms or making edits to existing ones. Are you sure you want to suspend recruitment?"
            : "This will open the recruitment forms and allow new submissions to be processed. Are you sure you want to resume recruitment?"
        }
        confirmText={cycle?.isOpen ? "Yes, Suspend" : "Yes, Resume"}
        variant={cycle?.isOpen ? "destructive" : "default"}
        loading={toggling}
      />
    </AdminLayout>
  );
}
