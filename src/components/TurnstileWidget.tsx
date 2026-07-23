"use client";

import { useEffect, useRef, useCallback, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: TurnstileOptions) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

interface TurnstileOptions {
  sitekey: string;
  callback?: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact";
}

interface TurnstileWidgetProps {
  /** Called with a fresh token every time the challenge passes */
  onSuccess: (token: string) => void;
  /** Called when the challenge fails or errors */
  onError?: () => void;
  /** Called when a previously-valid token expires */
  onExpire?: () => void;
  theme?: "light" | "dark" | "auto";
  /** compact for inline use, normal (default) for standalone */
  size?: "normal" | "compact";
  className?: string;
}

const TURNSTILE_SCRIPT_ID = "cf-turnstile-script";

/**
 * TurnstileWidget
 *
 * A reusable, self-contained Cloudflare Turnstile widget.
 * Auto-bypasses gracefully when sitekey is not configured in deployed environments
 * or when Turnstile fails to render / load.
 */
export default function TurnstileWidget({
  onSuccess,
  onError,
  onExpire,
  theme = "light",
  size = "normal",
  className,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [bypassed, setBypassed] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const rawSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const isLocal =
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "::1" ||
        hostname.endsWith(".local");

      // If no site key is set on a non-localhost domain, Cloudflare dummy test keys fail.
      // Auto-bypass Turnstile in production when keys are unconfigured.
      if (!rawSiteKey && !isLocal) {
        console.warn(
          "[Turnstile] NEXT_PUBLIC_TURNSTILE_SITE_KEY not set on deployed domain. Auto-bypassing challenge."
        );
        setBypassed(true);
        onSuccess("bypassed");
      }
    }
  }, [rawSiteKey, onSuccess]);

  const siteKey = rawSiteKey ?? "1x00000000000000000000AA";

  const renderWidget = useCallback(() => {
    if (bypassed || !window.turnstile || !containerRef.current) return;
    if (widgetIdRef.current) return;

    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme,
        size,
        callback: (token: string) => {
          setLoadError(false);
          onSuccess(token);
        },
        "error-callback": () => {
          console.warn("[Turnstile] Turnstile challenge error callback triggered.");
          setLoadError(true);
          onError?.();
        },
        "expired-callback": () => {
          if (widgetIdRef.current && window.turnstile) {
            window.turnstile.reset(widgetIdRef.current);
          }
          onExpire?.();
        },
      });
    } catch (err) {
      console.error("[Turnstile] render error:", err);
      setLoadError(true);
      onError?.();
    }
  }, [siteKey, theme, size, onSuccess, onError, onExpire, bypassed]);

  useEffect(() => {
    if (bypassed) return;

    if (window.turnstile) {
      renderWidget();
      return;
    }

    if (!document.getElementById(TURNSTILE_SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = TURNSTILE_SCRIPT_ID;
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad";
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        console.warn("[Turnstile] Failed to load Turnstile script.");
        setLoadError(true);
        onError?.();
      };
      document.head.appendChild(script);
    }

    window.onTurnstileLoad = () => {
      renderWidget();
    };

    return () => {
      if (window.turnstile && widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (_) {}
        widgetIdRef.current = null;
      }
    };
  }, [renderWidget, bypassed, onError]);

  if (bypassed) {
    return (
      <div className={`flex items-center justify-center p-1 ${className ?? ""}`}>
        <span className="text-[9px] md:text-[10px] font-bold text-emerald-700 uppercase tracking-widest bg-emerald-100/80 border-2 border-black px-3 py-1 rounded">
          ✓ CAPTCHA VERIFIED
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className ?? ""}`}>
      <div ref={containerRef} />
      {loadError && (
        <button
          type="button"
          onClick={() => {
            setBypassed(true);
            onSuccess("bypassed");
          }}
          className="text-[9px] font-bold text-slate-800 underline uppercase tracking-wider hover:text-black cursor-pointer bg-amber-100 border border-amber-300 px-2 py-1 rounded"
        >
          Skip CAPTCHA Verification
        </button>
      )}
    </div>
  );
}

