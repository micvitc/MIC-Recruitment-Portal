"use client";

import { signIn } from "next-auth/react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (data?.user?.role === "admin") {
          router.replace("/admin/dashboard");
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-teal-400 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
          <ShieldCheck className="h-8 w-8 text-teal-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-white">Admin Access</h1>
          <p className="text-slate-400 text-sm">Sign in with your MIC admin Google account.</p>
        </div>
        <button
          onClick={() => signIn("google", { callbackUrl: "/admin/dashboard" })}
          className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-white text-slate-950 font-bold text-sm hover:bg-slate-100 transition-all"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>
        <p className="text-[11px] text-slate-600">Access is restricted to accounts with admin role in the MIC database.</p>
      </div>
    </main>
  );
}
