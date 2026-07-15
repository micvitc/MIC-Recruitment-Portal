"use client";

import React, { useState, useEffect, useRef } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Github,
  Linkedin,
  Globe,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Info,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

export default function RegistrationPage() {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Frontend Developer",
    githubUrl: "",
    linkedinUrl: "",
    portfolioUrl: "",
  });

  const [captchaType, setCaptchaType] = useState<"turnstile" | "hcaptcha">("turnstile");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });

  const [captchaLogs, setCaptchaLogs] = useState<string[]>([]);
  const hcaptchaRef = useRef<HCaptcha>(null);
  const turnstileRef = useRef<any>(null);

  // Client hydration check
  useEffect(() => {
    setMounted(true);
    addLog("Application mounted. Ready to load bot protection widgets.");
  }, []);

  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString();
    setCaptchaLogs((prev) => [`[${time}] ${message}`, ...prev.slice(0, 8)]);
  };

  // Reset captcha when switching type
  useEffect(() => {
    setCaptchaToken(null);
    setStatus({ type: "idle", message: "" });
    addLog(`Switched verification type to ${captchaType === "turnstile" ? "Cloudflare Turnstile" : "hCaptcha"}`);

    if (captchaType === "hcaptcha" && hcaptchaRef.current) {
      try {
        hcaptchaRef.current.resetCaptcha();
      } catch (err) {
        console.error("hCaptcha reset error:", err);
      }
    }
  }, [captchaType]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, name: value }));
  };

  // Dedicated input-specific onChange helpers to avoid casting issues in TypeScript
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
      setStatus({ type: "error", message: "Please complete the bot verification first." });
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
          captchaType,
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
          role: "Frontend Developer",
          githubUrl: "",
          linkedinUrl: "",
          portfolioUrl: "",
        });
        setCaptchaToken(null);
        // Reset Captchas
        if (captchaType === "hcaptcha" && hcaptchaRef.current) {
          hcaptchaRef.current.resetCaptcha();
        }
      } else {
        setStatus({
          type: "error",
          message: data.error || "Security verification failed. Please try again.",
        });
        addLog(`API rejected submission: ${data.error}`);
        // Reset Captchas on failure
        setCaptchaToken(null);
        if (captchaType === "hcaptcha" && hcaptchaRef.current) {
          hcaptchaRef.current.resetCaptcha();
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

  const handleTurnstileSuccess = (token: string) => {
    setCaptchaToken(token);
    addLog("Turnstile verification passed. Token received.");
  };

  const handleTurnstileError = () => {
    setCaptchaToken(null);
    addLog("Turnstile verification failed.");
  };

  const handleTurnstileExpire = () => {
    setCaptchaToken(null);
    addLog("Turnstile token expired.");
  };

  const handleHcaptchaVerify = (token: string) => {
    setCaptchaToken(token);
    addLog("hCaptcha verification passed. Token received.");
  };

  const handleHcaptchaError = (err: any) => {
    setCaptchaToken(null);
    addLog(`hCaptcha error: ${JSON.stringify(err)}`);
  };

  const handleHcaptchaExpire = () => {
    setCaptchaToken(null);
    addLog("hCaptcha token expired.");
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

  // Use standard test keys if not configured in env
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";
  const hcaptchaSiteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || "10000000-ffff-ffff-ffff-ffffffffffff";

  const isUsingTestKey =
    (captchaType === "turnstile" && turnstileSiteKey === "1x00000000000000000000AA") ||
    (captchaType === "hcaptcha" && hcaptchaSiteKey === "10000000-ffff-ffff-ffff-ffffffffffff");

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
            Advanced <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">Bot Shield</span> Demonstration
          </h1>

          <p className="text-slate-400 text-base leading-relaxed">
            This recruitment portal showcases premium security defense integrations. 
            Compare the user-friction levels of Cloudflare's invisible Turnstile versus standard interactive hCaptcha challenges, and submit applicant records straight to MongoDB.
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
                  <span className="text-white font-medium">hCaptcha:</span> 
                  Requires manual human classification of images. Effective at catching advanced bots but degrades conversion rates.
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
            
            {/* Security Type Toggle Tab Selector */}
            <div className="mb-8">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Select Bot Protection Provider
              </label>
              <div className="grid grid-cols-2 p-1.5 bg-slate-950/80 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setCaptchaType("turnstile")}
                  className={`py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                    captchaType === "turnstile"
                      ? "bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-400 border border-teal-500/30 shadow-md"
                      : "text-slate-400 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  <ShieldCheck className="h-4.5 w-4.5" />
                  CF Turnstile
                </button>
                <button
                  type="button"
                  onClick={() => setCaptchaType("hcaptcha")}
                  className={`py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                    captchaType === "hcaptcha"
                      ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30 shadow-md"
                      : "text-slate-400 hover:text-slate-200 border border-transparent"
                  }`}
                >
                  <ShieldAlert className="h-4.5 w-4.5" />
                  hCaptcha
                </button>
              </div>
            </div>

            {/* Warning when using fallback test keys */}
            {isUsingTestKey && (
              <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs flex gap-3">
                <AlertTriangle className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-blue-100">Running with Test Credentials:</span> No environment variables were detected for {captchaType === "turnstile" ? "Turnstile" : "hCaptcha"} in <code className="px-1 py-0.5 bg-slate-950 rounded border border-white/5 font-mono">.env.local</code>. Scaffolding is currently operating with Cloudflare/hCaptcha public test keys for developer preview.
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

              {/* Active Captcha Rendering */}
              <div className="pt-4 flex flex-col items-center justify-center bg-slate-950/50 rounded-2xl p-4 border border-slate-800/50">
                <label className="text-xs font-semibold text-slate-400 mb-3 block">
                  Completing {captchaType === "turnstile" ? "Cloudflare Turnstile Challenge" : "hCaptcha Challenge"}
                </label>
                
                {captchaType === "turnstile" ? (
                  <div className="min-h-[65px] flex items-center justify-center">
                    <Turnstile
                      ref={turnstileRef}
                      siteKey={turnstileSiteKey}
                      onSuccess={handleTurnstileSuccess}
                      onError={handleTurnstileError}
                      onExpire={handleTurnstileExpire}
                      className="mx-auto"
                    />
                  </div>
                ) : (
                  <div className="min-h-[78px] flex items-center justify-center">
                    <HCaptcha
                      ref={hcaptchaRef}
                      sitekey={hcaptchaSiteKey}
                      onVerify={handleHcaptchaVerify}
                      onError={handleHcaptchaError}
                      onExpire={handleHcaptchaExpire}
                      theme="dark"
                    />
                  </div>
                )}
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
                    : captchaType === "turnstile"
                    ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 hover:brightness-110 active:scale-[0.99] cursor-pointer shadow-teal-500/10 hover:shadow-teal-500/20"
                    : "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:brightness-110 active:scale-[0.99] cursor-pointer shadow-amber-500/10 hover:shadow-amber-500/20"
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
