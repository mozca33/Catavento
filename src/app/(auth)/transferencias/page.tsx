import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function TransferenciasPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("transfer_rules")
    .select("*, from:from_account_id(name, kind), to:to_account_id(name, kind)")
    .eq("archived", false)
    .order("created_at", { ascending: false });

  type Row = {
    id: string;
    description: string;
    amount: number;
    day_of_month: number;
    from: { name: string; kind: string } | null;
    to: { name: string; kind: string } | null;
  };
  const rules = (data as Row[] | null) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Transferências recorrentes
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Movimentações entre suas contas (ex: PJ → PF mensal)
          </p>
        </div>
        <Link
          href="/transferencias/nova"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          + Nova transferência
        </Link>
      </div>

      {rules.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-slate-600 dark:text-slate-400">
            Nenhuma transferência recorrente cadastrada.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 text-left">Descrição</th>
                <th className="px-4 py-3 text-left">De → Para</th>
                <th className="px-4 py-3 text-left">Dia</th>
                <th className="px-4 py-3 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {rules.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-50">
                    {r.description}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {r.from?.name} ({r.from?.kind}) → {r.to?.name} ({r.to?.kind})
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    Dia {r.day_of_month}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-50">
                    {formatBRL(r.amount)}
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
