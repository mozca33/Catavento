"use client";

import { useActionState } from "react";
import {
  createCardAction,
  updateCardAction,
  type ActionResult,
} from "@/lib/actions/cards";
import type { Account, CreditCard } from "@/types/database";

interface Props {
  mode: "create" | "edit";
  cardId?: string;
  initialValues?: Partial<CreditCard>;
  accounts: Account[];
}

export function CardForm({ mode, cardId, initialValues, accounts }: Props) {
  const action =
    mode === "edit" && cardId
      ? updateCardAction.bind(null, cardId)
      : createCardAction;

  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(action, null);

  const err = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--bg-card)] p-6"
    >
      <Input
        label="Nome"
        name="name"
        placeholder="Ex: Nubank Roxinho"
        defaultValue={initialValues?.name}
        error={err?.name?.[0]}
      />

      <Select
        label="Conta para débito"
        name="account_id"
        defaultValue={initialValues?.account_id ?? accounts[0]?.id}
        options={accounts.map((a) => [a.id, `${a.name} (${a.kind})`])}
        error={err?.account_id?.[0]}
      />

      <Select
        label="Natureza"
        name="kind"
        defaultValue={initialValues?.kind ?? "PF"}
        options={[
          ["PF", "Pessoa Física"],
          ["PJ", "Pessoa Jurídica"],
        ]}
      />

      <div className="grid grid-cols-3 gap-3">
        <Input
          label="Fechamento (dia)"
          name="closing_day"
          type="number"
          min="1"
          max="31"
          defaultValue={initialValues?.closing_day?.toString() ?? "6"}
          error={err?.closing_day?.[0]}
        />
        <Input
          label="Vencimento (dia)"
          name="due_day"
          type="number"
          min="1"
          max="31"
          defaultValue={initialValues?.due_day?.toString() ?? "15"}
          error={err?.due_day?.[0]}
        />
        <Input
          label="Débito auto (dia)"
          name="autopay_day"
          type="number"
          min="1"
          max="31"
          defaultValue={initialValues?.autopay_day?.toString()}
          required={false}
          hint="Opcional"
        />
      </div>

      <Input
        label="Limite (R$)"
        name="credit_limit"
        type="number"
        step="0.01"
        defaultValue={initialValues?.credit_limit?.toString()}
        required={false}
        hint="Opcional"
      />

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
        {pending ? "Salvando..." : mode === "edit" ? "Salvar" : "Criar cartão"}
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
  hint,
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
  hint?: string;
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
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        className="mt-1 block w-full rounded-lg border border-[color:var(--border-default)] bg-white px-3 py-2 text-sm text-[color:var(--text-primary)] focus:border-[color:var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[color:var(--brand-primary)] dark:bg-slate-950"
      />
      {hint && !error && (
        <p className="mt-1 text-xs text-[color:var(--text-muted)]">{hint}</p>
      )}
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
        defaultValue={defaultValue}
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
