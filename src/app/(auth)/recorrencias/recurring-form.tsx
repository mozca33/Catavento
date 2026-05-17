"use client";

import { useActionState, useState } from "react";
import type { Account, CreditCard, IntervalUnit, RecurringEntry } from "@/types/database";
import {
  createRecurringAction,
  updateRecurringAction,
  type ActionResult,
} from "@/lib/actions/recurring";

interface Props {
  mode: "create" | "edit";
  recurringId?: string;
  initialValues?: Partial<RecurringEntry>;
  accounts: Account[];
  cards: CreditCard[];
}

const UNIT_LABELS: Record<IntervalUnit, string> = {
  days: "dia(s)",
  weeks: "semana(s)",
  months: "mês(es)",
  years: "ano(s)",
};

export function RecurringForm({
  mode,
  recurringId,
  initialValues,
  accounts,
  cards,
}: Props) {
  const action =
    mode === "edit" && recurringId
      ? updateRecurringAction.bind(null, recurringId)
      : createRecurringAction;

  const today = new Date().toISOString().slice(0, 10);
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    action,
    null,
  );

  const [direction, setDirection] = useState<"in" | "out">(
    initialValues?.direction ?? "out",
  );
  const initialTarget = initialValues?.credit_card_id ? "card" : "account";
  const [targetType, setTargetType] = useState<"account" | "card">(initialTarget);
  const [targetId, setTargetId] = useState<string>(() => {
    if (initialValues?.account_id) return initialValues.account_id;
    if (initialValues?.credit_card_id) return initialValues.credit_card_id;
    return accounts[0]?.id ?? "";
  });
  const [intervalUnit, setIntervalUnit] = useState<IntervalUnit>(
    initialValues?.interval_unit ?? "months",
  );

  function switchTargetType(t: "account" | "card") {
    setTargetType(t);
    const opts = t === "account" ? accounts : cards;
    setTargetId(opts[0]?.id ?? "");
  }

  const err = state && !state.ok ? state.fieldErrors : undefined;
  const showDayOfMonth = intervalUnit === "months" || intervalUnit === "years";
  const showMonthOfYear = intervalUnit === "years";

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--bg-card)] p-6"
    >
      <div>
        <label className="block text-sm font-medium text-[color:var(--text-secondary)]">
          Tipo
        </label>
        <div className="mt-1 flex gap-1 rounded-lg bg-[color:var(--bg-muted)] p-1 text-xs">
          {(["in", "out"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                setDirection(d);
                if (d === "in") setTargetType("account");
              }}
              className={`flex-1 rounded-md px-3 py-1.5 font-medium ${
                direction === d
                  ? "bg-[color:var(--brand-primary)] text-white shadow-sm"
                  : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
              }`}
            >
              {d === "in" ? "Entrada" : "Saída"}
            </button>
          ))}
        </div>
        <input type="hidden" name="direction" value={direction} />
      </div>

      <Input
        label="Descrição"
        name="description"
        placeholder="Ex: Aluguel recebido"
        defaultValue={initialValues?.description}
        error={err?.description?.[0]}
      />

      <Input
        label="Valor (R$)"
        name="amount"
        type="number"
        step="0.01"
        placeholder="0,00"
        defaultValue={initialValues?.amount?.toString()}
        error={err?.amount?.[0]}
      />

      <div>
        <label className="block text-sm font-medium text-[color:var(--text-secondary)]">
          Repetir a cada
        </label>
        <div className="mt-1 grid grid-cols-2 gap-2">
          <input
            name="interval_count"
            type="number"
            min="1"
            max="365"
            defaultValue={initialValues?.interval_count?.toString() ?? "1"}
            required
            className="block w-full rounded-lg border border-[color:var(--border-default)] bg-[color:var(--bg-card)] px-3 py-2 text-sm text-[color:var(--text-primary)] focus:border-[color:var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[color:var(--brand-primary)]"
          />
          <select
            name="interval_unit"
            value={intervalUnit}
            onChange={(e) => setIntervalUnit(e.target.value as IntervalUnit)}
            className="block w-full rounded-lg border border-[color:var(--border-default)] bg-[color:var(--bg-card)] px-3 py-2 text-sm text-[color:var(--text-primary)] focus:border-[color:var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[color:var(--brand-primary)]"
          >
            {(["days", "weeks", "months", "years"] as IntervalUnit[]).map((u) => (
              <option key={u} value={u}>
                {UNIT_LABELS[u]}
              </option>
            ))}
          </select>
        </div>
        <p className="mt-1 text-xs text-[color:var(--text-muted)]">
          Ex: a cada 2 semanas, a cada 3 meses, a cada 6 meses
        </p>
      </div>

      {showDayOfMonth && (
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Dia do mês"
            name="day_of_month"
            type="number"
            min="1"
            max="31"
            defaultValue={initialValues?.day_of_month?.toString() ?? "1"}
            error={err?.day_of_month?.[0]}
          />
          {showMonthOfYear && (
            <Input
              label="Mês (1-12)"
              name="month_of_year"
              type="number"
              min="1"
              max="12"
              defaultValue={initialValues?.month_of_year?.toString() ?? "1"}
              error={err?.month_of_year?.[0]}
            />
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-[color:var(--text-secondary)]">
          Destino
        </label>
        <div className="mt-1 flex gap-1 rounded-lg bg-[color:var(--bg-muted)] p-1 text-xs">
          <button
            type="button"
            onClick={() => switchTargetType("account")}
            className={`flex-1 rounded-md px-3 py-1.5 font-medium ${
              targetType === "account"
                ? "bg-[color:var(--bg-elevated)] text-[color:var(--text-primary)] shadow-sm"
                : "text-[color:var(--text-secondary)]"
            }`}
          >
            Conta
          </button>
          {cards.length > 0 && direction === "out" && (
            <button
              type="button"
              onClick={() => switchTargetType("card")}
              className={`flex-1 rounded-md px-3 py-1.5 font-medium ${
                targetType === "card"
                  ? "bg-[color:var(--brand-primary)] text-white shadow-sm"
                  : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
              }`}
            >
              Cartão
            </button>
          )}
        </div>
        <input type="hidden" name="target_type" value={targetType} />
      </div>

      <ControlledSelect
        label={targetType === "account" ? "Conta" : "Cartão"}
        name="target_id"
        value={targetId}
        onChange={setTargetId}
        options={
          targetType === "account"
            ? accounts.map((a) => [a.id, `${a.name} (${a.kind})`] as [string, string])
            : cards.map((c) => [c.id, `${c.name} (${c.kind})`] as [string, string])
        }
      />

      <UncontrolledSelect
        label="Natureza"
        name="kind"
        defaultValue={initialValues?.kind ?? "PF"}
        options={[
          ["PF", "Pessoa Física"],
          ["PJ", "Pessoa Jurídica"],
        ]}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Início"
          name="start_date"
          type="date"
          defaultValue={initialValues?.start_date ?? today}
        />
        <Input
          label="Fim (opcional)"
          name="end_date"
          type="date"
          defaultValue={initialValues?.end_date ?? undefined}
          required={false}
        />
      </div>

      {state && !state.ok && (
        <div
          role="alert"
          className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-300"
        >
          <p className="font-semibold">⚠ {state.error}</p>
          {state.fieldErrors && (
            <ul className="mt-2 list-disc pl-5 text-xs">
              {Object.entries(state.fieldErrors).map(([field, msgs]) => (
                <li key={field}>
                  <strong>{field}</strong>: {(msgs as string[]).join(", ")}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-[color:var(--brand-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[color:var(--brand-primary-hover)] disabled:opacity-50"
      >
        {pending ? "Salvando..." : mode === "edit" ? "Salvar" : "Criar"}
      </button>
    </form>
  );
}

function Input({
  label,
  name,
  type = "text",
  placeholder,
  defaultValue,
  min,
  max,
  step,
  required = true,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  min?: string;
  max?: string;
  step?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[color:var(--text-secondary)]">
        {label}
      </label>
      <input
        name={name}
        type={type}
        step={step}
        min={min}
        max={max}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        className="mt-1 block w-full rounded-lg border border-[color:var(--border-default)] bg-[color:var(--bg-card)] px-3 py-2 text-sm text-[color:var(--text-primary)] focus:border-[color:var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[color:var(--brand-primary)]"
      />
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

function ControlledSelect({
  label,
  name,
  options,
  value,
  onChange,
}: {
  label: string;
  name: string;
  options: [string, string][];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[color:var(--text-secondary)]">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full rounded-lg border border-[color:var(--border-default)] bg-[color:var(--bg-card)] px-3 py-2 text-sm text-[color:var(--text-primary)] focus:border-[color:var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[color:var(--brand-primary)]"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </div>
  );
}

function UncontrolledSelect({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: [string, string][];
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[color:var(--text-secondary)]">
        {label}
      </label>
      <select
        name={name}
        defaultValue={defaultValue || options[0]?.[0]}
        className="mt-1 block w-full rounded-lg border border-[color:var(--border-default)] bg-[color:var(--bg-card)] px-3 py-2 text-sm text-[color:var(--text-primary)] focus:border-[color:var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[color:var(--brand-primary)]"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </div>
  );
}
