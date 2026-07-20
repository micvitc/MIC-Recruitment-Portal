"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ChevronDown,
  ChevronUp,
  Save,
  CheckCircle2,
  Download,
  Activity,
  Clock,
  Shield,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertDialog } from "@/components/ui/dialog";



export default function AdminSettingsPage() {
  const router = useRouter();
  const [cycle, setCycle] = useState<{ isOpen: boolean; label: string; startAt?: string; endAt?: string; } | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  // Activity logs and Backups states
  const [logs, setLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [backingUp, setBackingUp] = useState(false);

  // Schedule Dates
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [savedSchedule, setSavedSchedule] = useState(false);
  
  // AlertDialog state
  const [showCycleConfirm, setShowCycleConfirm] = useState(false);

  const formatToDatetimeLocal = (dateStr?: string | Date) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const offset = d.getTimezoneOffset();
    const adjusted = new Date(d.getTime() - offset * 60 * 1000);
    return adjusted.toISOString().slice(0, 16);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const cycleRes = await fetch("/api/admin/cycle");
        const cycleData = await cycleRes.json();
        if (cycleData.success && cycleData.cycle) {
          setCycle(cycleData.cycle);
          setStartAt(formatToDatetimeLocal(cycleData.cycle.startAt));
          setEndAt(formatToDatetimeLocal(cycleData.cycle.endAt));
        }

        // Fetch recent administrative logs
        const logsRes = await fetch("/api/admin/logs?page=1&limit=5");
        if (logsRes.ok) {
          const logsData = await logsRes.json();
          setLogs(logsData.logs ?? []);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
        setLogsLoading(false);
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

  const handleSaveSchedule = async () => {
    if (!cycle) return;
    setSavingSchedule(true);
    try {
      const res = await fetch("/api/admin/cycle", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isOpen: cycle.isOpen,
          startAt: startAt || null,
          endAt: endAt || null,
        }),
      });
      const data = await res.json();
      if (data.success && data.cycle) {
        setCycle(data.cycle);
        setStartAt(formatToDatetimeLocal(data.cycle.startAt));
        setEndAt(formatToDatetimeLocal(data.cycle.endAt));
        setSavedSchedule(true);
        setTimeout(() => setSavedSchedule(false), 2500);
      }
    } catch {
      alert("Failed to save schedule settings.");
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleDownloadBackup = async () => {
    setBackingUp(true);
    try {
      window.location.href = "/api/admin/backup";
    } catch {
      alert("Failed to initiate database backup download.");
    } finally {
      setTimeout(() => setBackingUp(false), 2000);
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
          <CardContent className="space-y-6 pt-0">
            <div className="flex items-center justify-between flex-wrap gap-6 border-b border-zinc-900 pb-4">
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
                className="px-6 font-bold h-11 cursor-pointer"
              >
                {toggling && <Loader2 className="h-4 w-4 animate-spin" />}
                {cycle?.isOpen ? "OPEN — Click to Close" : "CLOSED — Click to Open"}
              </Button>
            </div>

            {/* Scheduled Window Form */}
            <div className="space-y-4 pt-2">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
                Scheduled Timer Configuration
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-550 uppercase tracking-widest font-extrabold">Auto-Open Schedule Time</label>
                  <Input
                    type="datetime-local"
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-zinc-550 uppercase tracking-widest font-extrabold">Auto-Close Schedule Time</label>
                  <Input
                    type="datetime-local"
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleSaveSchedule}
                  disabled={savingSchedule}
                  variant="emerald"
                  className="font-bold text-sm h-10 min-w-36 gap-2 cursor-pointer"
                >
                  {savingSchedule ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : savedSchedule ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {savedSchedule ? "Schedule Saved!" : "Save Schedule"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>



        {/* System Management & Audit Logs Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-zinc-900 bg-zinc-950/10 flex-wrap gap-4">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Activity className="h-5 w-5 text-teal-400" />
                System Management & Backups
              </CardTitle>
              <CardDescription>
                Download database snapshots and trace administrative audit operations
              </CardDescription>
            </div>
            <Button
              variant="emerald"
              onClick={handleDownloadBackup}
              disabled={backingUp}
              className="font-bold text-xs gap-2 h-9 cursor-pointer"
            >
              {backingUp ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {backingUp ? "Exporting JSON..." : "Download Backup (JSON)"}
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-6">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 mb-4">
                Recent System Activity Logs
              </p>
              {logsLoading ? (
                <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
                  <Loader2 className="h-6 w-6 text-teal-400 animate-spin" />
                  <span className="text-[10px] text-zinc-500 font-medium">Querying System logs...</span>
                </div>
              ) : logs.length === 0 ? (
                <div className="py-8 text-center text-zinc-500 text-xs font-semibold">
                  No administrative logs recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto border border-zinc-900 rounded-xl">
                  <table className="w-full border-collapse text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-zinc-900 bg-zinc-950/40 text-zinc-400 font-bold">
                        <th className="p-3 w-[160px]">Timestamp</th>
                        <th className="p-3 w-[180px]">Admin Operator</th>
                        <th className="p-3 w-[120px]">Action</th>
                        <th className="p-3">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => {
                        const dateStr = new Date(log.createdAt).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                        return (
                          <tr key={log._id} className="border-b border-zinc-900 last:border-none hover:bg-zinc-950/20">
                            <td className="p-3 text-zinc-500 whitespace-nowrap flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {dateStr}
                            </td>
                            <td className="p-3 text-white font-semibold truncate max-w-[180px]" title={log.adminEmail}>
                              {log.adminEmail}
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <span className="px-1.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[8px] font-extrabold uppercase tracking-widest text-teal-450 text-teal-400">
                                {log.action}
                              </span>
                            </td>
                            <td className="p-3 text-zinc-400 font-sans truncate max-w-[300px]" title={log.details}>
                              {log.details || "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <Button
                  onClick={() => router.push("/admin/logs")}
                  variant="outline"
                  className="font-bold text-xs h-9 cursor-pointer"
                >
                  View Full Audit Logs
                </Button>
              </div>
            </div>
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
