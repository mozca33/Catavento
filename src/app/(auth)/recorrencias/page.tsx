import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { RecurringEntry } from "@/types/database";
import { DeleteButton } from "@/components/delete-button";
import { deleteRecurringAction } from "@/lib/actions/recurring";

export default async function RecorrenciasPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("recurring_entries")
    .select("*")
    .eq("archived", false)
    .order("created_at", { ascending: false });

  const entries = (data as RecurringEntry[] | null) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[color:var(--text-primary)]">
            Recorrências
          </h1>
          <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
            Entradas e saídas que se repetem todo mês ou ano
          </p>
        </div>
        <Link
          href="/recorrencias/nova"
          className="rounded-lg bg-[color:var(--brand-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[color:var(--brand-primary-hover)]"
        >
          + Nova recorrência
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[color:var(--border-default)] bg-[color:var(--bg-card)] p-12 text-center">
          <p className="text-[color:var(--text-secondary)]">
            Nenhuma recorrência cadastrada.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--bg-card)]">
          <table className="w-full text-sm">
            <thead className="bg-[color:var(--bg-muted)] text-xs uppercase tracking-wide text-[color:var(--text-muted)]">
              <tr>
                <th className="px-4 py-3 text-left">Descrição</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Dia</th>
                <th className="px-4 py-3 text-left">Natureza</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border-default)]">
              {entries.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium text-[color:var(--text-primary)]">
                    {r.description}
                  </td>
                  <td className="px-4 py-3 text-[color:var(--text-secondary)]">
                    {r.direction === "in" ? "Entrada" : "Saída"} ·{" "}
                    {formatInterval(r.interval_count, r.interval_unit)}
                  </td>
                  <td className="px-4 py-3 text-[color:var(--text-secondary)]">
                    {r.day_of_month
                      ? r.month_of_year
                        ? `${r.day_of_month}/${r.month_of_year}`
                        : `Dia ${r.day_of_month}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        r.kind === "PJ"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      }`}
                    >
                      {r.kind}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-semibold ${
                      r.direction === "in"
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-red-700 dark:text-red-300"
                    }`}
                  >
                    {r.direction === "in" ? "+" : "−"}
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
                      <DeleteButton id={r.id} action={deleteRecurringAction} />
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
