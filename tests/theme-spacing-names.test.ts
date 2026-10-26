import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Tailwind v4 turns every --spacing-<name> into size utilities (w-<name>, inline-<name>, ...).
// --spacing-block once produced `.inline-block { inline-size: ... }`, which squeezed every
// inline-block element to 24-32px and stacked text one word per line. Keep these names free.
const RESERVED = ["block", "flex", "grid", "table", "inline", "contents", "hidden", "full", "screen", "auto", "min", "max", "fit", "px", "dvh", "svh", "lvh", "dvw", "svw", "lvw"];

describe("theme spacing names", () => {
  it("never collide with display utilities", () => {
    const css = readFileSync("src/app/globals.css", "utf8");
    const names = [...css.matchAll(/--spacing-([a-z0-9-]+)\s*:/g)].map((m) => m[1]);
    expect(names.filter((n) => RESERVED.includes(n) || RESERVED.some((r) => n.startsWith(`${r}-`) && ["block", "flex", "grid", "table"].includes(r)))).toEqual([]);
  });
});
