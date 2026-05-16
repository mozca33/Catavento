import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Account } from "@/types/database";

const TYPE_LABELS: Record<string, string> = {
  checking: "Conta corrente",
  savings: "Poupança",
  investment: "Investimento",
  cash: "Dinheiro",
  other: "Outro",
};

export default async function ContasPage() {
  const supabase = await createClient();
  const { data: accounts } = await supabase
    .from("accounts")
    .select("*")
    .eq("archived", false)
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Contas
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Suas contas bancárias e carteiras
          </p>
        </div>
        <Link
          href="/contas/nova"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          + Nova conta
        </Link>
      </div>

      {!accounts || accounts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-slate-600 dark:text-slate-400">
            Nenhuma conta cadastrada ainda.
          </p>
          <Link
            href="/contas/nova"
            className="mt-4 inline-block text-sm font-medium text-slate-900 underline dark:text-slate-50"
          >
            Adicionar primeira conta
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {(accounts as Account[]).map((a) => (
            <div
              key={a.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                    {a.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {TYPE_LABELS[a.type]} · {a.kind}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    a.kind === "PJ"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  }`}
                >
                  {a.kind}
                </span>
              </div>
              <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-50">
                {formatBRL(a.current_balance)}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Saldo em {new Date(a.balance_as_of).toLocaleDateString("pt-BR")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
