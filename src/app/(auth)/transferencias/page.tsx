import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/components/delete-button";
import { deleteTransferRuleAction } from "@/lib/actions/recurring";

export default async function TransferenciasPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("transfer_rules")
    .select(
      "*, from:from_account_id(name, kind), to:to_account_id(name, kind)",
    )
    .eq("archived", false)
    .order("created_at", { ascending: false });

  type Row = {
    id: string;
    description: string;
    amount: number;
    interval_count: number;
    interval_unit: string;
    day_of_month: number | null;
    to_external_label: string | null;
    from: { name: string; kind: string } | null;
    to: { name: string; kind: string } | null;
  };
  const rules = (data as Row[] | null) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[color:var(--text-primary)]">
            Transferências recorrentes
          </h1>
          <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
            Movimentações entre suas contas (ex: PJ → PF mensal)
          </p>
        </div>
        <Link
          href="/transferencias/nova"
          className="rounded-lg bg-[color:var(--brand-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[color:var(--brand-primary-hover)]"
        >
          + Nova transferência
        </Link>
      </div>

      {rules.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[color:var(--border-default)] bg-[color:var(--bg-card)] p-12 text-center">
          <p className="text-[color:var(--text-secondary)]">
            Nenhuma transferência recorrente cadastrada.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--bg-card)]">
          <table className="w-full text-sm">
            <thead className="bg-[color:var(--bg-muted)] text-xs uppercase tracking-wide text-[color:var(--text-muted)]">
              <tr>
                <th className="px-4 py-3 text-left">Descrição</th>
                <th className="px-4 py-3 text-left">De → Para</th>
                <th className="px-4 py-3 text-left">Dia</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[color:var(--border-default)]">
              {rules.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium text-[color:var(--text-primary)]">
                    {r.description}
                    {r.to_external_label && (
                      <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                        Externa
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[color:var(--text-secondary)]">
                    {r.from?.name} ({r.from?.kind}) →{" "}
                    {r.to
                      ? `${r.to.name} (${r.to.kind})`
                      : r.to_external_label}
                  </td>
                  <td className="px-4 py-3 text-[color:var(--text-secondary)]">
                    {formatInterval(r.interval_count, r.interval_unit)}
                    {r.day_of_month ? `, dia ${r.day_of_month}` : ""}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[color:var(--text-primary)]">
                    {formatBRL(r.amount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3 text-xs">
                      <Link
                        href={`/transferencias/${r.id}`}
                        className="text-[color:var(--brand-primary)] hover:underline"
                      >
                        Editar
                      </Link>
                      <DeleteButton id={r.id} action={deleteTransferRuleAction} />
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
