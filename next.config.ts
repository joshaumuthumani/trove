import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Poster/cover art is served from TMDB and RAWG CDNs (cached URLs in D1).
    remotePatterns: [
      { protocol: "https", hostname: "image.tmdb.org" },
      { protocol: "https", hostname: "media.rawg.io" },
    ],
  },
};

export default nextConfig;

// Makes getCloudflareContext() (D1 binding, env) available under `next dev`.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
