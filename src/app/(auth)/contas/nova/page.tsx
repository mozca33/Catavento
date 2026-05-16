"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  createAccountAction,
  type AccountActionResult,
} from "@/lib/actions/accounts";

export default function NovaContaPage() {
  const [state, formAction, pending] = useActionState<
    AccountActionResult | null,
    FormData
  >(createAccountAction, null);

  const today = new Date().toISOString().slice(0, 10);
  const err = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href="/contas"
          className="text-sm text-slate-600 hover:underline dark:text-slate-400"
        >
          ← Voltar
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">
          Nova conta
        </h1>
      </div>

      <form
        action={formAction}
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
      >
        <Field
          label="Nome"
          id="name"
          type="text"
          placeholder="Ex: Nubank, Inter Empresa"
          error={err?.name?.[0]}
        />

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Tipo"
            id="type"
            options={[
              ["checking", "Conta corrente"],
              ["savings", "Poupança"],
              ["investment", "Investimento"],
              ["cash", "Dinheiro"],
              ["other", "Outro"],
            ]}
            defaultValue="checking"
          />
          <SelectField
            label="Natureza"
            id="kind"
            options={[
              ["PF", "Pessoa Física"],
              ["PJ", "Pessoa Jurídica"],
            ]}
            defaultValue="PF"
          />
        </div>

        <Field
          label="Saldo atual"
          id="current_balance"
          type="number"
          step="0.01"
          placeholder="0,00"
          error={err?.current_balance?.[0]}
        />

        <Field
          label="Data do saldo"
          id="balance_as_of"
          type="date"
          defaultValue={today}
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
          className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          {pending ? "Salvando..." : "Criar conta"}
        </button>
      </form>
    </div>
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
        className="block text-sm font-medium text-slate-700 dark:text-slate-300"
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
        className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
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
        className="block text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {label}
      </label>
      <select
        id={id}
        name={id}
        defaultValue={defaultValue}
        className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
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
