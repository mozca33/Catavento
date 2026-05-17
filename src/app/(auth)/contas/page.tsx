import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Account } from "@/types/database";
import { DeleteButton } from "@/components/delete-button";
import { deleteAccountAction } from "@/lib/actions/accounts";

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
          <h1 className="text-3xl font-bold text-[color:var(--text-primary)]">
            Contas
          </h1>
          <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
            Suas contas bancárias e carteiras
          </p>
        </div>
        <Link
          href="/contas/nova"
          className="rounded-lg bg-[color:var(--brand-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[color:var(--brand-primary-hover)]"
        >
          + Nova conta
        </Link>
      </div>

      {!accounts || accounts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[color:var(--border-default)] bg-[color:var(--bg-card)] p-12 text-center">
          <p className="text-[color:var(--text-secondary)]">
            Nenhuma conta cadastrada ainda.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {(accounts as Account[]).map((a) => (
            <div
              key={a.id}
              className="rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--bg-card)] p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-[color:var(--text-primary)]">
                    {a.name}
                  </h3>
                  <p className="text-xs text-[color:var(--text-muted)]">
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
              <p className="mt-4 text-2xl font-bold text-[color:var(--text-primary)]">
                {formatBRL(a.current_balance)}
              </p>
              <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                Saldo em {new Date(a.balance_as_of).toLocaleDateString("pt-BR")}
              </p>
              <div className="mt-4 flex items-center gap-3 border-t border-[color:var(--border-default)] pt-3 text-xs">
                <Link
                  href={`/contas/${a.id}`}
                  className="text-[color:var(--brand-primary)] hover:underline"
                >
                  Editar
                </Link>
                <DeleteButton id={a.id} action={deleteAccountAction} />
              </div>
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
