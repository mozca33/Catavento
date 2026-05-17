import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/components/delete-button";
import { deleteInstallmentAction } from "@/lib/actions/cards";

export default async function ParcelamentosPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("installments")
    .select("*, account:account_id(name), card:credit_card_id(name)")
    .eq("archived", false)
    .order("created_at", { ascending: false });

  type Row = {
    id: string;
    description: string;
    total_amount: number;
    installment_count: number;
    installment_amount: number;
    installments_paid: number;
    first_installment_date: string;
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
            Parcelamentos
          </h1>
          <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
            Compras parceladas em curso
          </p>
        </div>
        <Link
          href="/parcelamentos/novo"
          className="rounded-lg bg-[color:var(--brand-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[color:var(--brand-primary-hover)]"
        >
          + Novo parcelamento
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[color:var(--border-default)] bg-[color:var(--bg-card)] p-12 text-center">
          <p className="text-[color:var(--text-secondary)]">
            Nenhum parcelamento cadastrado.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--bg-card)]">
          <table className="w-full text-sm">
            <thead className="bg-[color:var(--bg-muted)] text-xs uppercase tracking-wide text-[color:var(--text-muted)]">
              <tr>
                <th className="px-4 py-3 text-left">Descrição</th>
                <th className="px-4 py-3 text-left">Destino</th>
                <th className="px-4 py-3 text-left">Parcelas</th>
                <th className="px-4 py-3 text-right">Valor parcela</th>
                <th className="px-4 py-3 text-right">Total</th>
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
                    {r.card?.name ?? r.account?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-[color:var(--text-secondary)]">
                    {r.installments_paid}/{r.installment_count}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {formatBRL(r.installment_amount)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {formatBRL(r.total_amount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-3 text-xs">
                      <Link
                        href={`/parcelamentos/${r.id}`}
                        className="text-[color:var(--brand-primary)] hover:underline"
                      >
                        Editar
                      </Link>
                      <DeleteButton id={r.id} action={deleteInstallmentAction} />
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
