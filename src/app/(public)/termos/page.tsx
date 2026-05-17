import Link from "next/link";
import { Logo } from "@/components/logo";

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-[color:var(--bg-page)]">
      <header className="border-b border-[color:var(--border-default)]">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/">
            <Logo size={24} />
          </Link>
          <Link href="/login" className="text-sm text-[color:var(--text-secondary)] hover:underline">
            Entrar
          </Link>
        </div>
      </header>
      <article className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold text-[color:var(--text-primary)]">
          Termos de Uso
        </h1>
        <p className="mt-2 text-sm text-[color:var(--text-muted)]">
          Última atualização: 17 de maio de 2026
        </p>

        <div className="prose mt-8 max-w-none space-y-6 text-[color:var(--text-secondary)]">
          <Section title="1. Sobre o serviço">
            O Catavento é um software como serviço (SaaS) que oferece
            ferramentas de controle financeiro pessoal e empresarial, incluindo
            projeção de caixa, simulação de compras, e assistente baseado em
            inteligência artificial.
          </Section>

          <Section title="2. Conta e responsabilidades">
            Você é responsável por manter a confidencialidade da sua senha e por
            todas as atividades realizadas na sua conta. Os dados financeiros
            inseridos são de inteira responsabilidade do usuário — o Catavento
            não verifica nem valida valores.
          </Section>

          <Section title="3. Pagamento e cancelamento">
            O serviço oferece 7 dias de teste gratuito. Após esse período, é
            cobrada uma assinatura mensal de R$ 29,00 processada via Mercado
            Pago. Você pode cancelar a qualquer momento sem multa — mantendo
            acesso até o fim do período pago.
          </Section>

          <Section title="4. Limitação de responsabilidade">
            O Catavento é uma ferramenta de apoio à tomada de decisão
            financeira. Nenhum conteúdo do aplicativo, incluindo respostas do
            assistente IA, constitui aconselhamento financeiro, contábil ou
            jurídico. Decisões baseadas nas projeções são de inteira
            responsabilidade do usuário.
          </Section>

          <Section title="5. Suspensão ou encerramento">
            Reservamo-nos o direito de suspender ou encerrar contas que violem
            estes termos, usem o serviço de forma fraudulenta, ou tentem
            comprometer a segurança da plataforma.
          </Section>

          <Section title="6. Alterações nos termos">
            Podemos atualizar estes termos. Mudanças significativas serão
            comunicadas por e-mail ou pelo próprio aplicativo com antecedência
            mínima de 30 dias.
          </Section>

          <Section title="7. Contato">
            Para dúvidas sobre estes termos, entre em contato pelo e-mail de
            suporte (a definir).
          </Section>
        </div>
      </article>
    </main>
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
    <div>
      <h2 className="text-xl font-semibold text-[color:var(--text-primary)]">
        {title}
      </h2>
      <p className="mt-2">{children}</p>
    </div>
  );
}
