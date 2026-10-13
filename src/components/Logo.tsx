import { INK_A, INK_B, PUR_A, PUR_B, RUNGS } from "./logo-paths";

type Props = { size?: number; className?: string; title?: string; dark?: boolean };

/** E-commerce Helix mark: a sketchy double helix rising to the right, one purple strand and one ink strand. */
export function HelixMark({ size = 36, className, title = "E-commerce Helix", dark = false }: Props) {
  const ink = dark ? "#F2F1EC" : "#1A1718";
  const purple = dark ? "#B0ABEF" : "#5A50D6";
  return (
    <svg viewBox="0 0 512 512" width={size} height={size} className={className} role="img" aria-label={title || undefined} aria-hidden={title ? undefined : true}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={RUNGS} stroke={ink} strokeWidth="9" opacity="0.85" />
        <path d={INK_A} stroke={ink} strokeWidth="26" />
        <path d={INK_B} stroke={ink} strokeWidth="7" opacity="0.6" />
        <path d={PUR_A} stroke={purple} strokeWidth="30" />
        <path d={PUR_B} stroke={purple} strokeWidth="8" opacity="0.55" />
      </g>
    </svg>
  );
}

/** Lockup: mark + "E-commerce Helix" wordmark in marker lettering, "Helix" in purple. */
export function Logo({ size = 34, dark = false }: { size?: number; dark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <HelixMark size={size} dark={dark} />
      <span className={`font-display text-[1.3rem] leading-none ${dark ? "text-white" : "text-[#1A1718]"}`}>
        E-commerce <span className={dark ? "text-[#B0ABEF]" : "text-[#5A50D6]"}>Helix</span>
      </span>
    </span>
  );
}
