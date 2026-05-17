import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { RecurringEntry } from "@/types/database";
import { DeleteButton } from "@/components/delete-button";
import { deleteMovementAction } from "@/lib/actions/recurring";

type Row = RecurringEntry & {
  account: { name: string; kind: string } | null;
  to: { name: string; kind: string } | null;
  card: { name: string; kind: string } | null;
};

function movementLabel(r: Row): string {
  if (r.to_account_id) return "Transferência";
  if (r.credit_card_id) return r.direction === "in" ? "Entrada" : "Saída (cartão)";
  return r.direction === "in" ? "Entrada" : "Saída";
}

function targetText(r: Row): string {
  if (r.to_account_id) {
    return `${r.account?.name} → ${r.to?.name}`;
  }
  if (r.credit_card_id) {
    return `${r.card?.name} (cartão)`;
  }
  return r.account?.name ?? "—";
}

export default async function MovimentosPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("recurring_entries")
    .select(
      "*, account:account_id(name, kind), to:to_account_id(name, kind), card:credit_card_id(name, kind)",
    )
    .eq("archived", false)
    .order("created_at", { ascending: false });

  const rows = (data as Row[] | null) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[color:var(--text-primary)]">
            Movimentos recorrentes
          </h1>
          <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
            Entradas, saídas e transferências que se repetem
          </p>
        </div>
        <Link
          href="/recorrencias/nova"
          className="rounded-lg bg-[color:var(--brand-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[color:var(--brand-primary-hover)]"
        >
          + Novo movimento
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[color:var(--border-default)] bg-[color:var(--bg-card)] p-12 text-center">
          <p className="text-[color:var(--text-secondary)]">
            Nenhum movimento recorrente cadastrado.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--bg-card)]">
          <table className="w-full text-sm">
            <thead className="bg-[color:var(--bg-muted)] text-xs uppercase tracking-wide text-[color:var(--text-muted)]">
              <tr>
                <th className="px-4 py-3 text-left">Descrição</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Conta(s)</th>
                <th className="px-4 py-3 text-left">Frequência</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border-default)]">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium text-[color:var(--text-primary)]">
                    {r.description}
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                        r.kind === "PJ"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      }`}
                    >
                      {r.kind}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[color:var(--text-secondary)]">
                    {movementLabel(r)}
                  </td>
                  <td className="px-4 py-3 text-[color:var(--text-secondary)]">
                    {targetText(r)}
                  </td>
                  <td className="px-4 py-3 text-[color:var(--text-secondary)]">
                    {formatInterval(r.interval_count, r.interval_unit)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-semibold ${
                      r.to_account_id
                        ? "text-[color:var(--text-primary)]"
                        : r.direction === "in"
                          ? "text-emerald-700 dark:text-emerald-300"
                          : "text-red-700 dark:text-red-300"
                    }`}
                  >
                    {r.to_account_id ? "" : r.direction === "in" ? "+" : "−"}
                    {formatBRL(r.amount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3 text-xs">
                      <Link
                        href={`/recorrencias/${r.id}`}
                        className="text-[color:var(--brand-primary)] hover:underline"
                      >
                        Editar
                      </Link>
                      <DeleteButton id={r.id} action={deleteMovementAction} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatInterval(count: number, unit: string): string {
  const labels: Record<string, [string, string]> = {
    days: ["dia", "dias"],
    weeks: ["semana", "semanas"],
    months: ["mês", "meses"],
    years: ["ano", "anos"],
  };
  const [singular, plural] = labels[unit] ?? [unit, unit];
  if (count === 1) return `Todo ${singular}`;
  return `A cada ${count} ${plural}`;
}

function formatBRL(v: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);
}
