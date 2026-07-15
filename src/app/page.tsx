"use client";

import React, { useState, useEffect, useRef } from "react";
import { signIn, signOut } from "next-auth/react";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Github,
  Linkedin,
  Globe,
  ShieldCheck,
  Cpu,
  Info,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: any) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

export default function RegistrationPage() {
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Development",
    githubUrl: "",
    linkedinUrl: "",
    portfolioUrl: "",
  });

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });

  const [captchaLogs, setCaptchaLogs] = useState<string[]>([]);
  const turnstileWidgetId = useRef<string | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);

  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString();
    setCaptchaLogs((prev) => [`[${time}] ${message}`, ...prev.slice(0, 8)]);
  };

  // Client hydration and Turnstile script initialization
  useEffect(() => {
    setMounted(true);
    addLog("Application mounted. Ready to load Cloudflare Turnstile widget.");

    // Fetch NextAuth session
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data && Object.keys(data).length > 0 && data.user) {
          setSession(data);
          addLog(`Session: Authenticated as ${data.user.name || data.user.email}`);
          setFormData((prev) => ({
            ...prev,
            name: prev.name || data.user.name || "",
            email: prev.email || data.user.email || "",
          }));
        } else {
          addLog("Session: Not authenticated.");
        }
      })
      .catch((err) => {
        console.error("Error fetching session:", err);
        addLog("Session: Failed to fetch session.");
      });

    // Safe read of query params to auto-select track
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlRole = params.get("role");
      if (urlRole) {
        const roleMapping: Record<string, string> = {
          "dev": "Development",
          "cc": "Competitive Coding",
          "uiux": "UI/UX",
          "aiml": "AI/ML",
          "cyber": "Cyber Security",
          "design": "Design",
          "mgmt": "Management",
          "ep": "Entrepreneurship",
          "media": "Content & Media",
        };
        const selectedRole = roleMapping[urlRole.toLowerCase()] || urlRole;
        setFormData((prev) => ({ ...prev, role: selectedRole }));
      }
    }

    // Explicit Turnstile injection & rendering
    const scriptId = "cloudflare-turnstile-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const renderWidget = () => {
      if (window.turnstile && turnstileContainerRef.current) {
        try {
          const widgetId = window.turnstile.render(turnstileContainerRef.current, {
            sitekey: turnstileSiteKey,
            callback: (token: string) => {
              setCaptchaToken(token);
              addLog("Turnstile token received.");
            },
            "error-callback": (err: any) => {
              setCaptchaToken(null);
              addLog(`Turnstile error: ${JSON.stringify(err)}`);
            },
            "expired-callback": () => {
              setCaptchaToken(null);
              addLog("Turnstile token expired.");
            },
            theme: "dark",
          });
          turnstileWidgetId.current = widgetId;
        } catch (err) {
          console.error("Turnstile render error:", err);
          addLog("Turnstile rendering failed.");
        }
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      script.onload = renderWidget;
    }

    return () => {
      // Clean up Turnstile widget on component unmount
      if (window.turnstile && turnstileWidgetId.current) {
        try {
          window.turnstile.remove(turnstileWidgetId.current);
        } catch (err) {
          console.error("Error removing Turnstile widget:", err);
        }
      }
    };
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, name: e.target.value }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, email: e.target.value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, phone: e.target.value }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, role: e.target.value }));
  };

  const handleGithubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, githubUrl: e.target.value }));
  };

  const handleLinkedinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, linkedinUrl: e.target.value }));
  };

  const handlePortfolioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, portfolioUrl: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.role) {
      setStatus({ type: "error", message: "Please fill out all required fields." });
      addLog("Form submission blocked: Missing required fields.");
      return;
    }

    if (!captchaToken) {
      setStatus({ type: "error", message: "Please complete the Turnstile verification first." });
      addLog("Form submission blocked: CAPTCHA token not acquired.");
      return;
    }

    setStatus({ type: "loading", message: "Verifying security token and saving registration..." });
    addLog(`Submitting payload to API... Verification Token (first 10 chars): ${captchaToken.slice(0, 10)}...`);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          captchaToken,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus({
          type: "success",
          message: "Congratulations! Your registration has been successfully recorded in MongoDB.",
        });
        addLog("Database write complete: Registration successfully recorded!");
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          role: "Development",
          githubUrl: "",
          linkedinUrl: "",
          portfolioUrl: "",
        });
        setCaptchaToken(null);
        // Reset Turnstile widget
        if (window.turnstile && turnstileWidgetId.current) {
          window.turnstile.reset(turnstileWidgetId.current);
        }
      } else {
        setStatus({
          type: "error",
          message: data.error || "Security verification failed. Please try again.",
        });
        addLog(`API rejected submission: ${data.error}`);
        setCaptchaToken(null);
        if (window.turnstile && turnstileWidgetId.current) {
          window.turnstile.reset(turnstileWidgetId.current);
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      setStatus({
        type: "error",
        message: "Network error occurred. Please verify your connection and try again.",
      });
      addLog("API call failed due to network/server issue.");
    }
  };

  if (!mounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <Cpu className="h-10 w-10 animate-spin text-teal-400" />
          <p className="text-sm font-medium tracking-wide">Scaffolding Portal...</p>
        </div>
      </div>
    );
  }

  const isUsingTestKey = turnstileSiteKey === "1x00000000000000000000AA";

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4 md:p-8 overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      {/* Decorative cyber glow backgrounds */}
      <div className="absolute top-0 right-1/4 -z-10 h-96 w-96 rounded-full bg-teal-500/10 blur-[120px]" />
      <div className="absolute bottom-10 left-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[150px]" />

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10 my-8">
        
        {/* Left Side: Informative panel detailing comparison and real-time logs */}
        <section className="lg:col-span-5 flex flex-col gap-6 text-slate-300">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Cpu className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold tracking-wider uppercase text-teal-400">MIC Recruitment Hub</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Advanced <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">Bot Shield</span> Integration
          </h1>

          <p className="text-slate-400 text-base leading-relaxed">
            This recruitment portal showcases premium security defense integrations. 
            Evaluate the frictionless user experience of Cloudflare's Turnstile challenge, and submit applicant records directly to MongoDB.
          </p>

          {/* Feature highlights */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-5 border border-slate-800/80 shadow-2xl flex flex-col gap-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Info className="h-4.5 w-4.5 text-teal-400" />
              Integration Architecture
            </h3>
            
            <div className="space-y-3.5 text-sm">
              <div className="flex gap-3">
                <div className="mt-0.5 text-teal-400 font-mono">1.</div>
                <div>
                  <span className="text-white font-medium">Cloudflare Turnstile:</span> 
                  Uses advanced client behavior telemetry. In 99% of cases, the challenge runs invisibly with zero user interaction.
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-0.5 text-teal-400 font-mono">2.</div>
                <div>
                  <span className="text-white font-medium">Explicit Rendering:</span> 
                  Wired using Cloudflare's direct client JS API for precise lifecycle hooks and robust unmount cleaning.
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-0.5 text-teal-400 font-mono">3.</div>
                <div>
                  <span className="text-white font-medium">Cloudflare WAF / DDoS:</span>
                  Cloudflare sits in front of the application DNS to block attacks at the network edge before hitting our server routes.
                </div>
              </div>
            </div>
          </div>

          {/* Real-time telemetry log console */}
          <div className="bg-black/80 rounded-2xl border border-slate-800 p-5 shadow-inner">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
                Security Telemetry Log
              </h4>
              <button 
                onClick={() => setCaptchaLogs([])} 
                className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors uppercase font-mono tracking-wider flex items-center gap-1"
              >
                <RotateCcw className="h-2.5 w-2.5" /> Clear Logs
              </button>
            </div>
            <div className="font-mono text-xs text-slate-500 space-y-1.5 h-36 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
              {captchaLogs.length === 0 ? (
                <p className="italic text-slate-700">Waiting for actions...</p>
              ) : (
                captchaLogs.map((log, index) => (
                  <p key={index} className="text-slate-400 break-all leading-relaxed">
                    <span className="text-slate-600">{log.substring(0, 10)}</span>
                    {log.substring(10)}
                  </p>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Right Side: The Registration Card & Form */}
        <section className="lg:col-span-7">
          <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/5 shadow-2xl shadow-slate-950/50">
            
            {/* Google Authentication Status */}
            <div className="mb-6 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {session ? (
                  <>
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="h-9 w-9 rounded-full ring-2 ring-teal-500/30"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 font-semibold border border-teal-500/20">
                        {session.user?.name?.charAt(0) || "U"}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-semibold text-white">Signed in via Google</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{session.user?.email}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                      <User className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">Express Application</p>
                      <p className="text-[10px] text-slate-400">Sign in to auto-fill your details</p>
                    </div>
                  </>
                )}
              </div>
              <div>
                {session ? (
                  <button
                    type="button"
                    onClick={() => {
                      signOut({ redirect: false }).then(() => {
                        setSession(null);
                        setFormData((prev) => ({ ...prev, name: "", email: "" }));
                        addLog("Session: Signed out.");
                      });
                    }}
                    className="py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
                  >
                    Sign Out
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      signIn("google");
                      addLog("Redirecting to Google OAuth...");
                    }}
                    className="py-1.5 px-3 rounded-lg bg-white text-slate-950 text-[11px] font-semibold hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
                  >
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                    </svg>
                    Sign In
                  </button>
                )}
              </div>
            </div>

            {/* Static Bot Protection Details */}
            <div className="mb-6 p-4 rounded-xl bg-teal-500/5 border border-teal-500/10 flex items-center justify-between gap-3 text-xs text-teal-300">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-teal-400 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-white">Cloudflare Turnstile Active:</span> Invisible, frictionless security verification.
                </div>
              </div>
            </div>

            {/* Warning when using fallback test keys */}
            {isUsingTestKey && (
              <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex gap-3">
                <AlertTriangle className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-blue-100">Running with Test Credentials:</span> No environment variables were detected for Turnstile in <code className="px-1 py-0.5 bg-slate-950 rounded border border-white/5 font-mono">.env.local</code>. Scaffolding is operating with Cloudflare's public test keys.
                </div>
              </div>
            )}

            {/* Main Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-xs font-semibold text-slate-300 uppercase tracking-wide">
                    Full Name <span className="text-teal-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                    <input
                      id="name"
                      type="text"
                      required
                      placeholder="e.g. Alan Turing"
                      value={formData.name}
                      onChange={handleNameChange}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wide">
                    Email Address <span className="text-teal-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="e.g. turing@mic.club"
                      value={formData.email}
                      onChange={handleEmailChange}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Phone */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-xs font-semibold text-slate-300 uppercase tracking-wide">
                    Phone Number <span className="text-teal-400">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                    <input
                      id="phone"
                      type="tel"
                      required
                      placeholder="e.g. +1 555-0199"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all"
                    />
                  </div>
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <label htmlFor="role" className="block text-xs font-semibold text-slate-300 uppercase tracking-wide">
                    Target Role <span className="text-teal-400">*</span>
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                    <select
                      id="role"
                      value={formData.role}
                      onChange={handleRoleChange}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="Development">Development</option>
                      <option value="Competitive Coding">Competitive Coding</option>
                      <option value="UI/UX">UI/UX</option>
                      <option value="AI/ML">AI/ML</option>
                      <option value="Cyber Security">Cyber Security</option>
                      <option value="Design">Design</option>
                      <option value="Management">Management</option>
                      <option value="Entrepreneurship">Entrepreneurship</option>
                      <option value="Content & Media">Content & Media</option>
                      <option value="Frontend Developer">Frontend Developer</option>
                      <option value="Backend Developer">Backend Developer</option>
                      <option value="UI/UX Designer">UI/UX Designer</option>
                      <option value="Mobile Developer">Mobile Developer</option>
                      <option value="DevOps Engineer">DevOps Engineer</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Developer profiles */}
              <div className="space-y-3.5 pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Social Links (Optional)</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* GitHub */}
                  <div className="relative">
                    <Github className="absolute left-3 top-3 h-4 w-4 text-slate-600" />
                    <input
                      type="url"
                      placeholder="Github Profile"
                      value={formData.githubUrl}
                      onChange={handleGithubChange}
                      className="w-full bg-slate-950/60 border border-slate-800/80 rounded-lg py-2.5 pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-slate-600 transition-all"
                    />
                  </div>

                  {/* LinkedIn */}
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-3 h-4 w-4 text-slate-600" />
                    <input
                      type="url"
                      placeholder="LinkedIn Profile"
                      value={formData.linkedinUrl}
                      onChange={handleLinkedinChange}
                      className="w-full bg-slate-950/60 border border-slate-800/80 rounded-lg py-2.5 pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-slate-600 transition-all"
                    />
                  </div>

                  {/* Portfolio */}
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-600" />
                    <input
                      type="url"
                      placeholder="Portfolio Site"
                      value={formData.portfolioUrl}
                      onChange={handlePortfolioChange}
                      className="w-full bg-slate-950/60 border border-slate-800/80 rounded-lg py-2.5 pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-700 focus:outline-none focus:border-slate-600 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Explicit Cloudflare Turnstile Container */}
              <div className="pt-4 flex flex-col items-center justify-center bg-slate-950/50 rounded-2xl p-4 border border-slate-800/50">
                <label className="text-xs font-semibold text-slate-400 mb-3 block">
                  Completing Cloudflare Turnstile Challenge
                </label>
                <div className="min-h-[65px] flex items-center justify-center">
                  <div ref={turnstileContainerRef} className="mx-auto"></div>
                </div>
              </div>

              {/* Status Banner */}
              {status.type !== "idle" && (
                <div 
                  className={`p-4 rounded-xl border flex gap-3 text-sm transition-all ${
                    status.type === "loading"
                      ? "bg-slate-900 border-slate-800 text-slate-300"
                      : status.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                  }`}
                >
                  {status.type === "loading" && <Cpu className="h-5 w-5 animate-spin text-teal-400 flex-shrink-0" />}
                  {status.type === "success" && <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />}
                  {status.type === "error" && <AlertTriangle className="h-5 w-5 text-rose-400 flex-shrink-0" />}
                  <span className="leading-relaxed">{status.message}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status.type === "loading"}
                className={`w-full py-4 rounded-xl font-bold tracking-wide uppercase transition-all shadow-lg text-sm flex items-center justify-center gap-2 ${
                  status.type === "loading"
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                    : "bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 hover:brightness-110 active:scale-[0.99] cursor-pointer shadow-teal-500/10 hover:shadow-teal-500/20"
                }`}
              >
                {status.type === "loading" ? "Processing..." : "Complete Registration"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
