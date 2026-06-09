/* Trove — platform vocabulary + the logo / ownership-mark system.
   Ported from the prototype's data.js (PLATFORMS) and lib.jsx (SERVICE_LOGO /
   FORMAT_LOGO). The services-vs-physical split is load-bearing: services render
   as square logo tiles (ServiceMark), physical formats as logo pills
   (FormatBadge). Logo asset paths point at /public/logos/*. */

export type PlatformKind = "digital" | "physical" | "tv" | "service";

interface PlatformMeta {
  kind: PlatformKind;
  dot: string;
}

export const PLATFORMS: Record<string, PlatformMeta> = {
  // Movies — digital lockers
  "Apple TV": { kind: "digital", dot: "#9b9ba3" },
  "Movies Anywhere": { kind: "digital", dot: "#4f7df0" },
  "Amazon Video": { kind: "digital", dot: "#3aa0c2" },
  "Fandango at Home": { kind: "digital", dot: "#5b8def" },
  YouTube: { kind: "digital", dot: "#d65a5a" },
  // Movies — physical
  "Blu-Ray": { kind: "physical", dot: "#6f7bf0" },
  "Ultra HD Blu-ray": { kind: "physical", dot: "#4aa3d6" },
  DVD: { kind: "physical", dot: "#8a8a93" },
  // TV
  "Xbox Video": { kind: "tv", dot: "#3aa07a" },
  // Games service
  PlayStation: { kind: "service", dot: "#4f7df0" },
  Xbox: { kind: "service", dot: "#3aa07a" },
  Steam: { kind: "service", dot: "#5a8fd6" },
  Epic: { kind: "service", dot: "#9aa0a6" },
};

export const GAME_SERVICES = ["PlayStation", "Xbox", "Steam", "Epic"];
export const MOVIE_DIGITAL = [
  "Apple TV",
  "Movies Anywhere",
  "Amazon Video",
  "Fandango at Home",
  "YouTube",
];
export const MOVIE_PHYSICAL = ["Ultra HD Blu-ray", "Blu-Ray", "DVD"];
export const TV_PLATFORMS = ["Apple TV", "Amazon Video", "Xbox Video"];

export interface ServiceLogo {
  src: string;
  bg: string;
  pad: number;
  fit?: "cover" | "contain";
  plain?: boolean;
}

// Real, CC-licensed brand logos rendered on brand-colored tiles. `pad` is the
// inner inset as a fraction of tile size; `fit` controls object-fit.
export const SERVICE_LOGO: Record<string, ServiceLogo> = {
  PlayStation: { src: "/logos/playstation.svg", bg: "#0070d1", pad: 0.21 },
  Xbox: { src: "/logos/xbox.svg", bg: "#107c10", pad: 0.18 },
  "Xbox Video": { src: "/logos/xbox.svg", bg: "#107c10", pad: 0.18 },
  Steam: { src: "/logos/steam.svg", bg: "#1b2838", pad: 0.04 },
  Epic: { src: "/logos/epic.svg", bg: "#2f2d2e", pad: 0.05 },
  "Fandango at Home": { src: "/logos/vudu.svg", bg: "#1b50d8", pad: 0.21 },
  "Movies Anywhere": { src: "/logos/movies-anywhere.png", bg: "#0c0c10", pad: 0.12 },
  "Amazon Video": { src: "/logos/prime-video.png", bg: "transparent", pad: 0, fit: "cover" },
  "Apple TV": { src: "/logos/apple-tv.svg", bg: "#000000", pad: 0.09 },
  YouTube: { src: "/logos/youtube.svg", bg: "transparent", pad: 0.06, plain: true },
};

export interface FormatLogo {
  src: string;
  h: number;
  alt: string;
}

// Physical media render as their real format logos inside a "badge" pill.
export const FORMAT_LOGO: Record<string, FormatLogo> = {
  "Blu-Ray": { src: "/logos/bluray-mark.png", h: 19, alt: "Blu-ray Disc" },
  "Ultra HD Blu-ray": { src: "/logos/uhd-bluray.svg", h: 16, alt: "4K Ultra HD Blu-ray" },
  DVD: { src: "/logos/dvd-white.svg", h: 13, alt: "DVD" },
};

export const isPhysical = (name: string): boolean =>
  PLATFORMS[name]?.kind === "physical";

const DIGITAL_ONLY_SVC = ["Steam", "Epic"];
export const isDigitalOnlySvc = (s: string): boolean =>
  DIGITAL_ONLY_SVC.includes(s);
