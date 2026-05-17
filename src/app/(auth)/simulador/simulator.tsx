"use client";

import { useMemo, useState } from "react";
import type {
  ProjectionSnapshot,
} from "@/lib/projection/engine";
import { projectCashFlow } from "@/lib/projection/engine";
import { buildChartSeries, totalsAtDate } from "@/lib/projection/aggregate";
import { ProjectionChart } from "@/components/projection-chart";
import { billDebitDate } from "@/lib/projection/bill";
import { addMonths } from "@/lib/projection/dates";

interface Props {
  snapshot: ProjectionSnapshot;
}

interface Hypothetical {
  target: "account" | "card";
  accountId: string;
  cardId: string;
  description: string;
  amount: number;
  installments: number;
  date: string;
}

export function Simulator({ snapshot }: Props) {
  const today = new Date().toISOString().slice(0, 10);

  const defaultAccount = snapshot.accounts[0];
  const defaultCard = snapshot.creditCards[0];

  const [h, setH] = useState<Hypothetical>({
    target: defaultCard ? "card" : "account",
    accountId: defaultAccount?.id ?? "",
    cardId: defaultCard?.id ?? "",
    description: "",
    amount: 0,
    installments: 1,
    date: today,
  });

  const baselineProjection = useMemo(
    () => projectCashFlow(snapshot, { horizonMonths: 12 }),
    [snapshot],
  );
  const baselineSeries = useMemo(
    () => buildChartSeries(baselineProjection),
    [baselineProjection],
  );

  const scenarioProjection = useMemo(() => {
    if (!h.amount || h.amount <= 0) return baselineProjection;
    const merged = applyHypothetical(snapshot, h);
    return projectCashFlow(merged, { horizonMonths: 12 });
  }, [snapshot, h, baselineProjection]);

  const scenarioSeries = useMemo(
    () => buildChartSeries(scenarioProjection),
    [scenarioProjection],
  );

  // Comparativo em 3, 6, 12 meses
  const compareDates = [3, 6, 12].map((m) => addMonths(today, m));
  const comparison = compareDates.map((d) => ({
    date: d,
    baseline: totalsAtDate(baselineSeries, d),
    scenario: totalsAtDate(scenarioSeries, d),
  }));

  // Onde cai a 1ª parcela?
  const firstHit = useMemo(() => {
    if (!h.amount || h.amount <= 0) return null;
    if (h.target === "card") {
      const card = snapshot.creditCards.find((c) => c.id === h.cardId);
      if (!card) return null;
      return billDebitDate(card, h.date);
    }
    return h.date;
  }, [snapshot, h]);

  return (
    <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold text-slate-900 dark:text-slate-50">
          Compra hipotética
        </h2>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Onde pagar?
          </label>
          <div className="mt-1 flex gap-1 rounded-lg bg-slate-100 p-1 text-xs dark:bg-slate-800">
            {snapshot.creditCards.length > 0 && (
              <button
                onClick={() => setH({ ...h, target: "card" })}
                className={`flex-1 rounded-md px-3 py-1.5 font-medium transition ${
                  h.target === "card"
                    ? "bg-[color:var(--brand-primary)] text-white shadow-sm"
                    : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
                }`}
              >
                Cartão
              </button>
            )}
            <button
              onClick={() => setH({ ...h, target: "account" })}
              className={`flex-1 rounded-md px-3 py-1.5 font-medium transition ${
                h.target === "account"
                  ? "bg-[color:var(--brand-primary)] text-white shadow-sm"
                  : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
              }`}
            >
              Conta (débito/PIX)
            </button>
          </div>
        </div>

        {h.target === "card" && snapshot.creditCards.length > 0 && (
          <SelectInput
            label="Cartão"
            value={h.cardId}
            onChange={(v) => setH({ ...h, cardId: v })}
            options={snapshot.creditCards.map((c) => [c.id, c.name])}
          />
        )}

        {h.target === "account" && (
          <SelectInput
            label="Conta"
            value={h.accountId}
            onChange={(v) => setH({ ...h, accountId: v })}
            options={snapshot.accounts.map((a) => [a.id, a.name])}
          />
        )}

        <TextInput
          label="Descrição"
          value={h.description}
          onChange={(v) => setH({ ...h, description: v })}
          placeholder="Ex: Geladeira"
        />

        <NumberInput
          label="Valor total"
          value={h.amount}
          onChange={(v) => setH({ ...h, amount: v })}
        />

        <NumberInput
          label="Parcelas"
          value={h.installments}
          onChange={(v) => setH({ ...h, installments: Math.max(1, Math.floor(v)) })}
          step={1}
          min={1}
          max={120}
        />

        <TextInput
          label="Data da compra"
          type="date"
          value={h.date}
          onChange={(v) => setH({ ...h, date: v })}
        />

        {firstHit && (
          <div className="rounded-lg bg-slate-100 px-3 py-2 text-xs dark:bg-slate-800">
            <p className="text-slate-600 dark:text-slate-400">
              1ª parcela ({formatBRL(h.amount / h.installments)}) sai em:
            </p>
            <p className="font-semibold text-slate-900 dark:text-slate-50">
              {new Date(`${firstHit}T00:00:00`).toLocaleDateString("pt-BR")}
            </p>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {comparison.map((c, i) => (
            <ComparisonCard
              key={c.date}
              label={`Em ${[3, 6, 12][i]} meses`}
              date={c.date}
              baseline={c.baseline?.total ?? 0}
              scenario={c.scenario?.total ?? 0}
            />
          ))}
        </div>

        <ProjectionChart series={scenarioSeries} />
      </div>
    </div>
  );
}

function applyHypothetical(
  snapshot: ProjectionSnapshot,
  h: Hypothetical,
): ProjectionSnapshot {
  if (!h.amount || h.amount <= 0) return snapshot;
  const installmentAmount = Math.round((h.amount / h.installments) * 100) / 100;

  const hypoId = `hypothetical-${Date.now()}`;
  const baseInstallment = {
    id: hypoId,
    user_id: "simulator",
    description: h.description || "Compra simulada",
    total_amount: h.amount,
    installment_count: h.installments,
    installment_amount: installmentAmount,
    first_installment_date: h.date,
    installments_paid: 0,
    archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (h.target === "card") {
    const card = snapshot.creditCards.find((c) => c.id === h.cardId);
    if (!card) return snapshot;
    // Pra cartão, first_installment_date deve ser a data de débito da fatura
    const firstDebit = billDebitDate(card, h.date);
    return {
      ...snapshot,
      installments: [
        ...snapshot.installments,
        {
          ...baseInstallment,
          account_id: null,
          credit_card_id: h.cardId,
          first_installment_date: firstDebit,
          kind: card.kind,
        },
      ],
    };
  }

  const account = snapshot.accounts.find((a) => a.id === h.accountId);
  if (!account) return snapshot;
  return {
    ...snapshot,
    installments: [
      ...snapshot.installments,
      {
        ...baseInstallment,
        account_id: h.accountId,
        credit_card_id: null,
        kind: account.kind,
      },
    ],
  };
}

function TextInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
      />
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  step = 0.01,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        step={step}
        min={min}
        max={max}
        className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
      />
    </div>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
      >
        {options.map(([v, label]) => (
          <option key={v} value={v}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ComparisonCard({
  label,
  date,
  baseline,
  scenario,
}: {
  label: string;
  date: string;
  baseline: number;
  scenario: number;
}) {
  const delta = scenario - baseline;
  const isWorse = delta < 0;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-50">
        {formatBRL(scenario)}
      </p>
      <p
        className={`mt-1 text-xs font-medium ${
          isWorse
            ? "text-red-700 dark:text-red-300"
            : "text-emerald-700 dark:text-emerald-300"
        }`}
      >
        {delta === 0 ? "Sem mudança" : `${delta < 0 ? "−" : "+"}${formatBRL(Math.abs(delta))}`}
      </p>
      <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
        em {new Date(`${date}T00:00:00`).toLocaleDateString("pt-BR")}
      </p>
    </div>
  );
}

function formatBRL(v: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);
}
