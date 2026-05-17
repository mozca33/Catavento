import Link from "next/link";
import { Logo } from "@/components/logo";

export default function PrivacidadePage() {
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
          Política de Privacidade
        </h1>
        <p className="mt-2 text-sm text-[color:var(--text-muted)]">
          Última atualização: 17 de maio de 2026
        </p>

        <div className="prose mt-8 max-w-none space-y-6 text-[color:var(--text-secondary)]">
          <Section title="1. Dados que coletamos">
            <ul className="ml-4 list-disc space-y-1">
              <li>Dados de cadastro: nome, e-mail e senha (criptografada)</li>
              <li>Dados financeiros que você insere voluntariamente: saldos,
                recorrências, parcelamentos, eventos planejados</li>
              <li>Informações de pagamento: processadas pelo Mercado Pago — não
                armazenamos dados de cartão</li>
              <li>Dados de uso: logs técnicos para diagnóstico e segurança</li>
            </ul>
          </Section>

          <Section title="2. Como usamos seus dados">
            Os dados financeiros são usados exclusivamente para gerar suas
            projeções, simulações e respostas do assistente IA. Não vendemos,
            alugamos ou compartilhamos seus dados com terceiros para fins de
            marketing.
          </Section>

          <Section title="3. Compartilhamento com terceiros">
            <p>Compartilhamos dados estritamente necessários com:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li><strong>Supabase</strong>: armazenamento e autenticação</li>
              <li><strong>Mercado Pago</strong>: processamento de pagamentos</li>
              <li><strong>Anthropic</strong>: respostas do assistente IA (apenas
                a pergunta do usuário e dados financeiros relevantes ao contexto
                — sem identificadores pessoais)</li>
              <li><strong>Vercel</strong>: hospedagem da aplicação</li>
            </ul>
          </Section>

          <Section title="4. Segurança">
            Toda comunicação usa HTTPS. Dados em repouso são criptografados pelo
            banco de dados. Aplicamos Row Level Security para garantir que cada
            usuário só acessa os próprios dados. Senhas são armazenadas com
            hash criptográfico (bcrypt).
          </Section>

          <Section title="5. Seus direitos (LGPD)">
            <p>Conforme a Lei Geral de Proteção de Dados, você tem direito a:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Acessar e exportar seus dados (formato JSON)</li>
              <li>Solicitar correção de dados incorretos</li>
              <li>Solicitar exclusão da conta e dos dados associados</li>
              <li>Revogar consentimentos a qualquer momento</li>
            </ul>
            <p className="mt-2">
              Para exercer qualquer um desses direitos, entre em contato pelo
              e-mail de suporte (a definir).
            </p>
          </Section>

          <Section title="6. Retenção de dados">
            Mantemos seus dados enquanto sua conta estiver ativa. Após a
            exclusão da conta, dados são removidos definitivamente em até 30
            dias, exceto quando obrigados a manter por lei (ex: registros
            fiscais).
          </Section>

          <Section title="7. Cookies">
            Usamos cookies essenciais para autenticação e funcionamento do
            serviço. Não usamos cookies de marketing ou rastreamento publicitário.
          </Section>

          <Section title="8. Alterações nesta política">
            Mudanças significativas serão comunicadas por e-mail ou pelo
            aplicativo com antecedência mínima de 30 dias.
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
      <div className="mt-2">{children}</div>
    </div>
  );
}
