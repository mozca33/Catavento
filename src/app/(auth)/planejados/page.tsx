import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/components/delete-button";
import { deletePlannedAction } from "@/lib/actions/cards";

export default async function PlanejadosPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("planned_entries")
    .select("*, account:account_id(name), card:credit_card_id(name)")
    .eq("done", false)
    .order("scheduled_date", { ascending: true });

  type Row = {
    id: string;
    description: string;
    amount: number;
    direction: "in" | "out";
    scheduled_date: string;
    kind: string;
    account: { name: string } | null;
    card: { name: string } | null;
  };
  const rows = (data as Row[] | null) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[color:var(--text-primary)]">
            Eventos planejados
          </h1>
          <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
            Entradas e saídas pontuais futuras (casamento, viagem, etc.)
          </p>
        </div>
        <Link
          href="/planejados/novo"
          className="rounded-lg bg-[color:var(--brand-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[color:var(--brand-primary-hover)]"
        >
          + Novo evento
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[color:var(--border-default)] bg-[color:var(--bg-card)] p-12 text-center">
          <p className="text-[color:var(--text-secondary)]">
            Nenhum evento planejado.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--bg-card)]">
          <table className="w-full text-sm">
            <thead className="bg-[color:var(--bg-muted)] text-xs uppercase tracking-wide text-[color:var(--text-muted)]">
              <tr>
                <th className="px-4 py-3 text-left">Descrição</th>
                <th className="px-4 py-3 text-left">Data</th>
                <th className="px-4 py-3 text-left">Destino</th>
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
                    {new Date(`${r.scheduled_date}T00:00:00`).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-[color:var(--text-secondary)]">
                    {r.card?.name ?? r.account?.name ?? "—"}
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
                        href={`/planejados/${r.id}`}
                        className="text-[color:var(--brand-primary)] hover:underline"
                      >
                        Editar
                      </Link>
                      <DeleteButton
                        id={r.id}
                        action={deletePlannedAction}
                        label="Concluir"
                        confirmText="Marcar como concluído? Não vai mais aparecer na projeção."
                      />
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

function formatBRL(v: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);
}
