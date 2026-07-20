"use client";

import React, { useEffect, useState, use } from "react";
import { Loader2, Save, CheckCircle2, Trash2, Plus, Users, BarChart, Settings2, ArrowLeft, Target, Activity } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

interface FormField {
  id: string;
  label: string;
  type: string;
  required: boolean;
}

interface StageConfig {
  stage: number;
  title: string;
  description: string;
  formFields: FormField[];
}

interface DeptConfig {
  slug: string;
  isActive: boolean;
  totalStages: number;
  stageToggles: Record<string, boolean>;
  stages: StageConfig[];
}

interface DeptStats {
  totalApplicants: number;
  selected: number;
  conversionRate: string;
  byStage: Record<number, number>;
}

export default function DepartmentConfigPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = use(params);
  
  const [config, setConfig] = useState<DeptConfig | null>(null);
  const [stats, setStats] = useState<DeptStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);

  const deptInfo = DEPTS.find(d => d.slug === slug);

  useEffect(() => {
    if (!deptInfo) {
      router.push("/admin/departments");
      return;
    }

    const loadData = async () => {
      try {
        const [configRes, statsRes] = await Promise.all([
          fetch(`/api/admin/departments/${slug}`),
          fetch(`/api/admin/departments/${slug}/stats`)
        ]);

        const configData = await configRes.json();
        if (configData.success && configData.department) {
          const dept = configData.department;
          setConfig({
            slug: dept.slug,
            isActive: dept.isActive,
            totalStages: dept.totalStages,
            stageToggles: dept.stageToggles || { "1": true, "2": false, "3": false, "4": false, "5": false },
            stages: dept.stages?.length > 0 ? dept.stages : [{ stage: 1, title: "Stage 1", description: "Registration", formFields: [] }],
          });
        }

        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats(statsData.stats);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setStatsLoading(false);
      }
    };
    
    loadData();
  }, [slug, deptInfo, router]);

  const saveDept = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/departments/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: config.isActive,
          totalStages: config.totalStages,
          stageToggles: config.stageToggles,
          stages: config.stages,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const addField = () => {
    setConfig((prev) => {
      if (!prev) return prev;
      const newConfig = { ...prev };
      const newFields = [...(newConfig.stages[0].formFields || [])];
      newFields.push({ id: `field_${Date.now()}`, label: "", type: "text", required: true });
      newConfig.stages = [{ ...newConfig.stages[0], formFields: newFields }];
      return newConfig;
    });
  };

  const updateField = (idx: number, key: keyof FormField, value: any) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const newConfig = { ...prev };
      const newFields = [...(newConfig.stages[0].formFields || [])];
      newFields[idx] = { ...newFields[idx], [key]: value };
      newConfig.stages = [{ ...newConfig.stages[0], formFields: newFields }];
      return newConfig;
    });
  };

  const removeField = (idx: number) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const newConfig = { ...prev };
      const newFields = [...(newConfig.stages[0].formFields || [])];
      newFields.splice(idx, 1);
      newConfig.stages = [{ ...newConfig.stages[0], formFields: newFields }];
      return newConfig;
    });
  };

  if (loading || !deptInfo) {
    return (
      <AdminLayout activePage="departments">
        <div className="min-h-[80dvh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-teal-500 animate-spin" />
            <p className="text-sm text-zinc-400 font-medium tracking-wide">Loading Dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activePage="departments">
      {/* Dynamic Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 flex justify-center items-start overflow-hidden">
        <div className="w-[800px] h-[500px] bg-teal-900/20 blur-[120px] rounded-full translate-y-[-50%]" />
      </div>

      <div className="relative z-10 p-8 space-y-8 max-w-7xl mx-auto w-full pb-20">
        
        {/* Header & Save Action */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-zinc-800/60">
          <div className="flex items-start gap-5">
            <Link href="/admin/departments">
              <Button variant="outline" size="icon" className="mt-1 h-11 w-11 rounded-xl border-zinc-700/50 bg-zinc-900/50 hover:bg-zinc-800 hover:text-white transition-all shadow-lg backdrop-blur-md">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant={deptInfo.type === "tech" ? "info" : "secondary"} className="uppercase tracking-widest px-2.5 py-0.5 text-[10px]">
                  {deptInfo.type}
                </Badge>
                {config && (
                  <Badge variant={config.isActive ? "success" : "default"} className="uppercase tracking-widest px-2.5 py-0.5 text-[10px] bg-black border-zinc-800">
                    {config.isActive ? "Active Department" : "Inactive Department"}
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/40 tracking-tight">
                {deptInfo.name}
              </h1>
            </div>
          </div>
          
          <Button
            onClick={saveDept}
            disabled={saving || !config}
            className={`font-bold text-sm h-12 px-8 gap-2 shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all ${
              saved 
                ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                : "bg-teal-500 hover:bg-teal-600 text-white"
            }`}
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : saved ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            {saved ? "Configuration Saved!" : "Save Configuration"}
          </Button>
        </div>

        {/* Analytics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-zinc-950/40 backdrop-blur-md border-zinc-800/50 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold mb-1.5">Total Applicants</p>
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin text-zinc-700" /> : <p className="text-3xl font-black text-white">{stats?.totalApplicants || 0}</p>}
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950/40 backdrop-blur-md border-zinc-800/50 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold mb-1.5">Selected Rate</p>
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin text-zinc-700" /> : <p className="text-3xl font-black text-emerald-400">{stats?.conversionRate || "0"}%</p>}
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950/40 backdrop-blur-md border-zinc-800/50 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold mb-1.5">Stage 1 Active</p>
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin text-zinc-700" /> : <p className="text-3xl font-black text-white">{stats?.byStage[1] || 0}</p>}
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950/40 backdrop-blur-md border-zinc-800/50 overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold mb-1.5">Task Submission Active</p>
                {statsLoading ? <Loader2 className="h-6 w-6 animate-spin text-zinc-700" /> : <p className="text-3xl font-black text-pink-400">{stats?.byStage[2] || 0}</p>}
              </div>
              <div className="h-10 w-10 rounded-full bg-pink-500/10 flex items-center justify-center">
                <BarChart className="h-5 w-5 text-pink-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Custom Questions Section (Left 2/3) */}
          <div className="lg:col-span-2">
            <Card className="bg-zinc-950/60 backdrop-blur-xl border-zinc-800/60 shadow-xl">
              <CardHeader className="border-b border-zinc-800/60 bg-zinc-900/20 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                      <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                        <Plus className="h-4 w-4 text-teal-400" />
                      </div>
                      Stage 1 Custom Questions
                    </CardTitle>
                    <CardDescription className="mt-2 text-xs text-zinc-400">
                      Define the specific information required from candidates when they initially apply.
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={addField} className="text-xs h-9 gap-1.5 border-zinc-700 hover:border-zinc-500 bg-zinc-900 hover:bg-zinc-800 text-zinc-100">
                    <Plus className="h-3.5 w-3.5" /> Add Question
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {config?.stages?.[0]?.formFields?.length === 0 ? (
                    <div className="bg-zinc-900/30 border-2 border-dashed border-zinc-800 rounded-xl p-10 flex flex-col items-center justify-center text-center">
                      <div className="h-12 w-12 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
                        <Plus className="h-5 w-5 text-zinc-500" />
                      </div>
                      <p className="text-sm font-medium text-zinc-400 mb-1">No custom questions added yet</p>
                      <p className="text-xs text-zinc-500 max-w-sm">Click the 'Add Question' button above to start collecting specific information from applicants.</p>
                    </div>
                  ) : (
                    config?.stages?.[0]?.formFields?.map((field, idx) => (
                      <div key={idx} className="group flex flex-col sm:flex-row gap-4 bg-zinc-900/40 hover:bg-zinc-900/80 transition-colors p-5 rounded-xl border border-zinc-800/80">
                        <div className="flex-1 space-y-2">
                          <label className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                            Question Label
                          </label>
                          <Input 
                            value={field.label} 
                            onChange={(e) => updateField(idx, "label", e.target.value)} 
                            placeholder="e.g. Provide a link to your portfolio" 
                            className="h-10 text-sm bg-zinc-950/50 border-zinc-800 focus-visible:ring-teal-500/50 transition-all" 
                          />
                        </div>
                        <div className="w-full sm:w-48 space-y-2">
                          <label className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Input Type</label>
                          <select 
                            value={field.type} 
                            onChange={(e) => updateField(idx, "type", e.target.value)} 
                            className="h-10 w-full text-sm bg-zinc-950/50 border border-zinc-800 text-zinc-300 rounded-md px-3 focus:ring-2 focus:ring-teal-500/50 outline-none transition-all"
                          >
                            <option value="text">Short Text</option>
                            <option value="textarea">Long Text</option>
                            <option value="url">URL Link</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-[1.35rem]">
                          <Button 
                            variant={field.required ? "emerald" : "outline"} 
                            size="sm" 
                            onClick={() => updateField(idx, "required", !field.required)}
                            className={`h-10 text-xs px-4 w-24 border ${!field.required && 'border-zinc-700 hover:border-zinc-500 bg-zinc-950 hover:bg-zinc-900'}`}
                          >
                            {field.required ? "Required" : "Optional"}
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            onClick={() => removeField(idx)}
                            className="h-10 w-10 shrink-0 opacity-100 sm:opacity-50 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Core Settings Section (Right 1/3) */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-zinc-950/60 backdrop-blur-xl border-zinc-800/60 shadow-xl">
              <CardHeader className="border-b border-zinc-800/60 bg-zinc-900/20 px-6 py-5">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-white">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <Settings2 className="h-4 w-4 text-indigo-400" />
                  </div>
                  Core Controls
                </CardTitle>
                <CardDescription className="mt-2 text-xs text-zinc-400">
                  Manage master status and evaluation stage pipeline.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                {/* Active toggle */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
                      Department Visibility
                    </label>
                  </div>
                  <Button
                    variant={config?.isActive ? "emerald" : "secondary"}
                    onClick={() =>
                      setConfig((p) => (p ? { ...p, isActive: !p.isActive } : p))
                    }
                    className="w-full font-bold text-sm h-12 shadow-inner"
                  >
                    {config?.isActive ? "Active / Enabled" : "Inactive / Disabled"}
                  </Button>
                </div>

                {/* Total stages */}
                <div className="space-y-3">
                  <label className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
                    Total Evaluation Stages
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={config?.totalStages || 1}
                    onChange={(e) =>
                      setConfig((p) => (p ? { ...p, totalStages: parseInt(e.target.value) || 1 } : p))
                    }
                    className="font-bold bg-zinc-950/50 border-zinc-800 h-12 text-lg text-center"
                  />
                </div>

                <div className="pt-6 border-t border-zinc-800/60">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 mb-4">
                    Stage Gates
                  </p>
                  <div className="space-y-2">
                    {[1, 2, 3].map((num) => {
                      const isOpen = config?.stageToggles?.[num.toString()] !== false;
                      const stageLabels: Record<number, string> = { 1: "Stage 1 (Reg)", 2: "Stage 2 (Task)", 3: "Stage 3 (Interview)" };
                      
                      return (
                        <div key={num} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50">
                          <span className="text-xs font-bold text-zinc-300">{stageLabels[num]}</span>
                          <Button
                            variant={isOpen ? "emerald" : "outline"}
                            size="sm"
                            onClick={() =>
                              setConfig((p) => {
                                if (!p) return p;
                                return {
                                  ...p,
                                  stageToggles: {
                                    ...p.stageToggles,
                                    [num.toString()]: !isOpen,
                                  },
                                };
                              })
                            }
                            className={`h-7 px-3 text-[10px] tracking-wider uppercase font-extrabold ${!isOpen && 'border-zinc-700 bg-zinc-950 text-zinc-500'}`}
                          >
                            {isOpen ? "Open" : "Closed"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
