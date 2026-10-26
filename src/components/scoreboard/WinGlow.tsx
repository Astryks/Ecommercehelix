"use client";
import { useEffect, useState } from "react";

/** A small, calm win moment: the badge pops once and a few dots drift up. Honors reduced motion. */
export function WinGlow({ children, win }: { children: React.ReactNode; win: boolean }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!win || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setOn(true), 150);
    return () => clearTimeout(t);
  }, [win]);
  return (
    <span className="relative inline-flex">
      <style>{`@keyframes hxPop{0%{transform:scale(.85)}60%{transform:scale(1.08)}100%{transform:scale(1)}}@keyframes hxRise{0%{opacity:0;transform:translateY(0)}30%{opacity:1}100%{opacity:0;transform:translateY(-28px)}}`}</style>
      <span style={on ? { animation: "hxPop .6s ease-out" } : undefined} className="inline-flex">{children}</span>
      {on && [0, 1, 2, 3, 4].map((i) => (
        <span key={i} aria-hidden className="pointer-events-none absolute h-1.5 w-1.5 rounded-full" style={{ left: `${15 + i * 17}%`, top: "10%", background: i % 2 ? "#448b6f" : "#5A50D6", animation: `hxRise 1.4s ease-out ${i * 0.12}s both` }} />
      ))}
    </span>
  );
}
