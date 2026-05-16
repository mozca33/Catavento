"use client";

import { useActionState } from "react";
import type { Account } from "@/types/database";
import {
  createTransferRuleAction,
  type ActionResult,
} from "@/lib/actions/recurring";

export function TransferForm({ accounts }: { accounts: Account[] }) {
  const today = new Date().toISOString().slice(0, 10);
  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(createTransferRuleAction, null);

  const err = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
    >
      <Select
        label="De (conta origem)"
        name="from_account_id"
        options={accounts.map((a) => [a.id, `${a.name} (${a.kind})`] as [string, string])}
        error={err?.from_account_id?.[0]}
      />
      <Select
        label="Para (conta destino)"
        name="to_account_id"
        options={accounts.map((a) => [a.id, `${a.name} (${a.kind})`] as [string, string])}
        defaultIndex={1}
        error={err?.to_account_id?.[0]}
      />
      <Input
        label="Descrição"
        name="description"
        placeholder="Ex: Retirada PJ mensal"
        error={err?.description?.[0]}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Valor (R$)"
          name="amount"
          type="number"
          step="0.01"
          error={err?.amount?.[0]}
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
      <div className="grid grid-cols-2 gap-3">
        <Input label="Início" name="start_date" type="date" defaultValue={today} />
        <Input label="Fim (opcional)" name="end_date" type="date" required={false} />
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
  defaultIndex = 0,
  error,
}: {
  label: string;
  name: string;
  options: [string, string][];
  defaultIndex?: number;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <select
        name={name}
        defaultValue={options[defaultIndex]?.[0]}
        className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
