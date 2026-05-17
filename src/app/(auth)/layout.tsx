import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/logo";

const NAV_ITEMS: { href: string; label: string }[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/contas", label: "Contas" },
  { href: "/cartoes", label: "Cartões" },
  { href: "/recorrencias", label: "Recorrências" },
  { href: "/parcelamentos", label: "Parcelamentos" },
  { href: "/planejados", label: "Planejados" },
  { href: "/transferencias", label: "Transferências" },
  { href: "/simulador", label: "Simulador" },
  { href: "/assistente", label: "Assistente" },
];

function firstName(full?: string | null, fallbackEmail?: string | null): string {
  if (full && full.trim()) {
    return full.trim().split(/\s+/)[0];
  }
  if (fallbackEmail) {
    return fallbackEmail.split("@")[0];
  }
  return "você";
}

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const fullName = (user.user_metadata?.full_name as string | undefined) ?? null;
  const displayName = firstName(fullName, user.email);

  return (
    <div className="min-h-screen bg-[color:var(--bg-page)]">
      <header className="border-b border-[color:var(--border-default)] bg-[color:var(--bg-card)]">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link href="/dashboard" aria-label="Catavento" className="shrink-0">
            <Logo size={24} />
          </Link>

          <nav className="min-w-0 flex-1 overflow-x-auto">
            <div className="flex gap-1 whitespace-nowrap">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-[color:var(--text-secondary)] transition hover:bg-[color:var(--bg-muted)] hover:text-[color:var(--text-primary)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/configuracoes"
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-[color:var(--text-primary)] hover:bg-[color:var(--bg-muted)]"
            >
              {displayName}
            </Link>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="rounded-lg px-3 py-1.5 text-sm text-[color:var(--text-secondary)] hover:bg-[color:var(--bg-muted)]"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
