import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fullName =
    (user?.user_metadata?.full_name as string | undefined) ?? "por aí";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Olá, {fullName} 👋
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Seu dashboard de projeção financeira vai aparecer aqui em breve.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          🚧 Fase 4 — Dashboard em construção
        </p>
      </div>
    </div>
  );
}
