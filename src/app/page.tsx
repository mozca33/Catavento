import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoMark } from "@/components/logo";

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
        <div className="flex justify-center">
          <LogoMark size={80} />
        </div>
        <h1 className="mt-6 text-5xl font-bold tracking-tight text-[color:var(--text-primary)]">
          Catavento
        </h1>
        <p className="mt-4 text-xl text-[color:var(--text-secondary)]">
          Controle financeiro que olha pra frente.
        </p>
        <p className="mt-2 text-sm text-[color:var(--text-muted)]">
          Pra autônomos e profissionais liberais que misturam PJ e PF.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-lg bg-[color:var(--brand-primary)] px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-[color:var(--brand-primary-hover)]"
          >
            Criar conta grátis
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-[color:var(--border-strong)] px-6 py-3 text-sm font-medium text-[color:var(--text-primary)] transition hover:bg-[color:var(--bg-muted)]"
          >
            Entrar
          </Link>
        </div>
      </div>
    </main>
  );
}
