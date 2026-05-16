import Link from "next/link";

export default function OnboardingPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Bem-vindo ao Catavento 🌬️
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Vamos configurar seu controle financeiro em 3 passos.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          🚧 Fluxo de onboarding em construção
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-block text-sm font-medium text-slate-900 underline dark:text-slate-50"
        >
          Pular pro dashboard
        </Link>
      </div>
    </div>
  );
}
