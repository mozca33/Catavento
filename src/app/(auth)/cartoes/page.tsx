import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/components/delete-button";
import { deleteCardAction } from "@/lib/actions/cards";

export default async function CartoesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("credit_cards")
    .select("*, account:account_id(name)")
    .eq("archived", false)
    .order("created_at", { ascending: false });

  type Row = {
    id: string;
    name: string;
    kind: string;
    closing_day: number;
    due_day: number;
    autopay_day: number | null;
    credit_limit: number | null;
    account: { name: string } | null;
  };
  const cards = (data as Row[] | null) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[color:var(--text-primary)]">
            Cartões de crédito
          </h1>
          <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
            Configure fechamento, vencimento e débito automático
          </p>
        </div>
        <Link
          href="/cartoes/novo"
          className="rounded-lg bg-[color:var(--brand-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[color:var(--brand-primary-hover)]"
        >
          + Novo cartão
        </Link>
      </div>

      {cards.length === 0 ? (
        <Empty />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--bg-card)] p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-[color:var(--text-primary)]">
                    {c.name}
                  </h3>
                  <p className="text-xs text-[color:var(--text-muted)]">
                    Debita em {c.account?.name ?? "—"}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    c.kind === "PJ"
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  }`}
                >
                  {c.kind}
                </span>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <dt className="text-[color:var(--text-muted)]">Fechamento</dt>
                  <dd className="text-[color:var(--text-primary)]">
                    Dia {c.closing_day}
                  </dd>
                </div>
                <div>
                  <dt className="text-[color:var(--text-muted)]">Vencimento</dt>
                  <dd className="text-[color:var(--text-primary)]">
                    Dia {c.due_day}
                  </dd>
                </div>
                {c.autopay_day && (
                  <div>
                    <dt className="text-[color:var(--text-muted)]">Débito auto</dt>
                    <dd className="text-[color:var(--text-primary)]">
                      Dia {c.autopay_day}
                    </dd>
                  </div>
                )}
                {c.credit_limit && (
                  <div>
                    <dt className="text-[color:var(--text-muted)]">Limite</dt>
                    <dd className="text-[color:var(--text-primary)]">
                      {formatBRL(c.credit_limit)}
                    </dd>
                  </div>
                )}
              </dl>
              <div className="mt-4 flex items-center gap-3 border-t border-[color:var(--border-default)] pt-3 text-xs">
                <Link
                  href={`/cartoes/${c.id}`}
                  className="text-[color:var(--brand-primary)] hover:underline"
                >
                  Editar
                </Link>
                <DeleteButton id={c.id} action={deleteCardAction} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Empty() {
  return (
    <div className="rounded-2xl border border-dashed border-[color:var(--border-default)] bg-[color:var(--bg-card)] p-12 text-center">
      <p className="text-[color:var(--text-secondary)]">
        Nenhum cartão cadastrado.
      </p>
    </div>
  );
}

function formatBRL(v: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);
}
