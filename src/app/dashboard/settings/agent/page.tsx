import { requireUser } from "@/lib/session";
import { getAgentSettings } from "@/lib/agent/settings";
import { saveAgentSettingsAction } from "../../actions";
import { L2_RULE_TEXT, type AutonomyMode } from "@/lib/agent/autonomy";

/**
 * Guardrails page (Step 3, Job 2): the owner controls for the autonomy
 * ladder. Defaults are the safest — propose-only, no auto-post, no daily
 * cap set (which blocks autonomous mode until one is set).
 */
export default async function AgentGuardrails() {
  const u = await requireUser("/dashboard/settings/agent");
  const s = await getAgentSettings(u.id);
  const mode = (m: AutonomyMode) => ({
    propose: "Propose-only (default)",
    assisted: "Assisted — auto-pause losers",
    autonomous: "Autonomous (opt-in, capped)",
  })[m];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="page-title">Agent guardrails</h1>
      <p className="page-lead">
        How much Helix may do on its own. Propose-only is the default: Helix drafts paused ads and proposes
        pauses and scales, and nothing money-moving happens until you approve it. Assisted auto-pauses losers
        under the rule below. Autonomous scaling is opt-in, capped, and only unlocks after 30 days of assisted
        auto-pause with a revert rate under 5%.
      </p>

      <form action={saveAgentSettingsAction} className="mt-6 space-y-6">
        <fieldset className="card p-5">
          <legend className="px-1 text-sm font-semibold">Autonomy level</legend>
          <label className="block text-sm font-medium">Mode
            <select name="mode" defaultValue={s.mode} className="input mt-1">
              {(["propose", "assisted", "autonomous"] as AutonomyMode[]).map((m) => (
                <option key={m} value={m}>{mode(m)}</option>
              ))}
            </select>
          </label>
          <p className="mt-2 text-xs text-slate-500">
            The assisted rule, in plain language: {L2_RULE_TEXT}
          </p>
          <label className="mt-4 block text-sm font-medium">Daily spend cap ($/day, all platforms)
            <input name="dailySpendCap" type="number" min="0" step="10" defaultValue={s.dailySpendCap || ""} placeholder="Set this to unlock autonomous mode" className="input mt-1" />
          </label>
          <p className="mt-1 text-xs text-slate-500">Autonomous scaling stops at this cap. Leave blank and autonomous mode stays blocked.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="block text-sm font-medium">Max scale step (%/day)
              <input name="maxScalePct" type="number" min="5" max="20" defaultValue={s.maxScalePct} className="input mt-1" />
            </label>
            <label className="block text-sm font-medium">Auto-pauses per day (max)
              <input name="autoPausePerDayCap" type="number" min="0" max="10" defaultValue={s.autoPausePerDayCap} className="input mt-1" />
            </label>
            <label className="block text-sm font-medium">Max concurrent tests
              <input name="maxConcurrentTests" type="number" min="1" max="6" defaultValue={s.maxConcurrentTests} className="input mt-1" />
            </label>
          </div>
          <label className="mt-4 block text-sm font-medium">Never pause (campaign names or ids, one per line — hero products, brand search)
            <textarea name="neverPause" rows={3} defaultValue={s.neverPause.join("\n")} className="input mt-1" />
          </label>
          <label className="mt-4 block text-sm font-medium">Discount ceiling (% off — proposals above this are blocked)
            <input name="discountCeilingPct" type="number" min="0" max="50" defaultValue={s.discountCeilingPct} className="input mt-1" />
          </label>
        </fieldset>

        <fieldset className="card p-5">
          <legend className="px-1 text-sm font-semibold">Social posting — “Let Helix post” (off by default)</legend>
          <p className="text-xs text-slate-600">
            Even with auto-post on, price / promotion posts always need your approval, and anything on your
            never-post list never auto-posts. TikTok posts land as a draft in your TikTok inbox for you to tap post.
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {(["instagram", "tiktok", "pinterest", "youtube"] as const).map((ch) => (
              <label key={ch} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm">
                <input type="checkbox" name={`autoPost-${ch}`} defaultChecked={s.autoPost[ch].enabled} />
                <span className="font-medium capitalize">{ch}</span>
                <span className="text-xs text-slate-500">max {s.autoPost[ch].perDayCap}/day</span>
              </label>
            ))}
          </div>
          <label className="mt-4 block text-sm font-medium">Never post (words in a caption that block auto-posting, comma-separated)
            <input name="neverPost" defaultValue={s.neverPost.join(", ")} className="input mt-1" />
          </label>
        </fieldset>

        <button className="btn-primary">Save guardrails</button>
        <p className="text-xs text-slate-500">
          Every pause, draft and scale carries a revert payload and a 7-day undo window. One kill switch: switching
          back to Propose-only stops all automatic pauses and scales immediately.
        </p>
      </form>
    </div>
  );
}
