"use client";

import { useActionState, useState } from "react";
import type { Account, CreditCard } from "@/types/database";
import {
  createRecurringAction,
  type ActionResult,
} from "@/lib/actions/recurring";

interface Props {
  accounts: Account[];
  cards: CreditCard[];
}

export function RecurringForm({ accounts, cards }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(createRecurringAction, null);

  const [direction, setDirection] = useState<"in" | "out">("out");
  const [targetType, setTargetType] = useState<"account" | "card">("account");
  const [frequency, setFrequency] = useState<"monthly" | "yearly">("monthly");

  const err = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
    >
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Tipo
        </label>
        <div className="mt-1 flex gap-1 rounded-lg bg-slate-100 p-1 text-xs dark:bg-slate-800">
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
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-50"
                  : "text-slate-600 dark:text-slate-400"
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
        error={err?.description?.[0]}
      />

      <Input
        label="Valor (R$)"
        name="amount"
        type="number"
        step="0.01"
        placeholder="0,00"
        error={err?.amount?.[0]}
      />

      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Frequência"
          name="frequency"
          value={frequency}
          onChange={(v) => setFrequency(v as "monthly" | "yearly")}
          options={[
            ["monthly", "Mensal"],
            ["yearly", "Anual"],
          ]}
        />
        <Input
          label="Dia do mês"
          name="day_of_month"
          type="number"
          min="1"
          max="31"
          defaultValue="1"
          error={err?.day_of_month?.[0]}
        />
      </div>

      {frequency === "yearly" && (
        <Input
          label="Mês (1-12)"
          name="month_of_year"
          type="number"
          min="1"
          max="12"
          error={err?.month_of_year?.[0]}
        />
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Destino
        </label>
        <div className="mt-1 flex gap-1 rounded-lg bg-slate-100 p-1 text-xs dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setTargetType("account")}
            className={`flex-1 rounded-md px-3 py-1.5 font-medium ${
              targetType === "account"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-50"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Conta
          </button>
          {cards.length > 0 && direction === "out" && (
            <button
              type="button"
              onClick={() => setTargetType("card")}
              className={`flex-1 rounded-md px-3 py-1.5 font-medium ${
                targetType === "card"
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-50"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              Cartão
            </button>
          )}
        </div>
        <input type="hidden" name="target_type" value={targetType} />
      </div>

      <Select
        label={targetType === "account" ? "Conta" : "Cartão"}
        name="target_id"
        options={
          targetType === "account"
            ? accounts.map((a) => [a.id, `${a.name} (${a.kind})`] as [string, string])
            : cards.map((c) => [c.id, `${c.name} (${c.kind})`] as [string, string])
        }
      />

      <Select
        label="Natureza"
        name="kind"
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
          defaultValue={today}
        />
        <Input
          label="Fim (opcional)"
          name="end_date"
          type="date"
          required={false}
        />
      </div>

      {state && !state.ok && !state.fieldErrors && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
        >
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
      >
        {pending ? "Salvando..." : "Criar"}
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
  step,
  min,
  max,
  required = true,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  step?: string;
  min?: string;
  max?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
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
        className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
      />
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

function Select({
  label,
  name,
  options,
  value,
  onChange,
}: {
  label: string;
  name: string;
  options: [string, string][];
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        defaultValue={value === undefined ? options[0][0] : undefined}
        className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
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
