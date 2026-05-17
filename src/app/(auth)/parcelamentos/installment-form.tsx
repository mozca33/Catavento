"use client";

import { useActionState, useState } from "react";
import {
  createInstallmentAction,
  updateInstallmentAction,
  type ActionResult,
} from "@/lib/actions/cards";
import type { Account, CreditCard, Installment } from "@/types/database";

interface Props {
  mode: "create" | "edit";
  installmentId?: string;
  initialValues?: Partial<Installment>;
  accounts: Account[];
  cards: CreditCard[];
}

export function InstallmentForm({
  mode,
  installmentId,
  initialValues,
  accounts,
  cards,
}: Props) {
  const action =
    mode === "edit" && installmentId
      ? updateInstallmentAction.bind(null, installmentId)
      : createInstallmentAction;

  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(action, null);

  const initialTarget = initialValues?.credit_card_id ? "card" : "account";

  const [targetType, setTargetType] = useState<"account" | "card">(
    initialTarget,
  );
  const [targetId, setTargetId] = useState<string>(() => {
    if (initialValues?.account_id) return initialValues.account_id;
    if (initialValues?.credit_card_id) return initialValues.credit_card_id;
    return accounts[0]?.id ?? "";
  });

  function switchTargetType(t: "account" | "card") {
    setTargetType(t);
    const opts = t === "account" ? accounts : cards;
    setTargetId(opts[0]?.id ?? "");
  }

  const today = new Date().toISOString().slice(0, 10);
  const err = state && !state.ok ? state.fieldErrors : undefined;

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--bg-card)] p-6"
    >
      <Input
        label="Descrição"
        name="description"
        placeholder="Ex: Geladeira Madeira Madeira"
        defaultValue={initialValues?.description}
        error={err?.description?.[0]}
      />

      <div>
        <label className="block text-sm font-medium text-[color:var(--text-secondary)]">
          Onde paga
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
            Conta (boleto/débito)
          </button>
          {cards.length > 0 && (
            <button
              type="button"
              onClick={() => switchTargetType("card")}
              className={`flex-1 rounded-md px-3 py-1.5 font-medium ${
                targetType === "card"
                  ? "bg-[color:var(--bg-elevated)] text-[color:var(--text-primary)] shadow-sm"
                  : "text-[color:var(--text-secondary)]"
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
        value={targetId}
        onChange={setTargetId}
        options={
          targetType === "account"
            ? accounts.map((a) => [a.id, `${a.name} (${a.kind})`] as [string, string])
            : cards.map((c) => [c.id, `${c.name} (${c.kind})`] as [string, string])
        }
        error={err?.target_id?.[0]}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Valor total (R$)"
          name="total_amount"
          type="number"
          step="0.01"
          defaultValue={initialValues?.total_amount?.toString()}
          error={err?.total_amount?.[0]}
        />
        <Input
          label="Total de parcelas"
          name="installment_count"
          type="number"
          min="1"
          max="120"
          defaultValue={initialValues?.installment_count?.toString() ?? "10"}
          error={err?.installment_count?.[0]}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Parcelas já pagas"
          name="installments_paid"
          type="number"
          min="0"
          defaultValue={initialValues?.installments_paid?.toString() ?? "0"}
          error={err?.installments_paid?.[0]}
        />
        <Input
          label="Data da 1ª parcela"
          name="first_installment_date"
          type="date"
          defaultValue={initialValues?.first_installment_date ?? today}
          error={err?.first_installment_date?.[0]}
        />
      </div>

      <Select
        label="Natureza"
        name="kind"
        defaultValue={initialValues?.kind ?? "PF"}
        options={[
          ["PF", "Pessoa Física"],
          ["PJ", "Pessoa Jurídica"],
        ]}
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
        required
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
  value,
  defaultValue,
  onChange,
  error,
}: {
  label: string;
  name: string;
  options: [string, string][];
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  error?: string;
}) {
  const isControlled = value !== undefined;
  return (
    <div>
      <label className="block text-sm font-medium text-[color:var(--text-secondary)]">
        {label}
      </label>
      {isControlled ? (
        <select
          name={name}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-[color:var(--border-default)] bg-white px-3 py-2 text-sm text-[color:var(--text-primary)] focus:border-[color:var(--brand-primary)] focus:outline-none focus:ring-1 focus:ring-[color:var(--brand-primary)] dark:bg-slate-950"
        >
          {options.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      ) : (
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
      )}
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
