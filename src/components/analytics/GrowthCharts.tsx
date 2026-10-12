"use client";

import { PALETTE } from "@/lib/palette";
import { Area, Bar, CartesianGrid, ComposedChart, Legend, Line, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { GrowthPoint } from "@/lib/growth";

const money = (n: number) => (n < 0 ? "-$" : "$") + (Math.abs(n) >= 1000 ? `${(Math.abs(n) / 1000).toFixed(Math.abs(n) >= 10000 ? 0 : 1)}k` : Math.round(Math.abs(n)));
const moneyFull = (n: unknown) => (typeof n === "number" ? (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-AU") : String(n));
const axis = { fontSize: 11, fill: PALETTE.axis };

export function GrowthChart({ data }: { data: GrowthPoint[] }) {
  const rows = data.map((p) => ({ ...p, revenue: p.dataDays ? p.revenue : null, costs: p.dataDays ? p.costs : null, profit: p.dataDays ? p.profit : null }));
  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PALETTE.ink2} stopOpacity={0.22} />
            <stop offset="100%" stopColor={PALETTE.ink2} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={PALETTE.grid} vertical={false} />
        <XAxis dataKey="label" tick={axis} tickLine={false} axisLine={false} minTickGap={12} />
        <YAxis tick={axis} tickFormatter={money} tickLine={false} axisLine={false} width={52} />
        <Tooltip formatter={moneyFull} labelStyle={{ fontWeight: 600 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <ReferenceLine y={0} stroke={PALETTE.greyDark} />
        <Area type="monotone" dataKey="revenue" name="Revenue (after discounts and refunds)" stroke={PALETTE.ink2} strokeWidth={2} fill="url(#rev)" connectNulls />
        <Bar dataKey="costs" name="All costs" fill={PALETTE.grey} radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Line type="monotone" dataKey="profit" name="Net profit" stroke={PALETTE.sage} strokeWidth={3} dot={{ r: 3, fill: PALETTE.sage }} connectNulls />
        <Line type="linear" dataKey="trend" name="Profit trend" stroke={PALETTE.accent} strokeWidth={2} strokeDasharray="6 5" dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function MarginChart({ data }: { data: GrowthPoint[] }) {
  const rows = data.map((p) => ({ label: p.label, margin: p.dataDays ? Math.round(p.marginPct * 10) / 10 : null }));
  const vals = rows.map((r) => r.margin ?? 0);
  const lo = Math.min(-5, Math.floor(Math.min(...vals) / 5) * 5);
  const hi = Math.max(30, Math.ceil(Math.max(...vals) / 5) * 5);
  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <ReferenceArea y1={lo} y2={0} fill={PALETTE.negative} fillOpacity={0.07} ifOverflow="hidden" />
        <ReferenceArea y1={0} y2={10} fill={PALETTE.accent} fillOpacity={0.08} ifOverflow="hidden" />
        <ReferenceArea y1={10} y2={20} fill={PALETTE.sage} fillOpacity={0.09} ifOverflow="hidden" />
        <ReferenceArea y1={20} y2={hi} fill={PALETTE.sage} fillOpacity={0.16} ifOverflow="hidden" />
        <CartesianGrid strokeDasharray="3 3" stroke={PALETTE.grid} vertical={false} />
        <XAxis dataKey="label" tick={axis} tickLine={false} axisLine={false} minTickGap={12} />
        <YAxis tick={axis} domain={[lo, hi]} ticks={[lo, 0, 10, 20, hi].filter((v, i, a) => a.indexOf(v) === i)} tickFormatter={(v: number) => `${v}%`} tickLine={false} axisLine={false} width={44} />
        <Tooltip formatter={(v: unknown) => (typeof v === "number" ? `${v}%` : String(v))} />
        <Line type="monotone" dataKey="margin" name="Net profit margin" stroke={PALETTE.ink} strokeWidth={2.5} dot={{ r: 2.5 }} connectNulls />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
