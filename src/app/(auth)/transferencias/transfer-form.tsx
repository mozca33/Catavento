"use client";

import { useActionState, useState } from "react";
import type { Account, IntervalUnit, TransferRule } from "@/types/database";
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

const UNIT_LABELS: Record<IntervalUnit, string> = {
  days: "dia(s)",
  weeks: "semana(s)",
  months: "mês(es)",
  years: "ano(s)",
};

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

  const [destinationType, setDestinationType] = useState<"internal" | "external">(
    initialValues?.to_external_label ? "external" : "internal",
  );
  const [fromId, setFromId] = useState<string>(
    initialValues?.from_account_id ?? accounts[0]?.id ?? "",
  );
  const [toId, setToId] = useState<string>(
    initialValues?.to_account_id ?? accounts[1]?.id ?? accounts[0]?.id ?? "",
  );
  const [intervalUnit, setIntervalUnit] = useState<IntervalUnit>(
    initialValues?.interval_unit ?? "months",
  );

  const err = state && !state.ok ? state.fieldErrors : undefined;
  const showDayOfMonth = intervalUnit === "months" || intervalUnit === "years";

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--bg-card)] p-6"
    >
      <ControlledSelect
        label="De (conta origem)"
        name="from_account_id"
        value={fromId}
        onChange={setFromId}
        options={accounts.map((a) => [a.id, `${a.name} (${a.kind})`] as [string, string])}
        error={err?.from_account_id?.[0]}
      />

      <div>
        <label className="block text-sm font-medium text-[color:var(--text-secondary)]">
          Tipo de destino
        </label>
        <div className="mt-1 flex gap-1 rounded-lg bg-[color:var(--bg-muted)] p-1 text-xs">
          {(["internal", "external"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setDestinationType(t)}
              className={`flex-1 rounded-md px-3 py-1.5 font-medium ${
                destinationType === t
                  ? "bg-[color:var(--brand-primary)] text-white shadow-sm"
                  : "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
              }`}
            >
              {t === "internal" ? "Outra conta minha" : "Externo (terceiro)"}
            </button>
          ))}
        </div>
        <input type="hidden" name="destination_type" value={destinationType} />
      </div>

      {destinationType === "internal" ? (
        <ControlledSelect
          label="Para (conta destino)"
          name="to_account_id"
          value={toId}
          onChange={setToId}
          options={accounts.map((a) => [a.id, `${a.name} (${a.kind})`] as [string, string])}
          error={err?.to_account_id?.[0]}
        />
      ) : (
        <Input
          label="Para quem? (descrição livre)"
          name="to_external_label"
          placeholder="Ex: Pagamento aluguel, PIX João, Mensalidade gym"
          defaultValue={initialValues?.to_external_label ?? undefined}
          error={err?.to_external_label?.[0]}
        />
      )}

      <Input
        label="Descrição"
        name="description"
        placeholder="Ex: Retirada PJ mensal"
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
        <Input
          label="Dia do mês"
          name="day_of_month"
          type="number"
          min="1"
          max="31"
          defaultValue={initialValues?.day_of_month?.toString() ?? "1"}
          error={err?.day_of_month?.[0]}
        />
      )}

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
