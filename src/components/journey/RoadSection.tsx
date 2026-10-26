import Link from "next/link";
import { Flame, Lock, Map as MapIcon, Star, Trophy } from "lucide-react";
import { ESTIMATE_NOTE, MILESTONES, FREE_LEVELS } from "@/lib/journey";
import type { MilestoneView } from "@/lib/journey-view";
import { UNLOCK_LABEL } from "@/lib/paywall/access";
import { RoadMap } from "./RoadMap";
import { LevelDeep, SourceLinks } from "./LevelDeep";
import { BOOTSTRAP_NOTE, BRAND_LESSONS, CHANGE_ASSUMPTIONS, SATURATION, SPEND_FORMULA } from "@/lib/journey-content";

type Props = {
  views: MilestoneView[];
  level: number;
  source: "numbers" | "self" | "none";
  progress: number | null;
  last30: number;
  xp: number;
  streak: number;
  badges: { key: string; title: string; note: string }[];
  selfLevel: number | null;
  paid: boolean;
  pick: (f: FormData) => Promise<void>;
};

const money = (n: number) => "$" + Math.round(n).toLocaleString("en-AU");

export function RoadSection({ views, level, source, progress, last30, xp, streak, badges, selfLevel, paid, pick }: Props) {
  const here = level ? MILESTONES[level - 1] : null;
  const next = MILESTONES[level] ?? null;
  return (
    <section className="card mt-5 p-5" aria-labelledby="road-h" id="road">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="road-h" className="flex items-center gap-2 font-hand text-2xl text-[#5A50D6]"><MapIcon className="h-5 w-5" aria-hidden /> Road to $100M</h2>
        <span className="flex items-center gap-3 text-xs text-slate-600">
          <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-amber-500" aria-hidden /> {xp.toLocaleString("en-AU")} XP</span>
          <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-orange-500" aria-hidden /> {streak}-day streak</span>
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-700">Seven milestones from your first sale to $100M a year, and what it takes to reach each one. {source === "numbers" ? <>Your marker uses your real sales: {money(last30)} in the last 30 days.</> : source === "self" ? "You picked where you are. Add your daily numbers and Helix moves the marker for you." : "Pick where you are below, or add your daily numbers and Helix places you."}</p>

      <div className="mt-4"><RoadMap level={level} progress={progress} /></div>

      {here && (
        <p className="mt-4 rounded-xl bg-[#EEEDFB] p-3 text-sm text-slate-800" data-testid="road-here">
          <strong>Level {here.level}: {here.title}.</strong> {here.summary}
          {next && <> Next stop: <a href={`#road-${next.id}`} className="font-semibold text-[#5A50D6] underline">{next.title}</a>{progress != null && level >= 1 ? ` (${Math.round(progress * 100)}% of the way)` : ""}.</>}
        </p>
      )}

      {source !== "numbers" && (
        <form action={pick} className="mt-4 flex flex-wrap items-center gap-2 text-sm" data-testid="road-picker">
          <label htmlFor="road-level" className="font-medium text-slate-800">Where are you now?</label>
          <select id="road-level" name="level" defaultValue={selfLevel ?? ""} className="rounded-lg border border-slate-300 bg-white px-2 py-1.5">
            <option value="">Not started yet</option>
            {MILESTONES.map((m) => <option key={m.id} value={m.level}>Level {m.level}: {m.title}</option>)}
          </select>
          <button type="submit" className="btn-dark !px-3 !py-1.5 !text-sm">Save</button>
        </form>
      )}

      {badges.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Road badges">
          {badges.map((b) => <li key={b.key} title={b.note} className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900"><Trophy className="h-3 w-3" aria-hidden /> {b.title}</li>)}
        </ul>
      )}

      <div className="mt-5 space-y-3">
        {views.map((v) => {
          const isHere = v.level === level;
          return (
            <details key={v.id} id={`road-${v.id}`} open={isHere || (!level && v.level === 1)} className={`group rounded-xl border p-4 ${isHere ? "border-[#5A50D6]/50 bg-white" : "border-slate-200 bg-white/70"}`}>
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                <span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Level {v.level}{isHere ? " · you are here" : ""}</span>
                  <span className="block font-display text-lg font-semibold text-[#1A1718]">{v.title}</span>
                  <span className="block text-sm text-slate-600">{v.summary}</span>
                </span>
                {!v.open && <Lock className="mt-1 h-4 w-4 flex-none text-slate-400" aria-label="Starter" />}
              </summary>
              {v.open ? (
                <div className="mt-3 grid gap-4 text-sm text-slate-800 lg:grid-cols-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">What changes at this level</h3>
                    <p className="mt-1 text-xs text-slate-500">{v.when}</p>
                    <ul className="mt-1 list-disc space-y-1 pl-5">{v.whatChanges.map((c) => <li key={c}>{c}</li>)}</ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">The 3 numbers to hit</h3>
                    <ol className="mt-1 space-y-2">{v.numbers.map((n) => <li key={n.label}><span className="font-medium">{n.label}:</span> {n.target}<span className="block text-xs text-slate-500">{n.why}</span></li>)}</ol>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">The next 5 moves</h3>
                    <ol className="mt-1 list-decimal space-y-1 pl-5">{v.moveLinks.map((x) => <li key={x.text}>{x.href ? <Link href={x.href} className="text-cyan-700 underline">{x.text}</Link> : x.text}{x.locked && <span className="ml-1 inline-flex items-center gap-0.5 text-[11px] text-slate-500"><Lock className="h-3 w-3" aria-hidden />Starter</span>}</li>)}</ol>
                  </div>
                  <div className="lg:col-span-3"><LevelDeep d={v.deep} s={v.spend} /></div>
                  <div className="lg:col-span-3">
                    <h3 className="font-semibold text-slate-900">What the business often looks like</h3>
                    <dl className="mt-1 grid gap-x-4 gap-y-1 sm:grid-cols-2">{v.shape.map((s) => <div key={s.label}><dt className="inline font-medium">{s.label}: </dt><dd className="inline text-slate-700">{s.value}</dd></div>)}</dl>
                    <p className="mt-2 text-xs text-slate-500">{ESTIMATE_NOTE}{v.sources?.length ? <> Sources: {v.sources.map((s, i) => <span key={s.url}>{i ? "; " : ""}<a href={s.url} className="underline" target="_blank" rel="noreferrer">{s.label}</a></span>)}.</> : null}</p>
                  </div>
                </div>
              ) : (
                <div className="mt-3 text-sm text-slate-700" data-testid="road-teaser">
                  <p className="text-xs text-slate-500">{v.when}</p>
                  <p className="mt-1">{v.firstChange}</p>
                  <p className="mt-2 text-slate-600">Inside: what it really takes, a timeline range, what you spend on stock and ads, cash and hiring, channels and partners, mistakes to avoid, the 3 numbers to hit ({v.numberLabels.join(", ")}), the next 5 moves with lessons, and what the team and channels often look like.</p>
                  <Link href="/dashboard/billing?need=starter&for=road" className="btn-dark mt-3 inline-block !px-3 !py-1.5 !text-sm">{UNLOCK_LABEL}</Link>
                </div>
              )}
            </details>
          );
        })}
      </div>
      <details className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-800" data-testid="road-formula">
        <summary className="cursor-pointer font-semibold text-slate-900">How these numbers are worked out</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5">{SPEND_FORMULA.map((x) => <li key={x}>{x}</li>)}</ul>
        <p className="mt-2">{CHANGE_ASSUMPTIONS}</p>
      </details>
      <details className="mt-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-800" data-testid="road-saturation">
        <summary className="cursor-pointer font-semibold text-slate-900">Ads get saturated: how to spot it and what to do</summary>
        <p className="mt-2">{SATURATION.what}</p>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <div><h4 className="font-semibold">Warning signs</h4><ul className="mt-1 list-disc space-y-1 pl-5">{SATURATION.spot.map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div><h4 className="font-semibold">What to do</h4><ul className="mt-1 list-disc space-y-1 pl-5">{SATURATION.fix.map((x) => <li key={x}>{x}</li>)}</ul></div>
        </div>
      </details>
      {paid && (
        <details className="mt-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-800" data-testid="road-brands">
          <summary className="cursor-pointer font-semibold text-slate-900">Learn from real brands</summary>
          <p className="mt-1 text-xs text-slate-500">Only facts from the brands&apos; own pages, public filings or major press, linked under each one.</p>
          <div className="mt-2 space-y-3">{BRAND_LESSONS.map((b) => (
            <div key={b.brand}>
              <h4 className="font-semibold">{b.brand}</h4>
              <p><span className="font-medium">What they did:</span> {b.did}</p>
              <p><span className="font-medium">What happened:</span> {b.happened}</p>
              <p><span className="font-medium">The lesson for your store:</span> {b.lesson}</p>
              <SourceLinks sources={b.sources} />
            </div>
          ))}</div>
        </details>
      )}
      <details className="mt-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-800" data-testid="road-bootstrap">
        <summary className="cursor-pointer font-semibold text-slate-900">{BOOTSTRAP_NOTE.title}</summary>
        {BOOTSTRAP_NOTE.body.map((x) => <p key={x} className="mt-2">{x}</p>)}
      </details>
      {!paid && <p className="mt-3 text-xs text-slate-500">Free shows the whole road and levels 1 to {FREE_LEVELS} in full. Starter opens every level.</p>}
    </section>
  );
}

/** Today: a small teaser of the road with the marker. */
export function RoadTeaser({ level, source }: { level: number; source: "numbers" | "self" | "none" }) {
  const here = level ? MILESTONES[level - 1] : null;
  const next = MILESTONES[level] ?? null;
  return (
    <section className="card p-5" aria-labelledby="road-teaser-h" data-testid="today-road">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="road-teaser-h" className="flex items-center gap-2 font-hand text-xl text-[#5A50D6]"><MapIcon className="h-4 w-4" aria-hidden /> Road to $100M</h2>
        <Link href="/dashboard/progress#road" className="text-sm text-cyan-700 hover:underline">See the whole road</Link>
      </div>
      <p className="mt-1 text-sm text-slate-700">{here ? <>You are at <strong>{here.title}</strong>{source === "self" ? " (you picked this)" : ""}.{next ? <> Next: <strong>{next.title}</strong>.</> : " The top of the road."}</> : <>Seven milestones from your first sale to $100M a year. <Link href="/dashboard/progress#road" className="text-cyan-700 underline">Tell Helix where you are</Link>.</>}</p>
      <div className="mt-3"><RoadMap level={level} progress={null} compact /></div>
    </section>
  );
}
