import Link from "next/link";
import { loadUserSnapshot } from "@/lib/queries/snapshot";
import { Simulator } from "./simulator";

export default async function SimuladorPage() {
  const snapshot = await loadUserSnapshot();

  if (!snapshot || snapshot.accounts.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Simulador "E se?"
        </h1>
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-slate-600 dark:text-slate-400">
            Você precisa de pelo menos uma conta cadastrada pra simular.
          </p>
          <Link
            href="/contas/nova"
            className="mt-4 inline-block text-sm font-medium text-slate-900 underline dark:text-slate-50"
          >
            Criar conta
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-slate-600 hover:underline dark:text-slate-400"
        >
          ← Voltar
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">
          Simulador "E se?"
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Adicione uma compra hipotética e veja o impacto sem salvar nada.
        </p>
      </div>

      <Simulator snapshot={snapshot} />
    </div>
  );
}
