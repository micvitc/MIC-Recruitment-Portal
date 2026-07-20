"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { BarChart3, Users, Settings, LogOut, TrendingUp, Mail, Calendar, Activity, Gamepad2, PanelLeftClose, PanelLeftOpen, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Press_Start_2P } from "next/font/google";
import { playRetroSound } from "@/lib/audio";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
});

interface AdminLayoutProps {
  children: React.ReactNode;
  activePage: "dashboard" | "applications" | "settings" | "analytics" | "emails" | "interviews" | "logs" | "arcade" | "departments";
}

export function AdminLayout({ children, activePage }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [coins, setCoins] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const loadCoins = () => {
      setCoins(Number(localStorage.getItem("admin_coins") || "0"));
    };
    loadCoins();
    window.addEventListener("admin_coins_update", loadCoins);
    window.addEventListener("storage", loadCoins);
    return () => {
      window.removeEventListener("admin_coins_update", loadCoins);
      window.removeEventListener("storage", loadCoins);
    };
  }, []);

  const playCoinSound = () => {
    playRetroSound("coin");
  };

  const playJumpSound = () => {
    playRetroSound("arcade_jump");
  };

  const incrementCoins = () => {
    const nextCoins = coins + 1;
    setCoins(nextCoins);
    localStorage.setItem("admin_coins", String(nextCoins));
    window.dispatchEvent(new Event("admin_coins_update"));
    playCoinSound();
  };

  const handleNavClick = (href: string) => {
    incrementCoins();
    router.push(href);
  };

  const navItems = [
    {
      icon: <BarChart3 className="h-4 w-4" />,
      label: "Dashboard",
      href: "/admin/dashboard",
      key: "dashboard" as const,
    },
    {
      icon: <TrendingUp className="h-4 w-4" />,
      label: "Analytics",
      href: "/admin/analytics",
      key: "analytics" as const,
    },
    {
      icon: <Users className="h-4 w-4" />,
      label: "Applications",
      href: "/admin/applications",
      key: "applications" as const,
    },
    {
      icon: <Mail className="h-4 w-4" />,
      label: "Emails",
      href: "/admin/emails",
      key: "emails" as const,
    },
    {
      icon: <Calendar className="h-4 w-4" />,
      label: "Interviews",
      href: "/admin/interviews",
      key: "interviews" as const,
    },
    {
      icon: <Activity className="h-4 w-4" />,
      label: "Audit Logs",
      href: "/admin/logs",
      key: "logs" as const,
    },
    {
      icon: <Gamepad2 className="h-4 w-4" />,
      label: "Super Mario",
      href: "/admin/arcade",
      key: "arcade" as const,
    },
    {
      icon: <Building className="h-4 w-4" />,
      label: "Departments",
      href: "/admin/departments",
      key: "departments" as const,
    },
    {
      icon: <Settings className="h-4 w-4" />,
      label: "Settings",
      href: "/admin/settings",
      key: "settings" as const,
    },
  ];

  return (
    <div className={`${pressStart.variable} min-h-screen bg-black text-slate-100 flex`}>
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-56 bg-zinc-950 border-r-4 border-black flex flex-col z-20 transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 border-b-4 border-black flex items-center justify-between gap-3 bg-zinc-900/20">
          <div className="flex items-center gap-3">
            <img
              src="/mic_logo_pixel.png"
              alt="MIC Logo"
              className="pixelated w-10 h-7 select-none object-contain hover:-translate-y-1 hover:scale-105 transition-all cursor-pointer"
              onClick={playJumpSound}
            />
            <div>
              <p className="text-xs text-zinc-550 uppercase tracking-widest font-extrabold">
                Admin
              </p>
              <p className="text-base font-extrabold text-white mt-0.5">Portal</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(false)}
            className="h-8 w-8 text-zinc-400 hover:text-white"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>

        {/* Coin Counter */}
        <div className="px-5 py-2.5 border-b-4 border-black bg-black flex items-center justify-between font-press-start text-[8px] text-amber-400">
          <span className="flex items-center gap-1.5 animate-retro-float-small">
            🪙 COINS
          </span>
          <span className="text-white text-[9px] font-extrabold">{String(coins).padStart(4, "0")}</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 bg-zinc-950">
          {navItems.map((item) => {
            const isActive = activePage === item.key || pathname.startsWith(item.href);
            return (
              <Button
                key={item.href}
                variant={isActive ? "default" : "ghost"}
                onClick={() => handleNavClick(item.href)}
                className={`w-full justify-start gap-3 px-3.5 py-2.5 text-sm font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-amber-400 text-black border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-amber-300 font-bold active:translate-y-[1px] active:shadow-[1px_1px_0px_rgba(0,0,0,1)]"
                    : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
                }`}
              >
                {item.icon}
                {item.label}
              </Button>
            );
          })}
        </nav>

        <div className="p-4 border-t-4 border-black bg-zinc-950">
          <Button
            variant="ghost"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="w-full justify-start gap-3 px-3.5 py-2.5 text-sm font-bold text-zinc-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Toggle Button when Sidebar is closed */}
      {!isSidebarOpen && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-30 bg-zinc-950 border-2 border-zinc-800 hover:bg-zinc-900 text-white"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </Button>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 min-h-screen flex flex-col bg-black transition-all duration-300 ${isSidebarOpen ? "ml-56" : "ml-0"}`}>
        {children}
      </main>
    </div>
  );
}
