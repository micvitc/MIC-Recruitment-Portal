import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import type { NextAuthRequest } from "next-auth";
import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/next";

const { auth } = NextAuth(authConfig);

// ---------------------------------------------------------------------------
// Arcjet configuration
//
// WHY token bucket instead of sliding window?
// ─────────────────────────────────────────────
// This portal runs at VIT where hundreds of students share the same campus
// WiFi / NAT IP. A flat per-IP sliding window (e.g. 100 req/min) would block
// an entire hostel block the moment one student submits their form.
//
// A token bucket lets us:
//   1. Set a large capacity (1000 tokens) — generous for shared NAT IPs
//   2. Refill at a controlled rate (20 tokens / 5 s = 240/min) — enough for
//      legitimate concurrent users, too slow for bots hammering the API
//   3. Charge different "costs" per endpoint:
//        - Normal GET reads    →  1 token   (essentially free)
//        - Form submissions    →  10 tokens  (50× harder to spam)
//        - Turnstile verify    →  5 tokens
//      A single IP would need to submit 100 forms in 5 minutes to be
//      limited — impossible for a legitimate student, easy to detect for bots.
//
// ARCJET FREE TIER NOTE:
// ─────────────────────
// Arcjet bills per "decision" (one decision = one .protect() call).
// To conserve decisions, Arcjet is only invoked for /api/* routes.
// Page routes (/apply, /admin, /login) are protected by NextAuth anyway.
// Estimated decisions for 3 000 submissions ≈ 60 000–80 000 / month,
// which fits comfortably within Arcjet's free tier (check app.arcjet.com).
//
// Set ARCJET_KEY in .env.local — free key at https://app.arcjet.com
// If not set, Arcjet is skipped — auth/routing guards still apply.
// ---------------------------------------------------------------------------

const ARCJET_KEY = process.env.ARCJET_KEY;

let aj: ReturnType<typeof arcjet> | null = null;

if (ARCJET_KEY) {
  aj = arcjet({
    key: ARCJET_KEY,
    characteristics: ["ip.src"],
    rules: [
      // ── WAF: blocks SQLi, XSS, SSRF, path traversal ─────────────────────
      shield({ mode: "LIVE" }),

      // ── Bot detection ────────────────────────────────────────────────────
      // Blocks: headless browsers (Puppeteer/Playwright), scrapers, curl bots
      // Allows: search engines, uptime monitors, link previews
      detectBot({
        mode: "LIVE",
        allow: [
          "CATEGORY:SEARCH_ENGINE",
          "CATEGORY:MONITOR",
          "CATEGORY:PREVIEW",
        ],
      }),

      // ── Token bucket rate limiter ────────────────────────────────────────
      // capacity : 1000 tokens per IP  (large pool for shared campus NAT)
      // refillRate: 20 tokens every 5 s  (= 240 tokens/min sustained)
      //
      // Token cost per request type (set via the `requested` param below):
      //   GET  (status, stage fetch)        →  1 token
      //   POST turnstile verify             →  5 tokens
      //   POST form submit / apply/init     →  10 tokens
      //   PATCH admin advance/reject        →  5 tokens
      //
      // A genuine student submitting 2–3 stages spends ~20–30 tokens total
      // and is never rate-limited. A bot firing 1 000 submissions/min hits
      // the limit after 100 requests (1000 ÷ 10).
      tokenBucket({
        mode: "LIVE",
        capacity: 1000,
        refillRate: 20,
        interval: "5s",
      }),
    ],
  });
} else {
  console.warn(
    "[Arcjet] ARCJET_KEY not set — WAF / bot / rate-limit protection DISABLED.\n" +
    "         Get a free key at https://app.arcjet.com and add it to .env.local"
  );
}

// ---------------------------------------------------------------------------
// Token cost helpers
// The `requested` field tells Arcjet how many tokens this request consumes.
// ---------------------------------------------------------------------------
function getTokenCost(method: string, pathname: string): number {
  // Form submissions & apply init — most expensive (hardest to abuse)
  if (
    method === "POST" &&
    (pathname.startsWith("/api/apply") || pathname === "/api/apply/init")
  ) {
    return 10;
  }

  // Admin write operations
  if (
    (method === "POST" || method === "PATCH" || method === "PUT") &&
    pathname.startsWith("/api/admin")
  ) {
    return 5;
  }

  // Turnstile verification
  if (pathname.startsWith("/api/turnstile")) {
    return 5;
  }

  // Everything else (GET requests, status checks, etc.)
  return 1;
}

// ---------------------------------------------------------------------------
// Route matchers
// ---------------------------------------------------------------------------
function isApplyRoute(pathname: string) {
  return pathname.startsWith("/apply");
}

function isAdminRoute(pathname: string) {
  return pathname.startsWith("/admin");
}

/**
 * We only run Arcjet on state-changing API requests (POST/PUT/PATCH/DELETE)
 * or public verification endpoints to:
 *  1. Drastically reduce Arcjet API calls (conserves quota and keeps page load fast)
 *  2. Keep GET requests (which only read data) completely unthrottled
 */
function shouldRunArcjet(method: string, pathname: string) {
  if (!pathname.startsWith("/api/")) return false;
  
  // Public Turnstile verification must always be protected
  if (pathname.startsWith("/api/turnstile")) return true;
  
  // Only protect state-changing requests (submits, edits, admin actions)
  return method !== "GET";
}

function isApiAdminRoute(pathname: string) {
  return pathname.startsWith("/api/admin");
}

// ---------------------------------------------------------------------------
// Main middleware — NextAuth v5 pattern
// ---------------------------------------------------------------------------
export default auth(async (req: NextAuthRequest) => {
  const { pathname } = req.nextUrl;
  const method = req.method ?? "GET";
  const session = req.auth;
  const userEmail = session?.user?.email ?? "";
  const userRole = (session?.user as { role?: string } | undefined)?.role ?? "";

  // ── Arcjet (State-changing API routes only — reduces free-tier usage) ────
  if (aj && shouldRunArcjet(method, pathname)) {
    try {
      const cost = getTokenCost(method, pathname);
      const decision = await aj.protect(req as unknown as Request, {
        requested: cost,
      } as unknown as { correlationId?: string; requested?: number });

      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          return NextResponse.json(
            {
              success: false,
              error: "Too many requests. Please slow down and try again.",
            },
            {
              status: 429,
              headers: { "Retry-After": "5" },
            }
          );
        }
        if (decision.reason.isBot()) {
          return NextResponse.json(
            { success: false, error: "Automated requests are not permitted." },
            { status: 403 }
          );
        }
        // Shield (WAF) — attack pattern detected
        return NextResponse.json(
          { success: false, error: "Request blocked." },
          { status: 403 }
        );
      }
    } catch (err) {
      // Fail open — log the error but let the request through.
      // The auth/routing guards below still protect every route.
      console.error("[Arcjet] Decision error:", err);
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  // --- Protect candidate routes (/recruitments, /profile, /apply/*) ---
  const isCandidateRoute = pathname === "/recruitments" || pathname === "/profile" || pathname.startsWith("/apply");
  if (isCandidateRoute) {
    if (!session?.user) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set(
        "callbackUrl",
        req.nextUrl.pathname + req.nextUrl.search
      );
      return NextResponse.redirect(url);
    }
    if (!userEmail.endsWith("@vitstudent.ac.in")) {
      const url = req.nextUrl.clone();
      url.pathname = "/auth/error";
      url.searchParams.set("error", "AccessDenied");
      return NextResponse.redirect(url);
    }
  }

  // --- /login route logic ---
  if (pathname === "/login") {
    if (session?.user) {
      const url = req.nextUrl.clone();
      url.pathname = "/recruitments";
      return NextResponse.redirect(url);
    }
  }

  // --- Protect /admin/* pages ---
  if (isAdminRoute(pathname) && pathname !== "/admin/login") {
    if (!session?.user) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
    if (userRole !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("error", "AccessDenied");
      return NextResponse.redirect(url);
    }
  }

  // --- Protect /api/admin/* routes ---
  if (isApiAdminRoute(pathname)) {
    if (!session?.user || userRole !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized." },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/recruitments",
    "/profile",
    "/apply/:path*",
    "/login",
    "/admin/:path*",
    "/api/apply/:path*",
    "/api/admin/:path*",
    "/api/turnstile/:path*",
  ],
};
