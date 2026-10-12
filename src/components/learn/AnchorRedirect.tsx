"use client";
import { useEffect } from "react";

/** Old links to renamed or merged lessons (#old-heading) jump to the exact lesson they live in now. */
export function AnchorRedirect({ map }: { map: Record<string, string> }) {
  useEffect(() => {
    const go = () => {
      const hash = decodeURIComponent(window.location.hash.slice(1));
      if (!hash || document.getElementById(hash)) return;
      const to = map[hash];
      if (!to) return;
      const [path, anchor] = to.split("#");
      if (path === window.location.pathname) {
        history.replaceState(null, "", `#${anchor}`);
        document.getElementById(anchor)?.scrollIntoView();
      } else window.location.replace(to);
    };
    go();
    window.addEventListener("hashchange", go);
    return () => window.removeEventListener("hashchange", go);
  }, [map]);
  return null;
}
