"use client";

import {
  Bar, BarChart, CartesianGrid, Cell, ComposedChart, Legend, Line, LineChart, Pie, PieChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import type { SeriesRow } from "@/lib/analytics";

const money = (n: number) => (n < 0 ? "-$" : "$") + (Math.abs(n) >= 1000 ? `${(Math.abs(n) / 1000).toFixed(Math.abs(n) >= 10000 ? 0 : 1)}k` : Math.round(Math.abs(n)));
const moneyFull = (n: unknown) => (typeof n === "number" ? (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-AU") : String(n));
const axis = { fontSize: 11, fill: "#64748b" };
const H = 260;

export function RevenueCostsProfit({ data }: { data: SeriesRow[] }) {
  return (
    <ResponsiveContainer width="100%" height={H}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="label" tick={axis} tickLine={false} axisLine={false} />
        <YAxis tick={axis} tickFormatter={money} tickLine={false} axisLine={false} width={48} />
        <Tooltip formatter={moneyFull} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <ReferenceLine y={0} stroke="#94a3b8" />
        <Bar dataKey="revenue" name="Revenue" fill="#06b6d4" radius={[4, 4, 0, 0]} />
        <Bar dataKey="costs" name="Costs (product, shipping, fees, ads, marketing)" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
        <Line type="monotone" dataKey="contribution" name="Contribution profit" stroke="#059669" strokeWidth={2.5} dot={{ r: 3 }} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function ProfitTrend({ data, prevLabel }: { data: SeriesRow[]; prevLabel: string }) {
  return (
    <ResponsiveContainer width="100%" height={H}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="label" tick={axis} tickLine={false} axisLine={false} />
        <YAxis tick={axis} tickFormatter={money} tickLine={false} axisLine={false} width={48} />
        <Tooltip formatter={moneyFull} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <ReferenceLine y={0} stroke="#f43f5e" strokeDasharray="4 4" />
        <Line type="monotone" dataKey="contribution" name="Contribution profit" stroke="#059669" strokeWidth={2.5} dot={false} />
        <Line type="monotone" dataKey="netProfit" name="Net profit (after fixed costs)" stroke="#0f172a" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="prevContribution" name={`Contribution, ${prevLabel}`} stroke="#94a3b8" strokeDasharray="5 4" strokeWidth={2} dot={false} connectNulls />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function Donut({ data, centre }: { data: { name: string; value: number; color: string }[]; centre: string }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative h-[220px] w-[220px] flex-none">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={100} paddingAngle={1.5} stroke="none" isAnimationActive={false}>
              {data.map((d) => <Cell key={d.name} fill={d.color} />)}
            </Pie>
            <Tooltip formatter={moneyFull} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-slate-500">{centre}</span>
          <span className="text-lg font-bold">{moneyFull(total)}</span>
        </div>
      </div>
      <ul className="w-full space-y-1.5 text-sm">
        {data.map((d) => (
          <li key={d.name} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} aria-hidden />{d.name}</span>
            <span className="tabular-nums text-slate-600">{moneyFull(d.value)} <span className="text-slate-400">({total ? Math.round((d.value / total) * 100) : 0}%)</span></span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RoasMer({ data, breakEven, targetMer }: { data: SeriesRow[]; breakEven: number; targetMer: number }) {
  return (
    <ResponsiveContainer width="100%" height={H}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="label" tick={axis} tickLine={false} axisLine={false} />
        <YAxis yAxisId="roas" tick={axis} tickFormatter={(v) => `${v}x`} tickLine={false} axisLine={false} width={36} />
        <YAxis yAxisId="mer" orientation="right" tick={axis} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} width={40} />
        <Tooltip formatter={(v, n) => (typeof v === "number" ? (String(n).startsWith("MER") ? `${v.toFixed(1)}%` : `${v.toFixed(2)}x`) : String(v))} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <ReferenceLine yAxisId="roas" y={breakEven} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: `Break-even ROAS ${breakEven.toFixed(2)}x`, fontSize: 11, fill: "#e11d48", position: "insideTopLeft" }} />
        <ReferenceLine yAxisId="mer" y={targetMer} stroke="#a78bfa" strokeDasharray="2 4" />
        <Bar yAxisId="mer" dataKey="merPct" name="MER (ad spend ÷ revenue)" fill="#ddd6fe" radius={[4, 4, 0, 0]} />
        <Line yAxisId="roas" type="monotone" dataKey="roas" name="Blended ROAS (revenue ÷ all ads)" stroke="#0f172a" strokeWidth={2.5} dot={false} />
        <Line yAxisId="roas" type="monotone" dataKey="roasMeta" name="Meta ROAS" stroke="#6366f1" strokeWidth={2} dot={false} connectNulls />
        <Line yAxisId="roas" type="monotone" dataKey="roasGoogle" name="Google ROAS" stroke="#f59e0b" strokeWidth={2} dot={false} connectNulls />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function ChannelBars({ data, breakEven }: { data: { name: string; spend: number; revenue: number; roas: number }[]; breakEven: number }) {
  return (
    <ResponsiveContainer width="100%" height={H}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="name" tick={axis} tickLine={false} axisLine={false} />
        <YAxis tick={axis} tickFormatter={money} tickLine={false} axisLine={false} width={48} />
        <Tooltip formatter={moneyFull} labelFormatter={(l) => { const c = data.find((d) => d.name === l); return c ? `${l}: ROAS ${c.roas.toFixed(2)}x (break-even ${breakEven.toFixed(2)}x)` : String(l); }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="spend" name="Ad spend" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
        <Bar dataKey="revenue" name="Sales the platform reports" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function NewReturning({ data }: { data: SeriesRow[] }) {
  return (
    <ResponsiveContainer width="100%" height={H}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="label" tick={axis} tickLine={false} axisLine={false} />
        <YAxis tick={axis} tickFormatter={money} tickLine={false} axisLine={false} width={48} />
        <Tooltip formatter={moneyFull} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="newRevenue" stackId="a" name="New customers" fill="#22d3ee" />
        <Bar dataKey="returningRevenue" stackId="a" name="Returning customers" fill="#0e7490" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
