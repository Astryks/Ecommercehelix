import "server-only";
import fs from "node:fs";
import path from "node:path";
import { Marked } from "marked";

const DIR = path.join(process.cwd(), "docs", "playbook");
const REPO = "https://github.com/Astryks/Ecommercehelix/blob/main/docs";

export function slugify(text: string) {
  return text.toLowerCase().trim().replace(/<[^>]+>/g, "").replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s/g, "-");
}

export type Module = { slug: string; number: number; title: string; outcome: string; lessons: { id: string; title: string }[] };

export function listModules(): Module[] {
  return fs
    .readdirSync(DIR)
    .filter((f) => /^\d\d-.*\.md$/.test(f))
    .sort()
    .map((f) => {
      const md = fs.readFileSync(path.join(DIR, f), "utf8");
      const title = (md.match(/^# (.+)$/m)?.[1] ?? f).replace(/^Module \d+:\s*/, "");
      const outcome = md.match(/\*\*Outcome:\*\*\s*(.+)/)?.[1] ?? "";
      const lessons = [...md.matchAll(/^## (.+)$/gm)].map((m) => ({ id: slugify(m[1]), title: m[1] }));
      return { slug: f.replace(/\.md$/, ""), number: Number(f.slice(0, 2)), title, outcome, lessons };
    });
}

export function renderModule(slug: string): { html: string; title: string } | null {
  if (!/^\d\d-[a-z0-9-]+$/.test(slug)) return null;
  const file = path.join(DIR, slug + ".md");
  if (!fs.existsSync(file)) return null;
  const md = fs.readFileSync(file, "utf8");
  const title = (md.match(/^# (.+)$/m)?.[1] ?? slug).replace(/^Module \d+:\s*/, "");
  const marked = new Marked({
    gfm: true,
    renderer: {
      heading({ tokens, depth, text }) {
        const inner = this.parser.parseInline(tokens);
        const id = slugify(text);
        return `<h${depth} id="${id}"><a href="#${id}" class="no-underline">${inner}</a></h${depth}>\n`;
      },
      link({ href, tokens }) {
        const inner = this.parser.parseInline(tokens);
        let url = href;
        const local = href.match(/^(\d\d-[a-z0-9-]+)\.md(#.*)?$/);
        if (local) url = `/learn/${local[1]}${local[2] ?? ""}`;
        else if (href.startsWith("../")) url = `${REPO}/${href.replace(/^\.\.\//, "")}`;
        const ext = /^https?:/.test(url) && !url.startsWith("/");
        return `<a href="${url}"${ext ? ' target="_blank" rel="noreferrer"' : ""}>${inner}</a>`;
      },
    },
  });
  const html = marked.parse(md.replace(/^# .+$/m, ""), { async: false }) as string;
  return { html, title };
}
