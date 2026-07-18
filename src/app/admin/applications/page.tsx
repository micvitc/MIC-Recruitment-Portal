"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowUpDown,
  LayoutGrid,
  List,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Star,
  Download,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertDialog, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Application {
  _id: string;
  userEmail: string;
  userName?: string;
  firstPreference: string;
  secondPreference: string;
  firstPrefType: string;
  overallStatus: string;
  activePreference: string;
  firstPrefProgress: { currentStage: number; status: string; stages: any[] };
  secondPrefProgress: { currentStage: number; status: string; stages: any[] };
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

export default function AdminApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1, limit: 25 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  // Kanban and custom export states
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportCols, setExportCols] = useState<Record<string, boolean>>({
    id: false,
    email: true,
    createdAt: true,
    overallStatus: true,
    firstPref: true,
    firstPrefType: false,
    firstPrefStatus: false,
    firstPrefStage: true,
    secondPref: true,
    secondPrefType: false,
    secondPrefStatus: false,
    secondPrefStage: false,
    scores: true,
  });

  // Selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkConfirm, setBulkConfirm] = useState<"advance" | "reject" | null>(null);
  const [bulkNote, setBulkNote] = useState("");
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: viewMode === "kanban" ? "200" : "25",
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
  }, [page, search, deptFilter, statusFilter, viewMode]);

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
  }, [load]);

  // Bulk selection functions
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const visibleIds = applications.map((app) => app._id);
    const allSelected = visibleIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleBulkActionExecute = async () => {
    if (!bulkConfirm) return;
    setBulkProcessing(true);
    try {
      const res = await fetch("/api/admin/applications/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: bulkConfirm, ids: selectedIds, note: bulkNote }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedIds([]);
        setBulkConfirm(null);
        setBulkNote("");
        load();
      } else {
        alert(data.error ?? "Failed to complete bulk action");
      }
    } catch {
      alert("Failed to communicate with server");
    } finally {
      setBulkProcessing(false);
    }
  };

  // Kanban grouping & drag and drop
  const getAverageScore = (app: Application) => {
    const progress = app.activePreference === "first" ? app.firstPrefProgress : app.secondPrefProgress;
    if (!progress?.stages) return null;
    let total = 0;
    let count = 0;
    progress.stages.forEach((stage: any) => {
      if (stage.scores) {
        // Handle Mongoose Map structure or raw object structure
        const entries = stage.scores instanceof Map 
          ? Array.from(stage.scores.values()) 
          : Object.values(stage.scores);
        entries.forEach((score: any) => {
          total += Number(score);
          count++;
        });
      }
    });
    return count > 0 ? (total / count).toFixed(1) : null;
  };

  const getKanbanColumns = () => {
    const cols = {
      stage1: { title: "Stage 1 Review", items: [] as Application[], border: "border-cyan-500/25", headerBg: "bg-cyan-500/10 text-cyan-400" },
      stage2: { title: "Stage 2 Review", items: [] as Application[], border: "border-violet-500/25", headerBg: "bg-violet-500/10 text-violet-400" },
      selected: { title: "Selected", items: [] as Application[], border: "border-emerald-500/25", headerBg: "bg-emerald-500/10 text-emerald-400" },
      waitlisted: { title: "Waitlisted", items: [] as Application[], border: "border-blue-500/25", headerBg: "bg-blue-500/10 text-blue-400" },
      rejected: { title: "Rejected", items: [] as Application[], border: "border-rose-500/25", headerBg: "bg-rose-500/10 text-rose-400" },
    };

    applications.forEach((app) => {
      if (app.overallStatus === "selected") {
        cols.selected.items.push(app);
      } else if (app.overallStatus === "waitlisted") {
        cols.waitlisted.items.push(app);
      } else if (app.overallStatus === "rejected") {
        cols.rejected.items.push(app);
      } else {
        const stage = app.activePreference === "first" ? app.firstPrefProgress.currentStage : app.secondPrefProgress.currentStage;
        if (stage === 2) {
          cols.stage1.items.push(app);
        } else if (stage === 3) {
          cols.stage2.items.push(app);
        } else {
          cols.stage1.items.push(app); // fallback
        }
      }
    });

    return cols;
  };

  const handleDragDrop = async (appId: string, targetCol: string) => {
    const app = applications.find((a) => a._id === appId);
    if (!app) return;
    const pref = app.activePreference;

    let action = "";
    if (targetCol === "selected") action = "select";
    else if (targetCol === "waitlisted") action = "waitlist";
    else if (targetCol === "rejected") action = "reject";
    else if (targetCol === "stage2") action = "advance";
    else if (targetCol === "stage1") {
      alert("Demoting or resetting to Stage 1 is not supported via drag and drop. Please use the detailed view page.");
      return;
    }

    if (!action) return;

    if (action === "advance" || action === "reject") {
      if (confirm(`Would you like to open the candidate's profile to evaluate and ${action} them?`)) {
        router.push(`/admin/applications/${appId}`);
      }
      return;
    }

    // Direct transitions (select, waitlist)
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, preference: pref }),
      });
      const data = await res.json();
      if (data.success) {
        load();
      } else {
        alert(data.error || "Failed to update candidate status.");
        setLoading(false);
      }
    } catch {
      alert("Failed to communicate with server.");
      setLoading(false);
    }
  };

  const isAllSelected =
    applications.length > 0 && applications.every((app) => selectedIds.includes(app._id));

  return (
    <AdminLayout activePage="applications">
      <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Applications</h1>
            <p className="text-sm text-zinc-450 mt-1">
              {pagination.total} total applicants found
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-zinc-950 border border-zinc-900 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setViewMode("list");
                  setPage(1);
                }}
                className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "list"
                    ? "bg-zinc-900 text-teal-400 animate-pixel-pulse"
                    : "text-zinc-550 hover:text-zinc-300"
                }`}
              >
                <List className="h-3.5 w-3.5" />
                List
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewMode("kanban");
                  setPage(1);
                }}
                className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "kanban"
                    ? "bg-zinc-900 text-teal-400 animate-pixel-pulse"
                    : "text-zinc-550 hover:text-zinc-300"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Kanban
              </button>
            </div>

            <Button
              onClick={() => setShowExportModal(true)}
              variant="emerald"
              className="font-bold text-sm gap-2 cursor-pointer flex items-center"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
                setSelectedIds([]);
              }}
              className="pl-9"
            />
          </div>

          <Select
            value={deptFilter}
            onChange={(e) => {
              setDeptFilter(e.target.value);
              setPage(1);
              setSelectedIds([]);
            }}
            icon={<Filter className="h-4 w-4" />}
          >
            <option value="">All Departments</option>
            {DEPTS.map((d) => (
              <option key={d} value={d}>
                {DEPT_NAMES[d]}
              </option>
            ))}
          </Select>

          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
              setSelectedIds([]);
            }}
            icon={<Filter className="h-4 w-4" />}
          >
            <option value="">All Statuses</option>
            <option value="in-progress">In Progress</option>
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
            <option value="waitlisted">Waitlisted</option>
          </Select>
        </div>

        {/* Conditional Rendering of Views */}
        {viewMode === "list" ? (
          /* List View Wrapper */
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        className="rounded border-zinc-800 bg-zinc-950 text-teal-500 focus:ring-teal-500 cursor-pointer h-4 w-4"
                      />
                    </TableHead>
                    {["Name", "Email", "1st Pref", "2nd Pref", "Stage", "Status", "Applied", ""].map((h, i) => (
                      <TableHead key={i}>
                        <div className="flex items-center gap-1">
                          {h} {h && <ArrowUpDown className="h-3 w-3 opacity-40" />}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="py-16 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="h-8 w-8 text-teal-400 animate-spin" />
                          <span className="text-xs text-zinc-500 font-medium">
                            Loading applications...
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : applications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="py-16 text-center text-zinc-500 text-sm font-medium">
                        No applications found matching criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    applications.map((app) => (
                      <TableRow
                        key={app._id}
                        onClick={() => router.push(`/admin/applications/${app._id}`)}
                        className="cursor-pointer"
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(app._id)}
                            onChange={() => toggleSelect(app._id)}
                            className="rounded border-zinc-800 bg-zinc-950 text-teal-500 focus:ring-teal-500 cursor-pointer h-4 w-4"
                          />
                        </TableCell>
                        <TableCell className="font-bold text-white text-sm truncate max-w-[150px]" title={app.userName || "N/A"}>
                          {app.userName || "—"}
                        </TableCell>
                        <TableCell className="text-zinc-400 text-xs truncate max-w-[200px]">
                          {app.userEmail}
                        </TableCell>
                        <TableCell className="text-zinc-350 text-xs">
                          {DEPT_NAMES[app.firstPreference] ?? app.firstPreference}
                        </TableCell>
                        <TableCell className="text-zinc-355 text-xs">
                          {DEPT_NAMES[app.secondPreference] ?? app.secondPreference}
                        </TableCell>
                        <TableCell className="text-zinc-400 text-xs font-semibold">
                          Stage{" "}
                          {app.activePreference === "first"
                            ? app.firstPrefProgress.currentStage
                            : app.secondPrefProgress.currentStage}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              app.overallStatus === "selected"
                                ? "success"
                                : app.overallStatus === "rejected"
                                ? "destructive"
                                : app.overallStatus === "waitlisted"
                                ? "info"
                                : "warning"
                            }
                          >
                            {app.overallStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-zinc-500 text-xs font-medium">
                          {new Date(app.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="text-teal-400 hover:text-teal-300 font-bold">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-900 bg-zinc-950/10">
                <p className="text-xs text-zinc-500 font-semibold">
                  Page {pagination.page} of {pagination.pages} · {pagination.total} results
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPage((p) => Math.max(1, p - 1));
                    }}
                    disabled={pagination.page <= 1}
                    className="h-9 w-9"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPage((p) => Math.min(pagination.pages, p + 1));
                    }}
                    disabled={pagination.page >= pagination.pages}
                    className="h-9 w-9"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ) : (
          /* Kanban Board View */
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start select-none pb-4 overflow-x-auto">
            {loading ? (
              <div className="col-span-5 py-24 flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-10 w-10 text-teal-400 animate-spin" />
                <span className="text-sm text-zinc-500 font-medium">Arranging Kanban Columns...</span>
              </div>
            ) : (
              Object.entries(getKanbanColumns()).map(([colKey, col]) => (
                <div
                  key={colKey}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const appId = e.dataTransfer.getData("applicationId");
                    if (appId) handleDragDrop(appId, colKey);
                  }}
                  className={`rounded-2xl border ${col.border} bg-zinc-950/20 p-4 space-y-3 min-h-[500px] flex flex-col`}
                >
                  <div className={`p-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex justify-between items-center ${col.headerBg}`}>
                    <span>{col.title}</span>
                    <Badge variant="outline" className="bg-black/40 text-[10px] font-mono border-zinc-800">
                      {col.items.length}
                    </Badge>
                  </div>

                  <div className="flex-1 space-y-3 max-h-[600px] overflow-y-auto pr-1">
                    {col.items.length === 0 ? (
                      <div className="text-center py-16 text-zinc-700 font-bold text-xs border border-dashed border-zinc-900 rounded-xl">
                        Drop Here
                      </div>
                    ) : (
                      col.items.map((app) => {
                        const avgRating = getAverageScore(app);
                        return (
                          <div
                            key={app._id}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData("applicationId", app._id)}
                            onClick={() => router.push(`/admin/applications/${app._id}`)}
                            className="p-3.5 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-xl cursor-grab active:cursor-grabbing hover:shadow-[0_0_15px_rgba(20,184,166,0.06)] transition-all space-y-3"
                          >
                            <p className="text-xs font-bold text-zinc-200 truncate" title={app.userName || app.userEmail}>
                              {app.userName || app.userEmail}
                            </p>
                            {app.userName && (
                              <p className="text-[10px] text-zinc-500 truncate" title={app.userEmail}>
                                {app.userEmail}
                              </p>
                            )}
                            <div className="flex justify-between items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[9px] text-zinc-400 font-bold uppercase tracking-wider">
                                {DEPT_NAMES[app.firstPreference] || app.firstPreference}
                              </span>
                              {avgRating && (
                                <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {avgRating}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Floating Bulk Actions Bar (only active in list view) */}
      {selectedIds.length > 0 && viewMode === "list" && (
        <div className="fixed bottom-6 left-[calc(50%+112px)] -translate-x-1/2 z-30 bg-zinc-950 border border-zinc-800 rounded-2xl py-3 px-6 shadow-2xl flex items-center gap-5 animate-pixel-slide-up">
          <span className="text-xs font-bold text-zinc-400 whitespace-nowrap">
            <strong className="text-white text-sm mr-1">{selectedIds.length}</strong> selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedIds([])}
              className="h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkConfirm("reject")}
              className="h-9 text-xs font-bold"
            >
              Bulk Reject
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setBulkConfirm("advance")}
              className="h-9 text-xs font-bold"
            >
              Bulk Advance
            </Button>
          </div>
        </div>
      )}

      {/* 1. AlertDialog to confirm bulk action updates */}
      <AlertDialog
        isOpen={bulkConfirm !== null}
        onClose={() => {
          setBulkConfirm(null);
          setBulkNote("");
        }}
        onConfirm={handleBulkActionExecute}
        title={bulkConfirm === "advance" ? "Bulk Advance Candidates?" : "Bulk Reject Candidates?"}
        description={`You are about to bulk ${bulkConfirm === "advance" ? "advance" : "reject"} ${
          selectedIds.length
        } candidates in their active preference departments. This action is irreversible. You can optionally write an evaluation note below.`}
        confirmText={bulkConfirm === "advance" ? "Yes, Advance All" : "Yes, Reject All"}
        variant={bulkConfirm === "reject" ? "destructive" : "default"}
        loading={bulkProcessing}
      >
        <div className="space-y-1.5 w-full mt-3">
          <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold block">
            Optional Evaluation Note
          </label>
          <textarea
            value={bulkNote}
            onChange={(e) => setBulkNote(e.target.value)}
            placeholder="Write note visible to all selected candidates..."
            rows={2}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-700 resize-none transition-all"
          />
        </div>
      </AlertDialog>

      {/* 2. Custom Export Columns Picker Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="max-w-md bg-zinc-950 border border-zinc-900 rounded-2xl p-6 font-mono text-xs">
          <DialogHeader className="border-b border-zinc-900 pb-3">
            <DialogTitle className="text-base text-white font-extrabold flex items-center gap-2">
              <Download className="h-5 w-5 text-teal-400" />
              Customize CSV Export
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              Select the columns to include in the spreadsheet download.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 my-4">
            {Object.entries({
              id: "Applicant ID",
              email: "Email Address",
              createdAt: "Applied Date",
              overallStatus: "Overall Status",
              firstPref: "First Preference",
              firstPrefType: "First Pref Type",
              firstPrefStatus: "First Pref Status",
              firstPrefStage: "First Pref Stage",
              secondPref: "Second Preference",
              secondPrefType: "Second Pref Type",
              secondPrefStatus: "Second Pref Status",
              secondPrefStage: "Second Pref Stage",
              scores: "Rubric Scorecard Data",
            }).map(([key, label]) => (
              <label
                key={key}
                className="flex items-center gap-2 p-2 bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 rounded-xl cursor-pointer select-none transition-all"
              >
                <input
                  type="checkbox"
                  checked={exportCols[key]}
                  onChange={(e) => setExportCols((cols) => ({ ...cols, [key]: e.target.checked }))}
                  className="rounded border-zinc-800 bg-zinc-950 text-teal-500 focus:ring-teal-500 cursor-pointer h-4 w-4"
                />
                <span className="text-zinc-350 font-bold text-[10px]">{label}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-900 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowExportModal(false)}
              className="px-4 font-bold rounded-xl h-9 text-xs cursor-pointer select-none"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                const cols = Object.entries(exportCols)
                  .filter(([_, active]) => active)
                  .map(([key]) => key)
                  .join(",");
                window.location.href = `/api/admin/applications/export?columns=${cols}`;
                setShowExportModal(false);
              }}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 rounded-xl h-9 text-xs cursor-pointer select-none flex items-center gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              Download CSV
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
