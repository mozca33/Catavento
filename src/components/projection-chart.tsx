"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPoint } from "@/lib/projection/aggregate";

interface Props {
  series: ChartPoint[];
}

type ViewMode = "ALL" | "PF" | "PJ";

const VIEW_LABELS: Record<ViewMode, string> = {
  ALL: "Consolidado",
  PF: "Pessoa Física",
  PJ: "Pessoa Jurídica",
};

export function ProjectionChart({ series }: Props) {
  const [view, setView] = useState<ViewMode>("ALL");

  const data = useMemo(
    () =>
      series.map((p) => ({
        date: p.date,
        value: view === "ALL" ? p.total : view === "PF" ? p.pf : p.pj,
      })),
    [series, view],
  );

  if (series.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Adicione contas e recorrências pra ver sua projeção.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
          Projeção dos próximos 12 meses
        </h2>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1 text-xs dark:bg-slate-800">
          {(["ALL", "PF", "PJ"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-md px-3 py-1 font-medium transition ${
                view === v
                  ? "bg-[color:var(--brand-primary)] text-white shadow-sm"
                  : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
              }`}
            >
              {VIEW_LABELS[v]}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563EB" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateTick}
              stroke="#94a3b8"
              fontSize={12}
            />
            <YAxis
              tickFormatter={formatCurrencyShort}
              stroke="#94a3b8"
              fontSize={12}
              width={70}
            />
            <Tooltip
              formatter={(v) => formatBRL(typeof v === "number" ? v : 0)}
              labelFormatter={(d) => formatDateFull(d as string)}
              contentStyle={{
                background: "rgba(15, 23, 42, 0.95)",
                color: "#F1F5F9",
                border: "1px solid rgba(148, 163, 184, 0.3)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#94a3b8" }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#2563EB"
              strokeWidth={2.5}
              fill="url(#balanceGradient)"
              dot={{ r: 3, fill: "#2563EB" }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function formatDateTick(d: string): string {
  const [y, m] = d.split("-");
  return `${m}/${y.slice(2)}`;
}

function formatDateFull(d: string): string {
  return new Date(`${d}T00:00:00`).toLocaleDateString("pt-BR");
}

function formatCurrencyShort(v: number): string {
  if (Math.abs(v) >= 1000) {
    return `R$ ${(v / 1000).toFixed(1)}k`;
  }
  return `R$ ${v.toFixed(0)}`;
}

function formatBRL(v: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);
}
