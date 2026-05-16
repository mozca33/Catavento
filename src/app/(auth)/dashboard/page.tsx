import Link from "next/link";
import { loadUserSnapshot } from "@/lib/queries/snapshot";
import { projectCashFlow } from "@/lib/projection/engine";
import { buildChartSeries } from "@/lib/projection/aggregate";
import { ProjectionChart } from "@/components/projection-chart";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const snapshot = await loadUserSnapshot();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const fullName =
    (user?.user_metadata?.full_name as string | undefined) ?? "por aí";

  if (!snapshot || snapshot.accounts.length === 0) {
    return <EmptyState fullName={fullName} />;
  }

  const projection = projectCashFlow(snapshot, { horizonMonths: 12 });
  const series = buildChartSeries(projection);

  // Snapshot atual: somatório de saldos por kind
  const totalPF = snapshot.accounts
    .filter((a) => a.kind === "PF")
    .reduce((s, a) => s + a.current_balance, 0);
  const totalPJ = snapshot.accounts
    .filter((a) => a.kind === "PJ")
    .reduce((s, a) => s + a.current_balance, 0);

  // Próximos 5 eventos
  const upcomingEvents = projection.events
    .filter((e) => e.date >= snapshot.accounts[0].balance_as_of)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Olá, {fullName} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Sua projeção financeira pelos próximos 12 meses
          </p>
        </div>
        <Link
          href="/simulador"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-50 dark:hover:bg-slate-800"
        >
          🔮 Simular compra
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Total" value={totalPF + totalPJ} />
        <SummaryCard label="Pessoa Física" value={totalPF} accent="emerald" />
        <SummaryCard label="Pessoa Jurídica" value={totalPJ} accent="blue" />
      </div>

      <ProjectionChart series={series} />

      <div className="grid gap-6 md:grid-cols-2">
        <UpcomingEvents events={upcomingEvents} />
        <Accounts accounts={snapshot.accounts} />
      </div>
    </div>
  );
}

function EmptyState({ fullName }: { fullName: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Olá, {fullName} 👋
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Vamos configurar seu primeiro caixa pra começar a projetar.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
        <div className="text-4xl">🏦</div>
        <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-50">
          Adicione sua primeira conta
        </h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Cadastre uma conta bancária ou carteira pra começar.
        </p>
        <Link
          href="/contas/nova"
          className="mt-6 inline-block rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          Criar conta
        </Link>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "emerald" | "blue";
}) {
  const accentClass =
    accent === "emerald"
      ? "text-emerald-700 dark:text-emerald-300"
      : accent === "blue"
        ? "text-blue-700 dark:text-blue-300"
        : "text-slate-900 dark:text-slate-50";
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-bold ${accentClass}`}>
        {formatBRL(value)}
      </p>
    </div>
  );
}

function UpcomingEvents({
  events,
}: {
  events: { date: string; description: string; amount: number }[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="font-semibold text-slate-900 dark:text-slate-50">
        Próximos eventos
      </h3>
      {events.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Nenhum evento agendado.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {events.map((e, i) => (
            <li
              key={i}
              className="flex items-center justify-between text-sm"
            >
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-50">
                  {e.description}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date(`${e.date}T00:00:00`).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <span
                className={
                  e.amount >= 0
                    ? "font-semibold text-emerald-700 dark:text-emerald-300"
                    : "font-semibold text-red-700 dark:text-red-300"
                }
              >
                {formatBRL(e.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Accounts({
  accounts,
}: {
  accounts: { id: string; name: string; current_balance: number; kind: string }[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-slate-50">
          Contas
        </h3>
        <Link
          href="/contas"
          className="text-xs text-slate-600 hover:underline dark:text-slate-400"
        >
          Ver todas
        </Link>
      </div>
      <ul className="mt-4 space-y-3">
        {accounts.slice(0, 5).map((a) => (
          <li key={a.id} className="flex items-center justify-between text-sm">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-50">
                {a.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {a.kind}
              </p>
            </div>
            <span className="font-semibold text-slate-900 dark:text-slate-50">
              {formatBRL(a.current_balance)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function formatBRL(v: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v);
}
