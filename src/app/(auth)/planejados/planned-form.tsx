"use client";

import { useActionState, useState } from "react";
import {
  createPlannedAction,
  updatePlannedAction,
  type ActionResult,
} from "@/lib/actions/cards";
import type { Account, CreditCard, PlannedEntry } from "@/types/database";

interface Props {
  mode: "create" | "edit";
  plannedId?: string;
  initialValues?: Partial<PlannedEntry>;
  accounts: Account[];
  cards: CreditCard[];
}

export function PlannedForm({
  mode,
  plannedId,
  initialValues,
  accounts,
  cards,
}: Props) {
  const action =
    mode === "edit" && plannedId
      ? updatePlannedAction.bind(null, plannedId)
      : createPlannedAction;

  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(action, null);

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
        placeholder="Ex: Pagamento fornecedor casamento"
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
          label="Data"
          name="scheduled_date"
          type="date"
          defaultValue={initialValues?.scheduled_date ?? today}
          error={err?.scheduled_date?.[0]}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[color:var(--text-secondary)]">
          Onde
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
  step,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
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
