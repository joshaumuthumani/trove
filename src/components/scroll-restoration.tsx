"use client";
/* Trove — scroll restoration for the custom `.main` scroll container. The app
   scrolls an inner element (`.app` is overflow:hidden), and Next's built-in
   restoration only handles the window — so returning from a detail page would
   drop the list back at the top. We persist each path's scrollTop (per session)
   and restore it before paint when that path is shown again. */
import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const read = (k: string): number => {
  try {
    return parseInt(sessionStorage.getItem(k) || "", 10) || 0;
  } catch {
    return 0;
  }
};
const write = (k: string, v: number) => {
  try {
    sessionStorage.setItem(k, String(v));
  } catch {}
};

export function ScrollRestoration() {
  const pathname = usePathname();
  const raf = useRef(0);

  useIsoLayoutEffect(() => {
    const main = document.querySelector<HTMLElement>(".main");
    if (!main) return;
    const key = `trove-scroll:${pathname}`;

    // Restore (or reset to top for an unseen path) without animating.
    const behavior = main.style.scrollBehavior;
    main.style.scrollBehavior = "auto";
    main.scrollTop = read(key);
    main.style.scrollBehavior = behavior;

    const onScroll = () => {
      if (raf.current) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = 0;
        write(key, main.scrollTop);
      });
    };
    main.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      main.removeEventListener("scroll", onScroll);
      // Cancel any pending save so it can't fire after the content has swapped
      // and clobber this path's stored position with the next page's scrollTop.
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
  }, [pathname]);

  return null;
}
