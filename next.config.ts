import type { NextConfig } from "next";

// Applied to every response. The CSP locks images to our two art CDNs (posters
// render in raw <img>, so this is the real host restriction). 'unsafe-inline'
// for style/script is a pragmatic baseline — the app uses inline style attrs for
// poster gradients and Next injects an inline bootstrap script; can be tightened
// to nonces later.
const CSP = [
  "default-src 'self'",
  "img-src 'self' https://image.tmdb.org https://media.rawg.io https://images.igdb.com data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  images: {
    // Poster/cover art is served from TMDB and RAWG CDNs (cached URLs in D1).
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "media.rawg.io" },
      { protocol: "https", hostname: "images.igdb.com" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;

// Makes getCloudflareContext() (D1 binding, env) available under `next dev`.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
