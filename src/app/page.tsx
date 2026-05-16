import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12 text-center">
      <div className="max-w-2xl">
        <div className="text-6xl">🌬️</div>
        <h1 className="mt-6 text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          Catavento
        </h1>
        <p className="mt-4 text-xl text-slate-600 dark:text-slate-400">
          Controle financeiro que olha pra frente.
        </p>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Pra autônomos e profissionais liberais que misturam PJ e PF.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Criar conta grátis
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-50 dark:hover:bg-slate-800"
          >
            Entrar
          </Link>
        </div>
      </div>
    </main>
  );
}
