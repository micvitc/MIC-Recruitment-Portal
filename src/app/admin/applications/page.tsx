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
import { AlertDialog } from "@/components/ui/dialog";

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

export default function AdminApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1, limit: 25 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

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
          <Button
            onClick={() => {
              window.location.href = "/api/admin/applications/export";
            }}
            variant="emerald"
            className="font-bold text-sm"
          >
            Export to CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500 pointer-events-none" />
            <Input
              type="text"
              placeholder="Search by email..."
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

        {/* Card Wrapping Table */}
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
                  {["Email", "1st Pref", "2nd Pref", "Stage", "Status", "Applied", ""].map((h, i) => (
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
                    <TableCell colSpan={8} className="py-16 text-center">
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
                    <TableCell colSpan={8} className="py-16 text-center text-zinc-500 text-sm font-medium">
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
                      <TableCell className="font-bold text-white text-sm truncate max-w-[200px]">
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
      </div>

      {/* Floating Bulk Actions Bar */}
      {selectedIds.length > 0 && (
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

      {/* AlertDialog to confirm bulk action updates */}
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
    </AdminLayout>
  );
}
