"use client";

import { useActionState } from "react";
import {
  createAccountAction,
  updateAccountAction,
  type AccountActionResult,
} from "@/lib/actions/accounts";
import type { Account } from "@/types/database";

interface Props {
  mode: "create" | "edit";
  accountId?: string;
  initialValues?: Partial<Account>;
}

export function AccountForm({ mode, accountId, initialValues }: Props) {
  const action =
    mode === "edit" && accountId
      ? updateAccountAction.bind(null, accountId)
      : createAccountAction;

  const [state, formAction, pending] = useActionState<
    AccountActionResult | null,
    FormData
  >(action, null);

  const today = new Date().toISOString().slice(0, 10);
  const err = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--bg-card)] p-6"
    >
      <Field
        label="Nome"
        id="name"
        type="text"
        placeholder="Ex: Nubank, Inter Empresa"
        defaultValue={initialValues?.name}
        error={err?.name?.[0]}
      />

      <div className="grid grid-cols-2 gap-4">
        <SelectField
          label="Tipo"
          id="type"
          defaultValue={initialValues?.type ?? "checking"}
          options={[
            ["checking", "Conta corrente"],
            ["savings", "Poupança"],
            ["investment", "Investimento"],
            ["cash", "Dinheiro"],
            ["other", "Outro"],
          ]}
        />
        <SelectField
          label="Natureza"
          id="kind"
          defaultValue={initialValues?.kind ?? "PF"}
          options={[
            ["PF", "Pessoa Física"],
            ["PJ", "Pessoa Jurídica"],
          ]}
        />
      </div>

      <Field
        label="Saldo atual"
        id="current_balance"
        type="number"
        step="0.01"
        placeholder="0,00"
        defaultValue={initialValues?.current_balance?.toString()}
        error={err?.current_balance?.[0]}
      />

      <Field
        label="Data do saldo"
        id="balance_as_of"
        type="date"
        defaultValue={initialValues?.balance_as_of ?? today}
        error={err?.balance_as_of?.[0]}
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
        {pending ? "Salvando..." : mode === "edit" ? "Salvar" : "Criar conta"}
      </button>
    </form>
  );
}

function Field({
  label,
  id,
  type,
  placeholder,
  defaultValue,
  step,
  error,
}: {
  label: string;
  id: string;
  type: string;
  placeholder?: string;
  defaultValue?: string;
  step?: string;
  error?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-[color:var(--text-secondary)]"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        step={step}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required
        className="mt-1 block w-full rounded-lg border border-[color:var(--border-default)] bg-white px-3 py-2 text-[color:var(--text-primary)] shadow-sm focus:border-[color:var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[color:var(--brand-primary)] dark:bg-slate-950"
      />
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

function SelectField({
  label,
  id,
  options,
  defaultValue,
}: {
  label: string;
  id: string;
  options: [string, string][];
  defaultValue: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-[color:var(--text-secondary)]"
      >
        {label}
      </label>
      <select
        id={id}
        name={id}
        defaultValue={defaultValue}
        className="mt-1 block w-full rounded-lg border border-[color:var(--border-default)] bg-white px-3 py-2 text-[color:var(--text-primary)] shadow-sm focus:border-[color:var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[color:var(--brand-primary)] dark:bg-slate-950"
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
