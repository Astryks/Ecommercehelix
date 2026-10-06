import "server-only";
import fs from "node:fs";
import path from "node:path";
import { Marked } from "marked";
import { STAGE_INFO, stageOfLesson, stageOfModule, type StageId } from "./stages";
import { glossify, termsIn } from "./glossary";
import { parseModuleSections, type ParsedLesson } from "./lesson-parse";
import { lessonAction, type LessonAction } from "./lesson-actions";

const DIR = path.join(process.cwd(), "docs", "playbook");
const REPO = "https://github.com/Astryks/Ecommercehelix/blob/main/docs";

export function slugify(text: string) {
  return text.toLowerCase().trim().replace(/<[^>]+>/g, "").replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s/g, "-");
}

export type Lesson = { id: string; title: string; ref: string | null; stage: StageId };
export type Module = { slug: string; number: number; title: string; outcome: string; plain: string; stage: StageId; lessons: Lesson[]; steps: number };

export function listModules(): Module[] {
  return fs
    .readdirSync(DIR)
    .filter((f) => /^\d\d-.*\.md$/.test(f))
    .sort()
    .map((f) => {
      const md = fs.readFileSync(path.join(DIR, f), "utf8");
      const title = (md.match(/^# (.+)$/m)?.[1] ?? f).replace(/^Module \d+:\s*/, "");
      const outcome = md.match(/\*\*Outcome:\*\*\s*(.+)/)?.[1] ?? "";
      const plain = md.match(/\*\*What it is:\*\*\s*(.+)/)?.[1] ?? outcome;
      const number = Number(f.slice(0, 2));
      const lessons = [...md.matchAll(/^## (.+)$/gm)].map((m): Lesson => {
        const ref = m[1].match(/^Lesson (\d+\.\d+):/)?.[1] ?? null;
        return { id: slugify(m[1]), title: m[1], ref, stage: ref ? stageOfLesson(ref) : stageOfModule(number) };
      });
      return { slug: f.replace(/\.md$/, ""), number, title, outcome, plain, stage: stageOfModule(number), lessons, steps: (md.match(/^\*\*Step \d+\.\*\*/gm) ?? []).length };
    });
}

function makeMarked() {
  return new Marked({
    gfm: true,
    renderer: {
      heading({ tokens, depth, text }) {
        const inner = this.parser.parseInline(tokens);
        const id = slugify(text);
        const ref = depth === 2 ? text.match(/^Lesson (\d+\.\d+):/)?.[1] : undefined;
        const st = ref ? STAGE_INFO[stageOfLesson(ref)] : null;
        const chip = st ? ` <span class="stage-chip not-prose ml-2 inline-flex translate-y-[-3px] items-center rounded-full px-2.5 py-0.5 align-middle font-sans text-[11px] font-semibold uppercase tracking-wide ring-1 ${st.chip}">${st.name}</span>` : "";
        return `<h${depth} id="${id}"><a href="#${id}" class="no-underline">${inner}</a>${chip}</h${depth}>\n`;
      },
      link({ href, tokens }) {
        const inner = this.parser.parseInline(tokens);
        const url = linkUrl(href);
        const ext = /^https?:/.test(url) && !url.startsWith("/");
        return `<a href="${url}"${ext ? ' target="_blank" rel="noreferrer"' : ""}>${inner}</a>`;
      },
      image({ href, text }) {
        const src = href.replace(/^(\.\.\/)+public\/guides\//, "/guides/");
        if (!/^\/guides\/[a-z0-9-]+\.svg$/.test(src)) return "";
        const alt = text.replace(/"/g, "&quot;");
        return `<a href="${src}" target="_blank" rel="noreferrer" class="guide"><img src="${src}" alt="${alt}" loading="lazy" width="1200" height="700" /></a>`;
      },
    },
  });
}

function linkUrl(href: string) {
  const local = href.match(/^(\d\d-[a-z0-9-]+)\.md(#.*)?$/);
  if (local) return `/learn/${local[1]}${local[2] ?? ""}`;
  if (/^\.\.\/glossary\.md(#.*)?$/.test(href)) return "/learn/words";
  if (/^stages\.md(#.*)?$/.test(href)) return "/learn#framework-h";
  if (href.startsWith("../")) return `${REPO}/${href.replace(/^\.\.\//, "")}`;
  return href;
}

function readModule(slug: string): string | null {
  if (!/^\d\d-[a-z0-9-]+$/.test(slug)) return null;
  const file = path.join(DIR, slug + ".md");
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, "utf8");
}

const plainText = (md: string) => md.replace(/<!--[\s\S]*?-->/g, "").replace(/\]\([^)]*\)/g, "]").replace(/[*_`>#|[\]]/g, "");

export function renderModule(slug: string): { html: string; title: string; text: string } | null {
  const md = readModule(slug);
  if (md === null) return null;
  const title = (md.match(/^# (.+)$/m)?.[1] ?? slug).replace(/^Module \d+:\s*/, "");
  const html = makeMarked().parse(md.replace(/^# .+$/m, ""), { async: false }) as string;
  const text = md.replace(/<!--[\s\S]*?-->/g, "").replace(/\(([^)]*)\)/g, " ");
  return { html, title, text };
}

// ---------- step-format lessons ----------
export type StepView = {
  n: number;
  html: string;
  expectedHtml: string;
  watchOutHtml: string | null;
  action: LessonAction | null;
  terms: { term: string; means: string }[];
  links: { href: string; label: string }[];
  meta: boolean;
};
export type LessonView = {
  ref: string;
  id: string;
  heading: string;
  title: string;
  stage: { id: StageId; name: string; chip: string };
  whyHtml: string;
  noticeHtml: string | null;
  doIt: LessonAction;
  steps: StepView[];
  extraHtml: string;
  hasDrawing: boolean;
};
export type PageSection = { kind: "html"; html: string } | { kind: "lesson"; lesson: LessonView };

function linksIn(md: string) {
  return [...md.matchAll(/\[([^\]]+)\]\(([^)\s]+)\)/g)].map((m) => ({ label: m[1], href: linkUrl(m[2]) }));
}

function toView(l: ParsedLesson, marked: Marked): LessonView {
  const seen = new Set<string>();
  const md = (s: string) => glossify(marked.parse(s, { async: false }) as string, seen);
  const stage = stageOfLesson(l.ref);
  const extraHtml = l.extra ? (marked.parse(l.extra, { async: false }) as string) : "";
  return {
    ref: l.ref,
    id: slugify(l.heading),
    heading: l.heading,
    title: l.title,
    stage: { id: stage, name: STAGE_INFO[stage].name, chip: STAGE_INFO[stage].chip },
    noticeHtml: l.notice ? (marked.parse(l.notice, { async: false }) as string) : null,
    whyHtml: md(l.why),
    doIt: lessonAction(l.doIt),
    steps: l.steps.map((s) => {
      const all = `${s.instruction} ${s.expected} ${s.watchOut ?? ""}`;
      return {
        n: s.n,
        html: md(s.instruction),
        expectedHtml: md(s.expected),
        watchOutHtml: s.watchOut ? md(s.watchOut) : null,
        action: s.action ? lessonAction(s.action) : null,
        terms: termsIn(plainText(all), 6).map((t) => ({ term: t.term, means: t.means })),
        links: linksIn(all),
        meta: /\b(Meta|Ads Manager|Facebook|Instagram|ad set|campaign)\b/i.test(all) || Boolean(s.action?.startsWith("meta")),
      };
    }),
    extraHtml,
    hasDrawing: extraHtml.includes('class="guide"'),
  };
}

/** A module split into plain sections and structured step lessons, for /learn/[slug]. */
export function renderLessonPage(slug: string): { title: string; sections: PageSection[]; text: string; lessonCount: number; stepCount: number } | null {
  const md = readModule(slug);
  if (md === null) return null;
  const marked = makeMarked();
  const title = (md.match(/^# (.+)$/m)?.[1] ?? slug).replace(/^Module \d+:\s*/, "");
  const sections: PageSection[] = parseModuleSections(md).map((s) =>
    s.kind === "lesson" ? { kind: "lesson", lesson: toView(s, marked) } : { kind: "html", html: marked.parse(s.md, { async: false }) as string },
  );
  const lessons = sections.flatMap((s) => (s.kind === "lesson" ? [s.lesson] : []));
  const text = md.replace(/<!--[\s\S]*?-->/g, "").replace(/\(([^)]*)\)/g, " ");
  return { title, sections, text, lessonCount: lessons.length, stepCount: lessons.reduce((n, l) => n + l.steps.length, 0) };
}

/** Find one lesson (and optionally a step) by ref, for "Do it for me" requests. */
export function findLesson(ref: string): (ParsedLesson & { slug: string }) | null {
  const n = Number(ref.split(".")[0]);
  const file = fs.readdirSync(DIR).find((f) => f.startsWith(String(n).padStart(2, "0") + "-") && f.endsWith(".md"));
  if (!file) return null;
  const md = fs.readFileSync(path.join(DIR, file), "utf8");
  const l = parseModuleSections(md).find((s): s is ParsedLesson => s.kind === "lesson" && s.ref === ref);
  return l ? { ...l, slug: file.replace(/\.md$/, "") } : null;
}

/** Plain text of a lesson step for approval details (no markdown). */
export const plain = plainText;
