import { getCurrentSubscription, statusLabel, daysUntil } from "@/lib/queries/subscription";
import { SubscriptionActions } from "./actions-client";

export default async function AssinaturaPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const sub = await getCurrentSubscription();

  if (!sub) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--bg-card)] p-12 text-center">
          <p className="text-[color:var(--text-secondary)]">
            Não foi possível carregar sua assinatura.
          </p>
        </div>
      </div>
    );
  }

  const isTrialing = sub.status === "trialing";
  const isActive = sub.status === "active";
  const daysLeft = daysUntil(sub.trial_ends_at);
  const showSuccess = params.status === "success";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[color:var(--text-primary)]">
          Assinatura
        </h1>
        <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
          Plano único: R$ 29/mês, com 7 dias de teste grátis
        </p>
      </div>

      {showSuccess && (
        <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
          ✅ Pagamento processado. A assinatura aparecerá como ativa em alguns instantes.
        </div>
      )}

      {/* Status atual */}
      <div className="rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--bg-card)] p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-[color:var(--text-muted)]">
          Status
        </p>
        <div className="mt-2 flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              isActive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                : isTrialing && daysLeft > 0
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200"
            }`}
          >
            {statusLabel(sub.status)}
          </span>
          {isTrialing && daysLeft > 0 && (
            <span className="text-sm text-[color:var(--text-secondary)]">
              {daysLeft} {daysLeft === 1 ? "dia restante" : "dias restantes"}
            </span>
          )}
        </div>
        {sub.current_period_end && isActive && (
          <p className="mt-3 text-xs text-[color:var(--text-muted)]">
            Próxima cobrança:{" "}
            {new Date(sub.current_period_end).toLocaleDateString("pt-BR")}
          </p>
        )}
      </div>

      {/* Plano */}
      <div className="rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--bg-card)] p-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold text-[color:var(--text-primary)]">
            Catavento Mensal
          </h2>
          <div className="text-right">
            <p className="text-3xl font-bold text-[color:var(--brand-primary)]">
              R$ 29
            </p>
            <p className="text-xs text-[color:var(--text-muted)]">por mês</p>
          </div>
        </div>

        <ul className="mt-6 space-y-2 text-sm text-[color:var(--text-secondary)]">
          <Feature>Projeção de caixa para 12 meses</Feature>
          <Feature>Multi-conta PF + PJ ilimitado</Feature>
          <Feature>Simulador "E se eu comprar X?"</Feature>
          <Feature>Cartões, parcelamentos e eventos planejados</Feature>
          <Feature>Assistente IA para decisões financeiras</Feature>
          <Feature>Cancele a qualquer momento</Feature>
        </ul>

        <div className="mt-6">
          <SubscriptionActions status={sub.status} />
        </div>
      </div>

      <p className="text-center text-xs text-[color:var(--text-muted)]">
        Pagamento processado de forma segura via Mercado Pago.
        <br />
        Você pode cancelar a qualquer momento — sem multa, sem fidelidade.
      </p>
    </div>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-0.5 text-[color:var(--brand-success)]">✓</span>
      <span>{children}</span>
    </li>
  );
}
