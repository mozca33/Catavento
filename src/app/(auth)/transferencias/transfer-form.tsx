"use client";

import { useActionState } from "react";
import type { Account, TransferRule } from "@/types/database";
import {
  createTransferRuleAction,
  updateTransferRuleAction,
  type ActionResult,
} from "@/lib/actions/recurring";

interface Props {
  mode: "create" | "edit";
  transferId?: string;
  initialValues?: Partial<TransferRule>;
  accounts: Account[];
}

export function TransferForm({
  mode,
  transferId,
  initialValues,
  accounts,
}: Props) {
  const action =
    mode === "edit" && transferId
      ? updateTransferRuleAction.bind(null, transferId)
      : createTransferRuleAction;

  const today = new Date().toISOString().slice(0, 10);
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    action,
    null,
  );

  const err = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--bg-card)] p-6"
    >
      <Select
        label="De (conta origem)"
        name="from_account_id"
        defaultValue={initialValues?.from_account_id ?? accounts[0]?.id}
        options={accounts.map((a) => [a.id, `${a.name} (${a.kind})`] as [string, string])}
        error={err?.from_account_id?.[0]}
      />
      <Select
        label="Para (conta destino)"
        name="to_account_id"
        defaultValue={initialValues?.to_account_id ?? accounts[1]?.id}
        options={accounts.map((a) => [a.id, `${a.name} (${a.kind})`] as [string, string])}
        error={err?.to_account_id?.[0]}
      />
      <Input
        label="Descrição"
        name="description"
        placeholder="Ex: Retirada PJ mensal"
        defaultValue={initialValues?.description}
        error={err?.description?.[0]}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Valor (R$)"
          name="amount"
          type="number"
          step="0.01"
          defaultValue={initialValues?.amount?.toString()}
          error={err?.amount?.[0]}
        />
        <Input
          label="Dia do mês"
          name="day_of_month"
          type="number"
          min="1"
          max="31"
          defaultValue={initialValues?.day_of_month?.toString() ?? "1"}
          error={err?.day_of_month?.[0]}
        />
      </div>
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
        className="mt-1 block w-full rounded-lg border border-[color:var(--border-default)] bg-white px-3 py-2 text-sm text-[color:var(--text-primary)] focus:border-[color:var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[color:var(--brand-primary)] dark:bg-slate-950"
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
  defaultValue,
  error,
}: {
  label: string;
  name: string;
  options: [string, string][];
  defaultValue?: string;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[color:var(--text-secondary)]">
        {label}
      </label>
      <select
        name={name}
        defaultValue={defaultValue || options[0]?.[0]}
        className="mt-1 block w-full rounded-lg border border-[color:var(--border-default)] bg-white px-3 py-2 text-sm text-[color:var(--text-primary)] focus:border-[color:var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[color:var(--brand-primary)] dark:bg-slate-950"
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
