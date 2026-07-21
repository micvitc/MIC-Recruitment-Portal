import type { NextConfig } from "next";

const ContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://*.posthog.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  // Google user profile pictures + Turnstile challenge static assets
  "img-src 'self' data: blob: https://lh3.googleusercontent.com https://challenges.cloudflare.com",
  // Turnstile challenge iframe is served from challenges.cloudflare.com
  "frame-src 'self' https://challenges.cloudflare.com",
  "connect-src 'self' https://challenges.cloudflare.com https://*.posthog.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");


const securityHeaders = [
  // Prevent DNS prefetch leaking origins
  { key: "X-DNS-Prefetch-Control", value: "on" },

  // Enforce HTTPS for 2 years, include subdomains, submit to preload list
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },

  // Stop browsers from MIME-sniffing the content-type
  { key: "X-Content-Type-Options", value: "nosniff" },

  // Prevent clickjacking
  { key: "X-Frame-Options", value: "SAMEORIGIN" },

  // Limit referrer to origin only when crossing origins
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

  // Disable browser features we don't need
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },

  // Content Security Policy
  { key: "Content-Security-Policy", value: ContentSecurityPolicy },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["@arcjet/next"],
  async headers() {
    return [
      {
        // Apply to every route
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
