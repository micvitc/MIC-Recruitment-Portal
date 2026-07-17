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

  return (
    <AdminLayout activePage="dashboard">
      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Overview</h1>
            <p className="text-sm text-zinc-450 mt-1">MIC Recruitment Cycle 2026–27</p>
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                Total Applicants
              </CardTitle>
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400">
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-white">{stats?.total ?? 0}</div>
              <p className="text-xs text-zinc-500 mt-1">Submissions in current cycle</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                In Progress
              </CardTitle>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Clock className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-white">{stats?.inProgress ?? 0}</div>
              <p className="text-xs text-zinc-500 mt-1">Currently being reviewed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                Selected
              </CardTitle>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-white">{stats?.selected ?? 0}</div>
              <p className="text-xs text-zinc-500 mt-1">Accepted into MIC</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-extrabold uppercase tracking-wider text-zinc-500">
                Conversion Rate
              </CardTitle>
              <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
                <TrendingUp className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-white">{stats?.conversionRate ?? "0"}%</div>
              <p className="text-xs text-zinc-500 mt-1">{stats?.rejected ?? 0} applications rejected</p>
            </CardContent>
          </Card>
        </div>

        {/* Basic Analytics: Daily Applications Chart */}
        {stats && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-base font-bold">Daily Application Flow</CardTitle>
              <CardDescription>Submissions received over calendar days</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.dailyApplications} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#18181b" vertical={false} />
                  <XAxis
                    dataKey="_id"
                    stroke="#52525b"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) =>
                      new Date(val).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                    }
                  />
                  <YAxis stroke="#52525b" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#09090b", borderColor: "#27272a" }}
                    itemStyle={{ color: "#2dd4bf" }}
                    labelStyle={{ color: "#a1a1aa" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="applications"
                    name="Submissions"
                    stroke="#2dd4bf"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#2dd4bf", strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Lower Grid: Activity & Audit Feed + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tabbed Activity Feed & Audit logs */}
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-base font-bold">Activity Tracking</CardTitle>
              <CardDescription>Monitor live candidates and administrative operations</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <Tabs defaultValue="activity" className="w-full">
                <TabsList className="grid grid-cols-2 w-full mb-4">
                  <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                  <TabsTrigger value="audit">Admin Audit Logs</TabsTrigger>
                </TabsList>
                
                <TabsContent value="activity" className="space-y-4">
                  {(stats?.recentActivity ?? []).length === 0 ? (
                    <div className="text-sm text-zinc-500 text-center py-10">No activity yet</div>
                  ) : (
                    (stats?.recentActivity ?? []).map((item, i) => (
                      <div
                        key={i}
                        onClick={() => router.push("/admin/applications")}
                        className="flex items-center gap-4 p-3 rounded-xl bg-zinc-950/40 border border-zinc-900/80 hover:bg-zinc-900/40 hover:border-zinc-800 transition-all cursor-pointer"
                      >
                        <div className="h-8 w-8 rounded-full bg-zinc-900 flex items-center justify-center text-xs font-bold text-zinc-300 border border-zinc-800">
                          {item.userEmail.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{item.userEmail}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">
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
                        >
                          {item.overallStatus}
                        </Badge>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="audit" className="space-y-4">
                  {(stats?.auditLogs ?? []).length === 0 ? (
                    <div className="text-sm text-zinc-500 text-center py-10 flex flex-col items-center justify-center gap-2">
                      <ShieldAlert className="h-8 w-8 text-zinc-650" />
                      <span>No administrator audit logs recorded yet</span>
                    </div>
                  ) : (
                    (stats?.auditLogs ?? []).map((item) => (
                      <div
                        key={item._id}
                        className="flex items-start gap-4 p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-900/80 hover:border-zinc-800 transition-all text-left"
                      >
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <span className="text-[11px] font-bold text-white truncate max-w-44">
                              {item.adminEmail}
                            </span>
                            <span className="text-[9px] font-semibold text-zinc-500">
                              {new Date(item.createdAt).toLocaleTimeString(undefined, {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant={getActionBadgeVariant(item.action)}>
                              {item.action.replace("_", " ")}
                            </Badge>
                            <span className="text-[10px] font-bold text-teal-400 truncate max-w-48">
                              {item.target}
                            </span>
                          </div>
                          {item.details && (
                            <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
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
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Quick Actions</CardTitle>
              <CardDescription>Shortcut workflows for recruitment admins</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                onClick={() => router.push("/admin/applications")}
                className="w-full flex items-center justify-start gap-4 p-6 rounded-xl hover:border-teal-500/30 hover:bg-teal-500/5 group text-left h-auto"
              >
                <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 group-hover:bg-teal-500/20 transition-all">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Review Submissions</p>
                  <p className="text-xs text-zinc-400 font-medium mt-0.5">
                    Advance, select, or reject applicant cycles
                  </p>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => router.push("/admin/settings")}
                className="w-full flex items-center justify-start gap-4 p-6 rounded-xl hover:border-violet-500/30 hover:bg-violet-500/5 group text-left h-auto"
              >
                <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 group-hover:bg-violet-500/20 transition-all">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Manage Departments</p>
                  <p className="text-xs text-zinc-400 font-medium mt-0.5">
                    Toggle statuses, cycle parameters, and question forms
                  </p>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowCycleConfirm(true)}
                className="w-full flex items-center justify-start gap-4 p-6 rounded-xl hover:border-amber-500/30 hover:bg-amber-500/5 group text-left h-auto"
              >
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition-all">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    {cycle?.isOpen ? "Suspend Submissions" : "Resume Submissions"}
                  </p>
                  <p className="text-xs text-zinc-400 font-medium mt-0.5">
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
