import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo, LogoMark } from "@/components/logo";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[color:var(--bg-page)]">
      <Header />
      <Hero />
      <Problem />
      <Features />
      <ForWho />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}

function Header() {
  return (
    <header className="border-b border-[color:var(--border-default)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Logo size={26} />
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-[color:var(--text-primary)] hover:bg-[color:var(--bg-muted)]"
          >
            Entrar
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-[color:var(--brand-primary)] px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-[color:var(--brand-primary-hover)]"
          >
            Criar conta grátis
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
      <div className="mx-auto mb-8 flex justify-center">
        <LogoMark size={64} />
      </div>
      <p className="text-sm font-medium uppercase tracking-wider text-[color:var(--brand-primary)]">
        Para autônomos, MEIs e profissionais liberais
      </p>
      <h1 className="mt-4 text-5xl font-bold leading-tight tracking-tight text-[color:var(--text-primary)] sm:text-6xl">
        Controle financeiro que <br className="hidden sm:inline" />
        <span className="text-[color:var(--brand-primary)]">olha pra frente</span>
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-[color:var(--text-secondary)] sm:text-xl">
        Pare de adivinhar se vai sobrar dinheiro no fim do mês. Veja sua
        projeção de caixa para os próximos 12 meses — com PJ, PF, cartões e
        parcelamentos em um lugar só.
      </p>
      <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Link
          href="/signup"
          className="rounded-lg bg-[color:var(--brand-primary)] px-8 py-4 text-base font-medium text-white shadow-sm hover:bg-[color:var(--brand-primary-hover)]"
        >
          Começar grátis por 7 dias
        </Link>
        <p className="text-sm text-[color:var(--text-muted)]">
          Sem cartão de crédito · Cancele quando quiser
        </p>
      </div>
    </section>
  );
}

function Problem() {
  return (
    <section className="border-y border-[color:var(--border-default)] bg-[color:var(--bg-muted)] py-20">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-3xl font-bold text-[color:var(--text-primary)] sm:text-4xl">
          Apps financeiros olham pro passado.
          <br />
          <span className="text-[color:var(--brand-accent)]">
            O que você precisa é olhar pra frente.
          </span>
        </h2>
        <div className="mt-12 grid gap-8 text-left sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[color:var(--text-muted)]">
              Mobills · Organizze · Olivia
            </p>
            <h3 className="mt-2 text-xl font-semibold text-[color:var(--text-primary)]">
              Categorizam o que já gastou
            </h3>
            <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
              Bom pra fazer o &quot;raio-X&quot; do mês passado. Mas não ajuda a
              decidir se você pode comprar uma geladeira em 10x agora.
            </p>
          </div>
          <div className="rounded-2xl bg-white p-6 dark:bg-slate-900">
            <p className="text-xs font-medium uppercase tracking-wider text-[color:var(--brand-primary)]">
              Catavento
            </p>
            <h3 className="mt-2 text-xl font-semibold text-[color:var(--text-primary)]">
              Projeta seu caixa daqui pra frente
            </h3>
            <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
              Mostra o saldo previsto em cada conta nos próximos 12 meses.
              Simula compras antes de fazer. Avisa antes de você quebrar.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: "📊",
      title: "Projeção de 12 meses",
      desc: "Saldo dia a dia em cada conta, considerando recorrências, parcelamentos e cartões com datas reais de fechamento.",
    },
    {
      icon: "🔮",
      title: "Simulador \"E se?\"",
      desc: "Adicione uma compra hipotética e veja o impacto em 3, 6 e 12 meses. Compare comprar agora vs mês que vem.",
    },
    {
      icon: "🏢",
      title: "PJ + PF integrados",
      desc: "Multi-conta nativo. Tag em cada gasto, regras de transferência mensal, visão consolidada e isolada.",
    },
    {
      icon: "🤖",
      title: "Assistente IA",
      desc: "Pergunte em português: \"posso comprar uma geladeira?\" — a IA acessa seus dados reais e responde com números.",
    },
    {
      icon: "🚨",
      title: "Alertas preditivos",
      desc: "Avisa antes do problema, não depois. \"Em 23 dias seu saldo fica negativo\" — tempo de agir.",
    },
    {
      icon: "💳",
      title: "Cartões com fatura real",
      desc: "Configure fechamento, vencimento, débito automático. As parcelas caem na fatura certa, no dia certo.",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-[color:var(--brand-primary)]">
          O que tem dentro
        </p>
        <h2 className="mt-2 text-3xl font-bold text-[color:var(--text-primary)] sm:text-4xl">
          Tudo que falta nos outros apps
        </h2>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--bg-card)] p-6"
          >
            <div className="text-3xl">{f.icon}</div>
            <h3 className="mt-4 text-lg font-semibold text-[color:var(--text-primary)]">
              {f.title}
            </h3>
            <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ForWho() {
  const personas = [
    {
      title: "Autônomos e MEIs",
      desc: "Você mistura caixa pessoal e da empresa. Recebe em datas diferentes. Faz retiradas mensais. O Catavento entende isso.",
    },
    {
      title: "Profissionais liberais",
      desc: "Médicos, dentistas, advogados, designers, devs. Sua receita varia, mas suas contas não. Saiba quando vai apertar antes de apertar.",
    },
    {
      title: "Casais com objetivos",
      desc: "Planejando casamento, mudança, viagem ou compra grande? Veja exatamente quando vai dar pra pagar — sem surpresas.",
    },
  ];

  return (
    <section className="border-y border-[color:var(--border-default)] bg-[color:var(--bg-muted)] py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-[color:var(--brand-primary)]">
            Pra quem é
          </p>
          <h2 className="mt-2 text-3xl font-bold text-[color:var(--text-primary)] sm:text-4xl">
            Feito pra quem tem renda variável
          </h2>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {personas.map((p) => (
            <div key={p.title} className="rounded-2xl bg-white p-6 dark:bg-slate-900">
              <h3 className="text-lg font-semibold text-[color:var(--text-primary)]">
                {p.title}
              </h3>
              <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="precos" className="mx-auto max-w-3xl px-4 py-20">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-[color:var(--brand-primary)]">
          Preço
        </p>
        <h2 className="mt-2 text-3xl font-bold text-[color:var(--text-primary)] sm:text-4xl">
          Um plano. Sem pegadinha.
        </h2>
      </div>

      <div className="mt-12 rounded-3xl border-2 border-[color:var(--brand-primary)] bg-[color:var(--bg-card)] p-8 shadow-lg">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-[color:var(--text-primary)]">
            Catavento Mensal
          </h3>
          <div className="mt-4">
            <span className="text-5xl font-bold text-[color:var(--brand-primary)]">
              R$ 29
            </span>
            <span className="text-base text-[color:var(--text-muted)]">/mês</span>
          </div>
          <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
            7 dias grátis · sem cartão · cancele a qualquer momento
          </p>
        </div>

        <ul className="mt-8 space-y-3 text-sm">
          {[
            "Projeção de caixa para 12 meses",
            "Multi-conta PF + PJ ilimitado",
            "Simulador \"E se eu comprar X?\"",
            "Cartões, parcelamentos e eventos planejados",
            "Assistente IA para decisões financeiras",
            "Alertas preditivos",
          ].map((feat) => (
            <li key={feat} className="flex items-start gap-2">
              <span className="mt-0.5 text-[color:var(--brand-success)]">✓</span>
              <span className="text-[color:var(--text-primary)]">{feat}</span>
            </li>
          ))}
        </ul>

        <Link
          href="/signup"
          className="mt-8 block w-full rounded-lg bg-[color:var(--brand-primary)] py-3 text-center text-sm font-medium text-white shadow-sm hover:bg-[color:var(--brand-primary-hover)]"
        >
          Começar trial de 7 dias
        </Link>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    {
      q: "Como funciona o trial de 7 dias?",
      a: "Você cria a conta e tem acesso a tudo por 7 dias, sem precisar cadastrar cartão. Se gostar, assina por R$ 29/mês. Se não, é só deixar expirar — não cobramos nada.",
    },
    {
      q: "Posso cancelar a qualquer momento?",
      a: "Sim. Sem multa, sem fidelidade. Você cancela direto no app e mantém acesso até o fim do período pago.",
    },
    {
      q: "Meus dados financeiros estão seguros?",
      a: "Sim. Usamos criptografia em trânsito e em repouso, Row Level Security no banco (cada usuário só acessa os próprios dados), e nunca pedimos suas credenciais bancárias — você atualiza saldos manualmente.",
    },
    {
      q: "Vocês conectam com meu banco?",
      a: "Ainda não. Você atualiza os saldos quando quiser. Integração via Open Finance está no roadmap.",
    },
    {
      q: "Funciona para MEI / Pessoa Jurídica?",
      a: "Foi pensado exatamente pra isso. Você pode cadastrar contas PF e PJ separadas, com transferências recorrentes entre elas (ex: pró-labore mensal).",
    },
    {
      q: "Qual a diferença do Mobills/Organizze?",
      a: "Eles focam em categorizar gastos passados. O Catavento foca em projetar o futuro: o que vai sobrar daqui a 3 meses se você comprar X hoje? Resposta em 2 segundos.",
    },
  ];

  return (
    <section className="border-t border-[color:var(--border-default)] py-20">
      <div className="mx-auto max-w-3xl px-4">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-[color:var(--brand-primary)]">
            Dúvidas
          </p>
          <h2 className="mt-2 text-3xl font-bold text-[color:var(--text-primary)] sm:text-4xl">
            Perguntas frequentes
          </h2>
        </div>
        <div className="mt-12 space-y-4">
          {items.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-[color:var(--border-default)] bg-[color:var(--bg-card)] p-6"
            >
              <summary className="flex cursor-pointer items-center justify-between text-base font-medium text-[color:var(--text-primary)]">
                {item.q}
                <span className="ml-4 text-[color:var(--text-muted)] transition group-open:rotate-180">
                  ⌄
                </span>
              </summary>
              <p className="mt-3 text-sm text-[color:var(--text-secondary)]">
                {item.a}
              </p>
            </details>
          ))}
        </div>

        <div className="mt-16 rounded-3xl bg-[color:var(--text-primary)] p-12 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Pronto pra parar de adivinhar?
          </h2>
          <p className="mt-3 text-[color:var(--text-muted)]">
            7 dias grátis. Sem cartão de crédito.
          </p>
          <Link
            href="/signup"
            className="mt-8 inline-block rounded-lg bg-[color:var(--brand-primary)] px-8 py-4 text-base font-medium text-white shadow-sm hover:bg-[color:var(--brand-primary-hover)]"
          >
            Começar agora
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[color:var(--border-default)] bg-[color:var(--bg-muted)]">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Logo size={22} />
            <p className="mt-3 max-w-md text-sm text-[color:var(--text-secondary)]">
              Controle financeiro que olha pra frente. Feito no Brasil para
              autônomos e profissionais liberais.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-[color:var(--text-secondary)] sm:items-end">
            <Link href="/login" className="hover:underline">
              Entrar
            </Link>
            <Link href="/signup" className="hover:underline">
              Criar conta
            </Link>
            <Link href="/termos" className="hover:underline">
              Termos
            </Link>
            <Link href="/privacidade" className="hover:underline">
              Privacidade
            </Link>
          </div>
        </div>
        <p className="mt-8 border-t border-[color:var(--border-default)] pt-8 text-center text-xs text-[color:var(--text-muted)]">
          © {new Date().getFullYear()} Catavento. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
