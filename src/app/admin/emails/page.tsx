"use client";

import React, { useEffect, useState } from "react";
import {
  Mail,
  Users,
  Settings,
  History,
  Send,
  Loader2,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Terminal,
  Eye,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog } from "@/components/ui/dialog";

// Department mapping
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

interface EmailLogEntry {
  _id: string;
  recipientEmail: string;
  senderEmail: string;
  subject: string;
  body: string;
  templateUsed?: string;
  status: "success" | "failed";
  errorDetails?: string;
  createdAt: string;
}

export default function AdminEmailsPage() {
  const [activeTab, setActiveTab] = useState("composer");

  // Composer States
  const [subject, setSubject] = useState("Update on your MIC Application");
  const [body, setBody] = useState(
    "Hello,\n\nWe are pleased to inform you that your application for {{preference}} has advanced to Stage {{stage}}.\n\nBest regards,\nMIC Core Team"
  );
  const [testEmailAddress, setTestEmailAddress] = useState("");
  const [filters, setFilters] = useState({
    department: "",
    stage: "",
    status: "",
    preference: "active",
  });
  const [sendingTest, setSendingTest] = useState(false);
  const [sendingBlast, setSendingBlast] = useState(false);
  const [showConfirmBlast, setShowConfirmBlast] = useState(false);
  const [blastResult, setBlastResult] = useState<{
    success: boolean;
    sent?: number;
    failed?: number;
    message: string;
  } | null>(null);

  // Logs / History States
  const [logs, setLogs] = useState<EmailLogEntry[]>([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsPage, setLogsPage] = useState(1);
  const [logsLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [selectedLog, setSelectedLog] = useState<EmailLogEntry | null>(null);

  // Diagnostics States
  const [smtpStatus, setSmtpStatus] = useState<{
    loaded: boolean;
    configured: boolean;
    status: string;
    smtpEmail: string | null;
  }>({
    loaded: false,
    configured: false,
    status: "Unknown",
    smtpEmail: null,
  });
  const [runningDiagnostics, setRunningDiagnostics] = useState(false);
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);

  // ─────────────────────────────────────────────────────────────────────────
  // Data Loading & API Triggers
  // ─────────────────────────────────────────────────────────────────────────

  const loadLogs = async (page = 1) => {
    setLoadingLogs(true);
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(logsLimit),
        search: searchQuery,
        status: statusFilter,
      });
      const res = await fetch(`/api/admin/emails/logs?${queryParams.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
        setLogsTotal(data.total);
        setLogsPage(data.page);
      }
    } catch (err) {
      console.error("Failed to load logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const loadSMTPStats = async () => {
    try {
      const res = await fetch("/api/admin/emails/stats");
      const data = await res.json();
      if (data.success) {
        setSmtpStatus({
          loaded: true,
          configured: data.configured,
          status: data.status,
          smtpEmail: data.smtpEmail,
        });
      }
    } catch {
      setSmtpStatus({
        loaded: true,
        configured: false,
        status: "Failed to connect to diagnostics API.",
        smtpEmail: null,
      });
    }
  };

  const runSMTPDiagnostics = async () => {
    setRunningDiagnostics(true);
    setDiagnosticLogs([
      `[${new Date().toLocaleTimeString()}] [INFO] Starting SMTP connection verification...`,
      `[${new Date().toLocaleTimeString()}] [INFO] Connecting to endpoint /api/admin/emails/stats...`
    ]);

    try {
      const res = await fetch("/api/admin/emails/stats");
      const data = await res.json();

      if (data.success && data.configured && data.status.includes("Connected")) {
        setDiagnosticLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [SUCCESS] SMTP credentials validated.`,
          `[${new Date().toLocaleTimeString()}] [SUCCESS] Gmail transport channel successfully authenticated as ${data.smtpEmail}.`,
          `[${new Date().toLocaleTimeString()}] [INFO] Connection verified successfully.`
        ]);
        setSmtpStatus({
          loaded: true,
          configured: true,
          status: "Connected successfully",
          smtpEmail: data.smtpEmail,
        });
      } else {
        setDiagnosticLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] [ERROR] SMTP check failed: ${data.status || data.error}`,
          `[${new Date().toLocaleTimeString()}] [ERROR] Diagnostics failed. Check server env configuration.`
        ]);
        setSmtpStatus({
          loaded: true,
          configured: data.configured ?? false,
          status: data.status ?? data.error ?? "Failed to connect",
          smtpEmail: data.smtpEmail ?? null,
        });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Network failure.";
      setDiagnosticLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [ERROR] HTTP request failed: ${errorMsg}`
      ]);
    } finally {
      setRunningDiagnostics(false);
    }
  };

  useEffect(() => {
    if (activeTab === "history") {
      loadLogs(1);
    } else if (activeTab === "diagnostics") {
      loadSMTPStats();
    }
  }, [activeTab, statusFilter]);

  // Handle Search Trigger
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadLogs(1);
  };

  // Composer Actions
  const handleSendTest = async () => {
    if (sendingTest) return;
    setSendingTest(true);
    setBlastResult(null);

    try {
      const res = await fetch("/api/admin/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientType: "test",
          testEmail: testEmailAddress || undefined,
          subject,
          body,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBlastResult({ success: true, message: data.message });
      } else {
        setBlastResult({ success: false, message: data.error || "Failed sending test email." });
      }
    } catch (err) {
      setBlastResult({
        success: false,
        message: err instanceof Error ? err.message : "Failed sending test email.",
      });
    } finally {
      setSendingTest(false);
    }
  };

  const handleSendBlast = async () => {
    setShowConfirmBlast(false);
    setSendingBlast(true);
    setBlastResult(null);

    try {
      const res = await fetch("/api/admin/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientType: "cohort",
          filters,
          subject,
          body,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBlastResult({
          success: true,
          sent: data.sent,
          failed: data.failed,
          message: data.message || "Email blast completed successfully.",
        });
      } else {
        setBlastResult({ success: false, message: data.error || "Batch execution failed." });
      }
    } catch (err) {
      setBlastResult({
        success: false,
        message: err instanceof Error ? err.message : "Batch execution failed.",
      });
    } finally {
      setSendingBlast(false);
    }
  };

  // Preview interpolation helper
  const getInterpolatedBody = () => {
    return body
      .replace(/\{\{email\}\}/g, "candidate@domain.com")
      .replace(/\{\{preference\}\}/g, DEPT_NAMES[filters.department] || "AI/ML (Sample)")
      .replace(/\{\{stage\}\}/g, filters.stage || "1");
  };

  const getInterpolatedSubject = () => {
    return subject
      .replace(/\{\{email\}\}/g, "candidate@domain.com")
      .replace(/\{\{preference\}\}/g, DEPT_NAMES[filters.department] || "AI/ML (Sample)")
      .replace(/\{\{stage\}\}/g, filters.stage || "1");
  };

  return (
    <AdminLayout activePage="emails">
      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full flex-1">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Mail className="h-8 w-8 text-teal-400" />
              Emails
            </h1>
            <p className="text-sm text-zinc-450 mt-1">
              Target cohorts of applicants, monitor delivered messages, and manage configurations.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-zinc-950 border border-zinc-900 p-1 rounded-xl flex gap-1 w-fit">
            <TabsTrigger
              value="composer"
              className="px-4 py-2 text-sm font-bold rounded-lg data-[state=active]:bg-zinc-900 data-[state=active]:text-teal-400 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Send className="h-4 w-4" />
              Composer
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="px-4 py-2 text-sm font-bold rounded-lg data-[state=active]:bg-zinc-900 data-[state=active]:text-teal-400 transition-all flex items-center gap-2 cursor-pointer"
            >
              <History className="h-4 w-4" />
              History Logs
            </TabsTrigger>
            <TabsTrigger
              value="diagnostics"
              className="px-4 py-2 text-sm font-bold rounded-lg data-[state=active]:bg-zinc-900 data-[state=active]:text-teal-400 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Settings className="h-4 w-4" />
              SMTP Settings
            </TabsTrigger>
          </TabsList>

          {/* ─────────────────────────────────────────────────────────────────
              COMPOSER TAB CONTENT
              ───────────────────────────────────────────────────────────────── */}
          <TabsContent value="composer" className="space-y-6 outline-none">
            {blastResult && (
              <Card className={`border ${blastResult.success ? "border-teal-500/20 bg-teal-500/5 text-teal-300" : "border-rose-500/20 bg-rose-500/5 text-rose-300"} p-4 rounded-xl`}>
                <div className="flex gap-3 items-start">
                  {blastResult.success ? (
                    <CheckCircle2 className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-bold text-sm text-white">
                      {blastResult.success ? "Execution Complete" : "Execution Failed"}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-1">{blastResult.message}</p>
                    {blastResult.sent !== undefined && (
                      <div className="flex gap-4 mt-2 text-xs font-bold text-zinc-350">
                        <span>Successfully Dispatched: <span className="text-teal-400">{blastResult.sent}</span></span>
                        <span>Failed: <span className="text-rose-400">{blastResult.failed}</span></span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Side: Filter Options */}
              <div className="lg:col-span-4 space-y-6">
                <Card className="border border-zinc-900 bg-zinc-950/40">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Users className="h-4 w-4 text-teal-400" />
                      Cohort Filters
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Target candidates matching these criteria.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400">Department</label>
                      <Select
                        value={filters.department}
                        onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}
                      >
                        <option value="">All Departments</option>
                        {Object.entries(DEPT_NAMES).map(([slug, name]) => (
                          <option key={slug} value={slug}>
                            {name}
                          </option>
                        ))}
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400">Current Stage</label>
                      <Select
                        value={filters.stage}
                        onChange={(e) => setFilters((f) => ({ ...f, stage: e.target.value }))}
                      >
                        <option value="">All Stages</option>
                        <option value="1">Stage 1</option>
                        <option value="2">Stage 2</option>
                        <option value="3">Stage 3</option>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400">Overall Status</label>
                      <Select
                        value={filters.status}
                        onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
                      >
                        <option value="">All Statuses</option>
                        <option value="in-progress">In Progress</option>
                        <option value="selected">Selected</option>
                        <option value="rejected">Rejected</option>
                        <option value="waitlisted">Waitlisted</option>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-400">Preference Priority</label>
                      <Select
                        value={filters.preference}
                        onChange={(e) => setFilters((f) => ({ ...f, preference: e.target.value }))}
                      >
                        <option value="active">Active Preference (Recommended)</option>
                        <option value="first">First Preference Only</option>
                        <option value="second">Second Preference Only</option>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* Placeholders Card */}
                <Card className="border border-zinc-900 bg-zinc-950/20">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-teal-400" />
                      Dynamic Placeholders
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Inject applicant parameters into the content.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between border-b border-zinc-900/60 pb-2">
                      <span className="text-teal-400 font-bold">{"{{email}}"}</span>
                      <span className="text-zinc-500">Applicant email address</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-900/60 pb-2">
                      <span className="text-teal-400 font-bold">{"{{preference}}"}</span>
                      <span className="text-zinc-500">Target department name</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-teal-400 font-bold">{"{{stage}}"}</span>
                      <span className="text-zinc-500">Current recruitment stage</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Side: Message Editor */}
              <div className="lg:col-span-8 space-y-6">
                <Card className="border border-zinc-900 bg-zinc-950/40">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Mail className="h-4 w-4 text-teal-400" />
                      Message Content
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Draft the email update. Placeholders will automatically resolve at dispatch.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-400">Subject Line</label>
                      <Input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Subject Line"
                        className="font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-400">Email Body</label>
                      <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={12}
                        className="w-full font-mono text-sm rounded-xl border border-zinc-900 bg-zinc-950 p-4 text-zinc-200 placeholder:text-zinc-700 focus:outline-none focus:border-zinc-700 transition-all resize-y"
                        placeholder="Write email contents here. HTML markup tags are not needed."
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="pt-4 border-t border-zinc-900 flex flex-col md:flex-row gap-4 items-center justify-between">
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <Input
                          type="email"
                          placeholder="test@domain.com (Defaults to Admin Email)"
                          value={testEmailAddress}
                          onChange={(e) => setTestEmailAddress(e.target.value)}
                          className="h-9 text-xs w-full md:w-64"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={sendingTest || sendingBlast}
                          onClick={handleSendTest}
                          className="h-9 whitespace-nowrap cursor-pointer text-xs font-bold text-zinc-300 hover:text-white"
                        >
                          {sendingTest ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                          )}
                          Send Test
                        </Button>
                      </div>

                      <Button
                        type="button"
                        disabled={sendingTest || sendingBlast || !subject || !body}
                        onClick={() => setShowConfirmBlast(true)}
                        className="w-full md:w-auto bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-6 py-2 h-9 rounded-xl shadow-[0_0_15px_rgba(20,184,166,0.2)] gap-2 flex items-center justify-center cursor-pointer transition-all"
                      >
                        {sendingBlast ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-3.5 w-3.5" />
                        )}
                        Send Email Blast
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Email Retro Layout Preview Box */}
                <Card className="border border-zinc-900 bg-zinc-950/10 overflow-hidden">
                  <div className="bg-zinc-950 border-b border-zinc-900 px-4 py-2 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500/60" />
                    <span className="text-[10px] font-mono font-bold text-zinc-650 ml-2">Email Rendering Preview (Branded Layout)</span>
                  </div>
                  <CardContent className="p-6 bg-zinc-950/20 max-w-full overflow-x-auto">
                    <div className="max-w-[550px] mx-auto bg-black border-4 border-teal-500 p-5 rounded-none font-mono text-zinc-100 shadow-[0_0_15px_rgba(20,184,166,0.1)]">
                      <div className="text-teal-400 border-b-2 border-teal-500 pb-2 mb-4 font-bold tracking-wider text-sm flex justify-between uppercase">
                        <span>MIC Recruitment</span>
                        <span className="text-zinc-600">v1.0.0</span>
                      </div>
                      <div className="text-xs font-bold text-zinc-500 space-y-1 mb-4 border-b border-zinc-900 pb-3">
                        <p>Subject: <span className="text-zinc-200">{getInterpolatedSubject() || "..."}</span></p>
                        <p>To: <span className="text-zinc-200">candidate@domain.com</span></p>
                      </div>
                      <div className="text-sm whitespace-pre-wrap leading-relaxed text-slate-200 min-h-[80px]">
                        {getInterpolatedBody() || "Enter your email message content..."}
                      </div>
                      <div className="border-t border-zinc-900 pt-4 mt-6 text-[10px] text-zinc-600 text-center">
                        This is an official communication from Microsoft Innovations Club (MIC) Core Team.
                        <br/>Please do not reply directly to this automated email.
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ─────────────────────────────────────────────────────────────────
              HISTORY TAB CONTENT
              ───────────────────────────────────────────────────────────────── */}
          <TabsContent value="history" className="space-y-6 outline-none">
            <Card className="border border-zinc-900 bg-zinc-950/40">
              <CardHeader className="flex flex-col md:flex-row md:items-center justify-between pb-4 space-y-4 md:space-y-0">
                <div>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <History className="h-4 w-4 text-teal-400" />
                    Delivery Logs
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Inspect sent emails, their delivery status, and logs.
                  </CardDescription>
                </div>

                {/* Filters Row */}
                <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
                  <div className="relative w-full sm:w-60">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-600 pointer-events-none" />
                    <Input
                      type="text"
                      placeholder="Search email, subject..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-10 w-full"
                    />
                  </div>

                  <div className="w-full sm:w-40">
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">All Statuses</option>
                      <option value="success">Success</option>
                      <option value="failed">Failed</option>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    variant="outline"
                    className="h-10 px-4 flex gap-2 font-bold text-xs text-zinc-300 hover:text-white cursor-pointer select-none"
                  >
                    Apply
                  </Button>
                </form>
              </CardHeader>

              <CardContent className="p-0">
                {loadingLogs ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="h-8 w-8 text-teal-400 animate-spin" />
                    <p className="text-xs text-zinc-500 font-medium">Retrieving delivery logs...</p>
                  </div>
                ) : logs.length === 0 ? (
                  <div className="text-center py-20 text-zinc-500 font-medium text-xs">
                    No email logs found. Try adjusting filters or compose a new blast.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-y border-zinc-900 bg-zinc-950/60 text-zinc-400 font-bold">
                          <th className="p-4 w-[160px]">Sent Time</th>
                          <th className="p-4 w-[220px]">Recipient</th>
                          <th className="p-4">Subject</th>
                          <th className="p-4 w-[130px]">Status</th>
                          <th className="p-4 w-[100px] text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((log) => (
                          <tr key={log._id} className="border-b border-zinc-900 hover:bg-zinc-950/30 transition-all">
                            <td className="p-4 text-zinc-450 font-mono font-bold whitespace-nowrap">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="p-4 font-bold text-zinc-200">{log.recipientEmail}</td>
                            <td className="p-4 text-zinc-350 max-w-xs truncate">{log.subject}</td>
                            <td className="p-4">
                              {log.status === "success" ? (
                                <Badge variant="success" className="bg-teal-500/10 text-teal-400 border border-teal-500/20 font-bold px-2 py-0.5 rounded-lg">
                                  Success
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 w-fit">
                                  Failed
                                </Badge>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => setSelectedLog(log)}
                                className="h-8 w-8 text-zinc-400 hover:text-white"
                                title="View Email Details"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination Controls */}
                {logsTotal > logsLimit && (
                  <div className="p-4 border-t border-zinc-900 flex justify-between items-center bg-zinc-950/20">
                    <span className="text-[11px] text-zinc-550 font-bold">
                      Showing {(logsPage - 1) * logsLimit + 1} - {Math.min(logsPage * logsLimit, logsTotal)} of {logsTotal} entries
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={logsPage === 1 || loadingLogs}
                        onClick={() => loadLogs(logsPage - 1)}
                        className="h-8 text-xs font-bold text-zinc-400 hover:text-white"
                      >
                        Prev
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={logsPage * logsLimit >= logsTotal || loadingLogs}
                        onClick={() => loadLogs(logsPage + 1)}
                        className="h-8 text-xs font-bold text-zinc-400 hover:text-white"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─────────────────────────────────────────────────────────────────
              SMTP SETTINGS / DIAGNOSTICS TAB CONTENT
              ───────────────────────────────────────────────────────────────── */}
          <TabsContent value="diagnostics" className="space-y-6 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Configuration Status Card */}
              <div className="lg:col-span-5 space-y-6">
                <Card className="border border-zinc-900 bg-zinc-950/40">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Settings className="h-4 w-4 text-teal-400" />
                      Server SMTP Config
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Verify NodeMailer connectivity setup.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3">
                      <span className="text-xs font-bold text-zinc-400">SMTP Host</span>
                      <span className="text-xs font-mono font-bold text-zinc-200">Gmail SMTP</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3">
                      <span className="text-xs font-bold text-zinc-400">Sender Account</span>
                      <span className="text-xs font-mono font-bold text-zinc-200">
                        {smtpStatus.smtpEmail || "Unconfigured"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3">
                      <span className="text-xs font-bold text-zinc-400">Configuration</span>
                      <span>
                        {smtpStatus.configured ? (
                          <Badge className="bg-teal-500/10 text-teal-400 border border-teal-500/20 font-bold px-2 py-0.5 rounded-lg text-[10px]">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold px-2 py-0.5 rounded-lg text-[10px]">
                            Missing
                          </Badge>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-400">SMTP Health Status</span>
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${smtpStatus.status.includes("successfully") ? "bg-teal-400 animate-pulse" : "bg-rose-500"} `} />
                        <span className="text-xs font-bold text-zinc-300">
                          {smtpStatus.status || "Pending check"}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-900">
                      <Button
                        type="button"
                        onClick={runSMTPDiagnostics}
                        disabled={runningDiagnostics}
                        className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold h-10 rounded-xl gap-2 flex items-center justify-center cursor-pointer transition-all shadow-[0_0_15px_rgba(20,184,166,0.2)]"
                      >
                        {runningDiagnostics ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                        Run Connection Diagnostics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Terminal Diagnostics logs */}
              <div className="lg:col-span-7 space-y-6">
                <Card className="border border-zinc-900 bg-zinc-950/40">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-teal-400" />
                      Diagnostics Terminal
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Live connection verification test log results.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full bg-black border border-zinc-900 rounded-xl p-4 font-mono text-[11px] text-zinc-350 min-h-[220px] max-h-[350px] overflow-y-auto space-y-2 leading-relaxed shadow-inner">
                      {diagnosticLogs.length === 0 ? (
                        <p className="text-zinc-600 font-medium">Click "Run Connection Diagnostics" to test server pathways...</p>
                      ) : (
                        diagnosticLogs.map((logStr, idx) => {
                          let colorClass = "text-zinc-400";
                          if (logStr.includes("[SUCCESS]")) colorClass = "text-teal-400 font-bold";
                          if (logStr.includes("[ERROR]")) colorClass = "text-rose-400 font-bold";
                          if (logStr.includes("[INFO]")) colorClass = "text-zinc-550";
                          return (
                            <p key={idx} className={colorClass}>
                              {logStr}
                            </p>
                          );
                        })
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* ─────────────────────────────────────────────────────────────────
            DIALOG MODALS & POPUPS
            ───────────────────────────────────────────────────────────────── */}

        {/* 1. Confirm Email Blast Modal */}
        <AlertDialog
          isOpen={showConfirmBlast}
          onClose={() => setShowConfirmBlast(false)}
          onConfirm={handleSendBlast}
          title="Verify Batch Email Blast"
          description="Are you absolutely sure you want to blast this email to the filtered cohort of candidates? This operation will process emails sequentially and cannot be cancelled once initiated."
          confirmText="Verify & Send"
          cancelText="Cancel"
          loading={sendingBlast}
        />

        {/* 2. View Log Details Dialog */}
        <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
          <DialogContent className="max-w-2xl bg-zinc-950 border border-zinc-900 rounded-2xl p-6 font-mono">
            {selectedLog && (
              <>
                <DialogHeader className="border-b border-zinc-900 pb-3">
                  <DialogTitle className="text-base text-white font-extrabold flex items-center gap-2">
                    <Mail className="h-5 w-5 text-teal-400" />
                    Delivery Log Details
                  </DialogTitle>
                  <DialogDescription className="text-xs text-zinc-500">
                    Record ID: {selectedLog._id}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 my-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-zinc-900 pb-4">
                    <div className="space-y-1">
                      <span className="text-zinc-500 font-bold">Recipient</span>
                      <p className="text-zinc-200 font-bold">{selectedLog.recipientEmail}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-zinc-500 font-bold">Sender Admin</span>
                      <p className="text-zinc-200">{selectedLog.senderEmail}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-zinc-500 font-bold">Sent Time</span>
                      <p className="text-zinc-200">{new Date(selectedLog.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-zinc-500 font-bold">Status</span>
                      <div>
                        {selectedLog.status === "success" ? (
                          <Badge className="bg-teal-500/10 text-teal-400 border border-teal-500/20 font-bold">
                            Success
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">
                            Failed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-zinc-500 font-bold">Subject</span>
                    <p className="text-zinc-100 font-bold p-3 bg-black border border-zinc-900 rounded-xl leading-normal">
                      {selectedLog.subject}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-zinc-500 font-bold">Email Body</span>
                    <div className="text-zinc-200 p-4 bg-black border border-zinc-900 rounded-xl max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                      {selectedLog.body}
                    </div>
                  </div>

                  {selectedLog.errorDetails && (
                    <div className="space-y-1 p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl text-rose-300">
                      <span className="font-bold flex items-center gap-1.5 text-rose-450">
                        <AlertTriangle className="h-4 w-4" />
                        Error Trace Details:
                      </span>
                      <p className="mt-1 font-mono text-[11px] leading-relaxed select-text">
                        {selectedLog.errorDetails}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4 border-t border-zinc-900">
                  <Button
                    type="button"
                    onClick={() => setSelectedLog(null)}
                    className="px-5 font-bold border border-zinc-900 bg-zinc-950/60 text-zinc-300 hover:bg-zinc-900 hover:text-white rounded-xl h-10 cursor-pointer select-none text-xs"
                  >
                    Close Details
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
