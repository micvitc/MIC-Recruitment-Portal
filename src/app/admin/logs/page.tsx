"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Activity,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Clock,
  Shield,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AuditLogEntry {
  _id: string;
  adminEmail: string;
  action: string;
  target: string;
  details?: string;
  createdAt: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1, limit: 50 });

  const loadLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "50",
        ...(search && { q: search }),
      });
      const res = await fetch(`/api/admin/logs?${params}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const getActionBadgeColor = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes("delete")) return "destructive";
    if (act.includes("reject")) return "destructive";
    if (act.includes("select")) return "success";
    if (act.includes("advance")) return "success";
    if (act.includes("email")) return "info";
    if (act.includes("cycle")) return "warning";
    return "default";
  };

  return (
    <AdminLayout activePage="logs">
      <div className="p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Activity className="h-8 w-8 text-teal-400" />
              Administrative Audit Logs
            </h1>
            <p className="text-sm text-zinc-450 mt-1">
              Browse and trace admin operations, status advancements, and settings changes.
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setRefreshing(true);
              loadLogs();
            }}
            className="h-10 w-10 text-zinc-400 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search by admin, action, target, or details..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>

        {/* Card Wrapping Table */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="py-24 text-center flex flex-col items-center justify-center gap-2">
                <Loader2 className="h-10 w-10 text-teal-400 animate-spin" />
                <span className="text-xs text-zinc-500 font-medium">Querying System logs...</span>
              </div>
            ) : logs.length === 0 ? (
              <div className="py-24 text-center text-zinc-500 text-sm font-medium">
                No administrative audit logs found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs font-mono">
                  <thead>
                    <tr className="border-y border-zinc-900 bg-zinc-950/60 text-zinc-400 font-bold">
                      <th className="p-4 w-[160px]">Timestamp</th>
                      <th className="p-4 w-[200px]">Operator Admin</th>
                      <th className="p-4 w-[150px]">Action Type</th>
                      <th className="p-4 w-[180px]">Target</th>
                      <th className="p-4">Operation Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => {
                      const dateStr = new Date(log.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      });

                      return (
                        <tr key={log._id} className="border-b border-zinc-900 hover:bg-zinc-950/30 transition-all">
                          <td className="p-4 text-zinc-500 font-bold whitespace-nowrap flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-zinc-650" />
                            {dateStr}
                          </td>
                          <td className="p-4 text-white font-bold flex items-center gap-1.5 whitespace-nowrap">
                            <Shield className="h-3.5 w-3.5 text-teal-500/60" />
                            {log.adminEmail}
                          </td>
                          <td className="p-4">
                            <Badge variant={getActionBadgeColor(log.action)} className="font-extrabold text-[9px] uppercase">
                              {log.action}
                            </Badge>
                          </td>
                          <td className="p-4 text-zinc-350 font-bold truncate max-w-[180px]" title={log.target}>
                            {log.target}
                          </td>
                          <td className="p-4 text-zinc-400 font-sans leading-relaxed">
                            {log.details || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>

          {/* Pagination */}
          {!loading && pagination.pages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-900 bg-zinc-950/10">
              <p className="text-xs text-zinc-500 font-semibold font-mono">
                Page {pagination.page} of {pagination.pages} · {pagination.total} entries
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1}
                  className="h-9 w-9 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={pagination.page >= pagination.pages}
                  className="h-9 w-9 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
