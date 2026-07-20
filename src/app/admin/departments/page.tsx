"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Building, Settings2 } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

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
  totalStages: number;
}

export default function AdminDepartmentsPage() {
  const [deptConfigs, setDeptConfigs] = useState<Record<string, DeptConfig>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const deptRes = await Promise.all(
          DEPTS.map((d) => fetch(`/api/admin/departments/${d.slug}`))
        );

        const configs: Record<string, DeptConfig> = {};
        for (let i = 0; i < deptRes.length; i++) {
          const data = await deptRes[i].json();
          if (data.success && data.department) {
            const dept = data.department;
            configs[dept.slug] = {
              slug: dept.slug,
              isActive: dept.isActive,
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

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-teal-400 animate-spin" />
          <p className="text-sm text-zinc-400 font-medium">Loading departments...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout activePage="departments">
      <div className="p-8 space-y-8 max-w-7xl mx-auto w-full pb-20">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Building className="h-8 w-8 text-teal-400" />
            Departments
          </h1>
          <p className="text-sm text-zinc-450 mt-2 max-w-2xl">
            Select a department below to view its real-time analytics, manage active statuses, evaluation stages, and configure custom application questions.
          </p>
        </div>

        {/* Department Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {DEPTS.map((dept) => {
            const config = deptConfigs[dept.slug];

            return (
              <Link href={`/admin/departments/${dept.slug}`} key={dept.slug} className="block">
                <Card 
                  className="bg-zinc-950/50 border-zinc-900 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all cursor-pointer group flex flex-col h-full"
                >
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant={dept.type === "tech" ? "info" : "secondary"} className="mb-2">
                        {dept.type}
                      </Badge>
                      {config && (
                        <Badge variant={config.isActive ? "success" : "default"}>
                          {config.isActive ? "Active" : "Inactive"}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-teal-400 transition-colors">
                      {dept.name}
                    </h3>
                    <div className="mt-auto pt-6 flex items-center justify-between">
                      <p className="text-xs text-zinc-500 font-medium">
                        {config ? `${config.totalStages} Stages` : "Loading..."}
                      </p>
                      <div className="h-8 w-8 rounded-full bg-zinc-900 flex items-center justify-center group-hover:bg-teal-500/20 group-hover:text-teal-400 text-zinc-500 transition-colors">
                        <Settings2 className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
