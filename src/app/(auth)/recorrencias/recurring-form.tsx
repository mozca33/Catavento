"use client";

import { useActionState, useState } from "react";
import type {
  Account,
  CreditCard,
  IntervalUnit,
  RecurringEntry,
} from "@/types/database";
import {
  createMovementAction,
  updateMovementAction,
  type ActionResult,
} from "@/lib/actions/recurring";

interface Props {
  mode: "create" | "edit";
  recurringId?: string;
  initialValues?: Partial<RecurringEntry>;
  accounts: Account[];
  cards: CreditCard[];
}

type MovementType = "income" | "expense" | "transfer";

const UNIT_LABELS: Record<IntervalUnit, string> = {
  days: "dia(s)",
  weeks: "semana(s)",
  months: "mês(es)",
  years: "ano(s)",
};

function inferType(v?: Partial<RecurringEntry>): MovementType {
  if (!v) return "expense";
  if (v.to_account_id) return "transfer";
  if (v.direction === "in") return "income";
  return "expense";
}

export function RecurringForm({
  mode,
  recurringId,
  initialValues,
  accounts,
  cards,
}: Props) {
  const action =
    mode === "edit" && recurringId
      ? updateMovementAction.bind(null, recurringId)
      : createMovementAction;

  const today = new Date().toISOString().slice(0, 10);
  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(action, null);

  const [movementType, setMovementType] = useState<MovementType>(inferType(initialValues));
  const [useCard, setUseCard] = useState<boolean>(!!initialValues?.credit_card_id);
  const [fromAccountId, setFromAccountId] = useState<string>(
    initialValues?.account_id ?? accounts[0]?.id ?? "",
  );
  const [toAccountId, setToAccountId] = useState<string>(
    initialValues?.to_account_id ?? accounts[1]?.id ?? accounts[0]?.id ?? "",
  );
  const [cardId, setCardId] = useState<string>(
    initialValues?.credit_card_id ?? cards[0]?.id ?? "",
  );
  const [intervalUnit, setIntervalUnit] = useState<IntervalUnit>(
    initialValues?.interval_unit ?? "months",
  );

  function switchType(t: MovementType) {
    setMovementType(t);
    if (t === "income") setUseCard(false);
    if (t === "transfer") setUseCard(false);
  }

  const err = state && !state.ok ? state.fieldErrors : undefined;
  const showDayOfMonth = intervalUnit === "months" || intervalUnit === "years";
  const showMonthOfYear = intervalUnit === "years";

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--bg-card)] p-6"
    >
      {/* Tipo de movimento */}
      <div>
        <label className="block text-sm font-medium text-[color:var(--text-secondary)]">
          Tipo de movimento
        </label>
        <div className="mt-1 grid grid-cols-3 gap-1 rounded-lg bg-[color:var(--bg-muted)] p-1 text-xs">
          {(
            [
              ["income", "Entrada"],
              ["expense", "Saída"],
              ["transfer", "Transferência entre minhas contas"],
            ] as const
          ).map(([t, label]) => (
            <button
              key={t}
              type="button"
              onClick={() => switchType(t)}
              className={`rounded-md px-3 py-1.5 font-medium ${
                movementType === t
                  ? "bg-[color:var(--brand-primary)] text-white shadow-sm"
                  : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <input type="hidden" name="movement_type" value={movementType} />
      </div>

      <Input
        label="Descrição"
        name="description"
        placeholder={
          movementType === "income"
            ? "Ex: Aluguel recebido"
            : movementType === "transfer"
              ? "Ex: Retirada PJ mensal"
              : "Ex: Condomínio"
        }
        defaultValue={initialValues?.description}
        error={err?.description?.[0]}
      />

      <Input
        label="Valor (R$)"
        name="amount"
        type="number"
        step="0.01"
        defaultValue={initialValues?.amount?.toString()}
        error={err?.amount?.[0]}
      />

      {/* Conta de origem */}
      <ControlledSelect
        label={movementType === "income" ? "Conta de destino" : "Conta de origem"}
        name="from_account_id"
        value={fromAccountId}
        onChange={setFromAccountId}
        options={accounts.map((a) => [a.id, `${a.name} (${a.kind})`] as [string, string])}
        error={err?.from_account_id?.[0]}
      />

      {/* Cartão (só pra saída) */}
      {movementType === "expense" && cards.length > 0 && (
        <div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-[color:var(--text-secondary)]">
            <input
              type="checkbox"
              checked={useCard}
              onChange={(e) => setUseCard(e.target.checked)}
              className="rounded border-[color:var(--border-default)]"
            />
            Pagar no cartão de crédito
          </label>
          <input type="hidden" name="use_card" value={useCard ? "true" : "false"} />
          {useCard && (
            <div className="mt-3">
              <ControlledSelect
                label="Cartão"
                name="card_id"
                value={cardId}
                onChange={setCardId}
                options={cards.map((c) => [c.id, `${c.name} (${c.kind})`] as [string, string])}
                error={err?.card_id?.[0]}
              />
              <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                A parcela vai cair na fatura conforme as datas do cartão.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Transferência → destino */}
      {movementType === "transfer" && (
        <ControlledSelect
          label="Conta de destino"
          name="to_account_id"
          value={toAccountId}
          onChange={setToAccountId}
          options={accounts
            .filter((a) => a.id !== fromAccountId)
            .map((a) => [a.id, `${a.name} (${a.kind})`] as [string, string])}
          error={err?.to_account_id?.[0]}
        />
      )}

      {/* Recorrência */}
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
  error,
}: {
  label: string;
  name: string;
  options: [string, string][];
  value: string;
  onChange: (v: string) => void;
  error?: string;
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
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
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
