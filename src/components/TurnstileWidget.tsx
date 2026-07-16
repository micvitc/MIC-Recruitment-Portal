"use client";

import { useEffect, useRef, useCallback } from "react";

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
 * It lazy-loads the Turnstile script once and renders the widget
 * in its container ref. Cleans up on unmount.
 *
 * Usage:
 *   const [token, setToken] = useState("");
 *   <TurnstileWidget onSuccess={setToken} onExpire={() => setToken("")} />
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
  const siteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "1x00000000000000000000AA";

  const renderWidget = useCallback(() => {
    if (!window.turnstile || !containerRef.current) return;
    // Avoid double-rendering
    if (widgetIdRef.current) return;
    try {
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme,
        size,
        callback: (token: string) => onSuccess(token),
        "error-callback": () => {
          onError?.();
        },
        "expired-callback": () => {
          onExpire?.();
        },
      });
    } catch (err) {
      console.error("[Turnstile] render error:", err);
    }
  }, [siteKey, theme, size, onSuccess, onError, onExpire]);

  useEffect(() => {
    // If the script is already present and Turnstile is ready, render immediately
    if (window.turnstile) {
      renderWidget();
      return;
    }

    // Inject the script once across the whole page
    if (!document.getElementById(TURNSTILE_SCRIPT_ID)) {
      const script = document.createElement("script");
      script.id = TURNSTILE_SCRIPT_ID;
      // render=explicit lets us call window.turnstile.render() ourselves
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    // The global callback Cloudflare invokes once the script has parsed
    window.onTurnstileLoad = () => {
      renderWidget();
    };

    return () => {
      // Cleanup: remove the widget when the component unmounts
      if (window.turnstile && widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (_) {
          // widget may have already been cleaned up
        }
        widgetIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} className={className} />;
}
