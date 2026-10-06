import { Check, Sprout, TrendingUp } from "lucide-react";
import { TRACKS, type TrackId } from "@/lib/tracks";
import { COUNTRIES, type Country } from "@/lib/seasons";
import { TAX_OPTIONS, taxLabel, type SalesTaxMode } from "@/lib/tax";

/** Two big radio cards. Put inside a <form>; submits name="track". */
export function TrackPicker({ value }: { value?: TrackId }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-slate-900">Where is your store today?</legend>
      <p className="mt-1 text-sm text-slate-600">This picks your daily lessons. You can switch any time in Settings, and your progress on each track is kept.</p>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        {(["starting", "growing"] as TrackId[]).map((id) => {
          const t = TRACKS[id];
          const Icon = id === "starting" ? Sprout : TrendingUp;
          return (
            <label key={id} className="group relative cursor-pointer rounded-xl border-2 border-slate-200 bg-white p-5 transition hover:border-slate-300 has-[:checked]:border-cyan-500 has-[:checked]:bg-cyan-50/40 has-[:checked]:ring-4 has-[:checked]:ring-cyan-100">
              <input type="radio" name="track" value={id} defaultChecked={value ? value === id : id === "starting"} className="peer sr-only" required />
              <span className="absolute right-4 top-4 hidden h-6 w-6 items-center justify-center rounded-full bg-cyan-500 text-white peer-checked:flex"><Check className="h-4 w-4" aria-hidden /></span>
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${id === "starting" ? "bg-emerald-100 text-emerald-700" : "bg-violet-100 text-violet-700"}`}><Icon className="h-5 w-5" aria-hidden /></span>
              <span className="mt-3 block text-lg font-bold text-slate-900">{t.name}</span>
              <span className="block text-sm font-medium text-slate-700">{t.short}</span>
              <span className="mt-1 block text-sm text-slate-500">{t.who}</span>
              <span className="mt-3 block text-xs font-semibold uppercase tracking-wide text-slate-500">What you will do</span>
              <ul className="mt-1.5 space-y-1.5 text-sm text-slate-700">
                {t.covers.map((c) => <li key={c} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 flex-none text-emerald-600" aria-hidden />{c}</li>)}
              </ul>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Country radio pills. Submits name="country". */
export function CountryPicker({ value }: { value?: Country }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-slate-900">Where do most of your customers live?</legend>
      <p className="mt-1 text-sm text-slate-600">Helix uses this for your calendar of key sale dates, like Black Friday, Click Frenzy or Memorial Day.</p>
      <div className="mt-3 flex flex-wrap gap-3">
        {COUNTRIES.map((c) => (
          <label key={c.id} className="cursor-pointer rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 has-[:checked]:border-cyan-500 has-[:checked]:bg-cyan-50 has-[:checked]:text-slate-900">
            <input type="radio" name="country" value={c.id} defaultChecked={(value ?? "AU") === c.id} className="sr-only" />
            <span className="mr-2 rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-white">{c.flag}</span>{c.name}
          </label>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500">More countries are coming. Pick the closest one for now.</p>
    </fieldset>
  );
}

/** "My prices include GST/VAT". Submits name="salesTaxMode". */
export function TaxPicker({ value, country }: { value?: SalesTaxMode; country?: Country }) {
  const applied = taxLabel(value ?? "auto", country ?? "AU");
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-slate-900">My prices include GST/VAT</legend>
      <p className="mt-1 text-sm text-slate-600">GST and VAT you collect belong to the tax office, not to you. If the sales you type or import include tax (for example Shopify&apos;s Total sales or your order totals), Helix takes it out before working out profit. Costs are left as you enter them.</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {TAX_OPTIONS.map((o) => (
          <label key={o.id} className="cursor-pointer rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm has-[:checked]:border-cyan-500 has-[:checked]:bg-cyan-50">
            <input type="radio" name="salesTaxMode" value={o.id} defaultChecked={(value ?? "auto") === o.id} className="sr-only" />
            <span className="block font-semibold text-slate-900">{o.label}</span>
            <span className="block text-xs text-slate-500">{o.hint}</span>
          </label>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {applied ? `Right now Helix removes ${applied} from your sales.` : "Right now Helix uses your sales exactly as entered."} Not sure? Shopify&apos;s Gross sales and Net sales reports already leave tax out, so pick &quot;No&quot; if you copy those. General information, not tax advice.
      </p>
    </fieldset>
  );
}
