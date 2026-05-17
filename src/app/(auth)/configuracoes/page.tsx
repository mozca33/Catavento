import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSubscription, statusLabel } from "@/lib/queries/subscription";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const sub = await getCurrentSubscription();

  const fullName = (user?.user_metadata?.full_name as string | undefined) ?? "—";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[color:var(--text-primary)]">
          Configurações
        </h1>
        <p className="mt-1 text-sm text-[color:var(--text-secondary)]">
          Sua conta, assinatura e preferências
        </p>
      </div>

      <Section title="Perfil">
        <Row label="Nome" value={fullName} />
        <Row label="E-mail" value={user?.email ?? "—"} />
        <Row
          label="Membro desde"
          value={
            user?.created_at
              ? new Date(user.created_at).toLocaleDateString("pt-BR")
              : "—"
          }
        />
        <Action href="/profile" label="Editar perfil →" />
      </Section>

      <Section title="Assinatura">
        <Row
          label="Status"
          value={sub ? statusLabel(sub.status) : "—"}
        />
        <Row
          label="Plano"
          value={
            sub
              ? `${sub.plan === "monthly" ? "Mensal" : sub.plan} — R$ ${sub.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
              : "—"
          }
        />
        <Action href="/assinatura" label="Gerenciar assinatura →" />
      </Section>

      <Section title="Notificações">
        <p className="text-sm text-[color:var(--text-secondary)]">
          Alertas preditivos e lembretes. Em breve você poderá escolher entre
          e-mail, push e in-app.
        </p>
        <p className="mt-2 text-xs text-[color:var(--text-muted)]">
          🚧 Em desenvolvimento
        </p>
      </Section>

      <Section title="Dados e privacidade (LGPD)">
        <p className="text-sm text-[color:var(--text-secondary)]">
          Você tem direito a exportar todos os seus dados ou solicitar a
          exclusão completa da conta.
        </p>
        <div className="mt-4 flex flex-col gap-2 text-sm">
          <span className="text-[color:var(--text-muted)]">
            🚧 Exportação de dados (JSON) — em desenvolvimento
          </span>
          <span className="text-[color:var(--text-muted)]">
            🚧 Exclusão de conta — em desenvolvimento
          </span>
        </div>
      </Section>

      <Section title="Avançado">
        <p className="text-sm text-[color:var(--text-secondary)]">
          Configurações de cartões de crédito (datas de fechamento, débito automático e limites).
        </p>
        <Action href="/cartoes" label="Gerenciar cartões →" />
      </Section>

      <Section title="Aparência">
        <p className="text-sm text-[color:var(--text-secondary)]">
          O tema (claro/escuro) segue a configuração do seu sistema
          operacional. Para mudar, ajuste nas preferências do Windows ou
          navegador.
        </p>
      </Section>

      <Section title="Segurança">
        <Row label="Autenticação de dois fatores" value="Não habilitada" />
        <p className="mt-2 text-xs text-[color:var(--text-muted)]">
          🚧 2FA será habilitado antes do lançamento público
        </p>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--bg-card)] p-6">
      <h2 className="text-lg font-semibold text-[color:var(--text-primary)]">
        {title}
      </h2>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-[color:var(--border-default)] pb-2 text-sm last:border-b-0 last:pb-0">
      <span className="text-[color:var(--text-secondary)]">{label}</span>
      <span className="text-[color:var(--text-primary)]">{value}</span>
    </div>
  );
}

function Action({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-block pt-2 text-sm font-medium text-[color:var(--brand-primary)] hover:underline"
    >
      {label}
    </Link>
  );
}
