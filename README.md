# 🌬️ Catavento

> Controle financeiro que olha pra frente — pra autônomos e profissionais liberais que misturam PJ e PF.

**Status:** ✅ MVP completo (Fases 0-9 concluídas) — pronto pra deploy em produção
**Última atualização:** 2026-05-17

---

## 🎯 O que é o Catavento

Catavento é um SaaS de controle financeiro pessoal e empresarial que **começa pelo futuro**, não pelo passado. Enquanto outros apps (Mobills, Organizze, Olivia) focam em categorizar gastos já feitos, o Catavento responde a pergunta que importa de verdade:

> **"Posso comprar X agora, ou é melhor esperar?"**
> **"Como vai estar meu caixa daqui a 3 meses?"**
> **"E se eu antecipar essa compra/viagem/investimento, o que acontece?"**

---

## 💡 Posicionamento

**Para quem:** autônomos, MEIs, prestadores de serviço, profissionais liberais e qualquer pessoa que gerencia múltiplas contas (PF + PJ).

**Diferencial vs. concorrentes:**

| | Mobills/Organizze | Catavento |
|---|---|---|
| Foco | Passado (categorização) | **Futuro (projeção)** |
| Decisão de compra | Manual | **Simulador instantâneo** |
| PJ + PF | Não integrado | **Nativo, multi-conta** |
| IA | Não tem | **Chat conversacional** |

---

## ✨ Features

### Core (MVP)

#### 1. 📊 Projeção de caixa futuro
Calcula automaticamente o saldo de cada conta dia a dia pelos próximos 12 meses, considerando:
- Entradas recorrentes (salário, aluguéis recebidos, dividendos, retiradas PJ)
- Saídas recorrentes (contas fixas, faturas, condomínio)
- Parcelamentos em curso (cartão, financiamentos)
- Datas exatas de fechamento de fatura e débito automático

**Status:** ⏳ Planejado

#### 2. 🔮 Simulador "E se eu comprar X?"
Botão pra adicionar uma compra hipotética (à vista ou parcelada) e ver instantaneamente:
- Impacto no saldo nos próximos 12 meses
- Em qual fatura cai a primeira parcela
- Se viola alguma meta de saldo mínimo
- Comparação lado a lado: "comprar agora" vs "comprar mês que vem"

**Status:** ⏳ Planejado

#### 3. 🏢 Multi-conta PJ + PF
Suporte nativo pra quem mistura caixa pessoal e empresarial:
- Cadastrar múltiplas contas (PF + PJ)
- Marcar transações como PJ ou PF
- Regras de transferência recorrente (ex: "retirada de R$ 3.000 da PJ pra PF todo mês")
- Gastos fixos da PJ separados dos pessoais
- Visão consolidada e visão isolada

**Status:** ⏳ Planejado

#### 4. 🤖 IA conversacional com escopo restrito
Chat integrado com IA (Claude) que entende seu contexto financeiro real e responde perguntas em linguagem natural:
- "Posso comprar uma geladeira de R$ 4.400 em 10x agora?"
- "Quando devo agendar essa compra pra não estourar o orçamento?"
- "Quanto vou ter em julho?"
- "Quais meses tenho mais folga?"

A IA acessa seus dados reais via tools e simula cenários ao vivo.

**Restrição de escopo (segurança):** a IA tem um filtro semântico de pré-direcionamento que **rejeita inputs fora do domínio financeiro/projeção**. Camada adicional além da validação Zod nos parâmetros das tools. Tentativas de prompt injection ou usos não relacionados ao produto são bloqueados antes de chegar ao modelo principal.

**Status:** ⏳ Planejado

#### 5. 🚨 Alertas preditivos
Não espera dar problema — avisa antes:
- "Em 23 dias seu saldo Nubank fica abaixo de R$ 1.000"
- "Sua fatura de agosto vai estourar a folga média"
- "Você prometeu manter R$ 20k em julho — está R$ 2k abaixo da meta"

**Status:** ⏳ Planejado

#### 6. 💳 Cadastro de cartões e parcelamentos
- Múltiplos cartões com data de fechamento e vencimento
- Parcelamentos em curso (quantas parcelas faltam, valor)
- Faturas projetadas automaticamente
- Suporte a débito automático (data exata)

**Status:** ⏳ Planejado

---

### Features futuras (pós-MVP)

#### 📈 Investimentos integrados
Tratar rendimentos de FIIs, dividendos e renda fixa como entradas recorrentes projetadas no fluxo de caixa.

#### 🎯 Metas e eventos grandes
Planejamento de casamento, mudança, intercâmbio, compra de imóvel — com plano mês a mês de quanto guardar e quando pagar cada parcela.

#### 🔗 Open Finance
Conexão automática com bancos via Belvo/Pluggy pra puxar saldos e transações.

#### 📱 App mobile
Versão nativa iOS/Android.

#### 📑 Importação OFX/CSV
Importar extratos de bancos que não estão no Open Finance.

#### 🧾 Categorização automática com IA
Classificar transações importadas automaticamente.

#### 👥 Multi-usuário (casal/família)
Compartilhar contas e visão consolidada entre cônjuges/sócios.

---

## 🛠️ Stack técnica

| Camada | Tecnologia | Versão |
|---|---|---|
| Frontend | Next.js (App Router) + TypeScript | 16.2.6 |
| Estilo | Tailwind CSS + shadcn/ui | 4.x / 4.7 |
| Backend | Next.js API Routes / Server Actions | — |
| Banco de dados | Supabase (Postgres + RLS) | 2.105 |
| Auth | Supabase Auth (`@supabase/ssr`) | 0.10 |
| IA | Claude API (`@anthropic-ai/sdk`) | 0.96 |
| Validação | Zod | 4.4 |
| Hospedagem | Vercel | — |
| Cobrança | A decidir (Stripe ou Mercado Pago) | — |
| Mercado | Brasil (i18n preparado pra futuro) | — |

---

## 🎨 Identidade visual — Paleta "Brisa"

| Token | Hex | Uso |
|---|---|---|
| `--brand-primary` | #2563EB | Azul confiável, CTAs primários |
| `--brand-accent` | #F97066 | Coral, destaques |
| `--brand-success` | #10B981 | Verde-esmeralda, saldo positivo |
| `--brand-warning` | #F59E0B | Âmbar, alertas suaves |
| `--brand-danger` | #DC2626 | Vermelho, alertas críticos |
| `--bg-page` | #FEFCF6 | Creme suave, fundo geral |
| `--text-primary` | #0F172A | Azul-marinho profundo, texto |

**Logo:** wordmark "Catavento" + símbolo de catavento com 4 pás (azul, coral, verde, âmbar) representando as 4 cores da paleta. Componente em `src/components/logo.tsx`.

---

## 🔒 Segurança (princípios)

Detalhamento completo em [`CLAUDE.md`](./CLAUDE.md).

- ✅ Autenticação via Supabase Auth (cookies httpOnly/secure/sameSite)
- ✅ Row Level Security (RLS) em **todas** as tabelas
- ✅ Validação 100% no servidor com Zod
- ✅ Service role key nunca no client
- ✅ Headers de segurança (CSP, HSTS, etc.)
- ✅ Rate limiting em auth e IA
- ✅ IA com escopo restrito ao domínio do produto
- ✅ LGPD: exportar/deletar dados, consentimento explícito
- ✅ Dados financeiros nunca em logs

---

## 🗺️ Roadmap

| Fase | Entregável | Status |
|---|---|---|
| **0. Setup** | Repo Next.js + Supabase + Vercel + design system | ✅ Concluído |
| **1. Auth + perfil** | Login (email), signup, perfil, middleware, logout | ✅ Core concluído (2FA e rate limit pendentes) |
| **2. Modelo de dados** | Schema Postgres + RLS em todas as tabelas | ✅ Concluído |
| **3. Engine de projeção** | Cálculo de saldo dia a dia, 12 meses, cartões com closing/autopay | ✅ Concluído |
| **4. Dashboard** | Gráfico de projeção, cards de saldo PF/PJ, próximos eventos | ✅ Concluído |
| **5. Simulador "e se?"** | Compras hipotéticas com comparativo de 3, 6, 12 meses | ✅ Concluído |
| **6. Multi-conta PJ+PF** | Tags, transferências recorrentes, toggle PF/PJ/All | ✅ Concluído |
| **7. IA conversacional** | Chat com Claude + tools + filtro de escopo de 3 camadas | ✅ Concluído |
| **8. Cobrança** | Trial 7d + plano único (Mercado Pago) | ✅ Concluído |
| **9. Landing + lançamento** | Landing page, termos, privacidade, guia de deploy | ✅ Concluído |

---

## 💰 Modelo de negócio

- **Trial:** 7 dias gratuitos com acesso completo
- **Plano único mensal:** valor a definir (referência inicial: R$ 19-29/mês)
- **Sem freemium permanente** — produto premium pra quem leva planejamento a sério

---

## 📐 Princípios de design

1. **Primeira tela mostra o futuro, não o passado.** O dashboard abre com a projeção dos próximos meses.
2. **Toda decisão é simulável.** Antes de comprar, simular o impacto deve ser trivial.
3. **PJ e PF convivem.** Não é um app de PF com PJ "encaixado" — os dois mundos são cidadãos de primeira classe.
4. **A IA é assistente, não substituta.** Você decide; ela calcula, compara, alerta.
5. **Brasileiro de verdade.** PIX, débito automático, fechamento de fatura, parcelamento 10x — features que importam aqui.
6. **Segurança nunca é "depois".** Toda feature passa pelo crivo de segurança antes de chegar ao usuário.

---

## 🚀 Como rodar localmente

```bash
npm install
cp .env.example .env.local
# preencher variáveis do Supabase e Anthropic
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

---

## 📝 Changelog

### 2026-05-16
- 📄 Projeto criado
- 🎯 Posicionamento, features core e roadmap definidos
- 🛠️ Stack técnica escolhida e validada (versões reais e atuais)
- 🔒 Plano de segurança definido (ver CLAUDE.md)
- 🤖 Adicionada diretiva: IA com escopo restrito (filtro semântico pré-Zod)
- ✅ Fase 0 concluída: scaffold Next.js 16, headers de segurança, clientes Supabase/Anthropic, filtro de escopo da IA
- 🔗 Integração GitHub e Supabase CLI
- ✅ Fase 1 core: páginas de login/signup com Server Actions, validação Zod, middleware de auth, callback OAuth com proteção contra open redirect, layout autenticado, página de perfil, logout
- ✅ Fase 2: schema Postgres (profiles, accounts, credit_cards, recurring_entries, installments, planned_entries, transfer_rules) com RLS em todas as tabelas, triggers de updated_at, trigger de criação automática de profile, enums tipados
- ✅ Fase 3: engine de projeção pura (`src/lib/projection/`) — calcula saldo dia a dia para 12 meses considerando recorrências, parcelamentos, eventos planejados, transferências e datas de fatura/débito automático de cartões
- ✅ Fase 4: dashboard com gráfico (recharts), cards de saldo PF/PJ/total, lista de próximos eventos, empty state com CTA
- ✅ Fase 5: simulador "E se?" — formulário interativo client-side que recomputa projeção em tempo real e mostra comparativo de saldo em 3/6/12 meses + onde cai a 1ª parcela
- ✅ Fase 6: CRUDs de contas, recorrências e transferências recorrentes; toggle PF/PJ/Consolidado no gráfico; navegação completa

### 2026-05-17
- 🎨 Identidade visual aplicada: paleta "Brisa" (azul + coral + creme), variáveis CSS em `globals.css`
- 🌬️ Logo Catavento criado (wordmark + símbolo SVG de 4 pás)
- 🔐 Google OAuth integrado em /login e /signup (botão "Continuar com Google")
- 📋 Decisões registradas em DECISIONS.md: Google sim, onboarding opcional, paleta Brisa, notificações configuráveis pelo usuário
- 🤖 Fase 7 — IA conversacional: assistente em `/assistente` com Claude Opus 4.7 (chat) + Haiku 4.5 (classificação de escopo). Filtro de escopo em 3 camadas (sanitização → heurística anti-injection → classificação semântica). 5 tools read-only: `get_current_date`, `get_accounts_summary`, `get_upcoming_events`, `get_balance_at_date`, `simulate_purchase`. API route `/api/chat` com loop de tool use (até 5 iterações), validação Zod, e proteção contra prompt injection.
- 💸 Cobrança: confirmada Mercado Pago para Fase 8 (PIX recorrente nativo, taxa menor)
- ✅ Fase 8 — Cobrança via Mercado Pago: tabela `subscriptions` com trial automático de 7 dias (criado via trigger no signup), página `/assinatura` com status + ações de assinar/cancelar, integração `PreApproval` do MP (assinatura recorrente mensal R$ 29), webhook `/api/webhooks/mercadopago` com validação HMAC-SHA256, middleware bloqueia rotas protegidas quando trial expira sem assinatura
- 🐛 Bugfix: gráfico de projeção agora sempre renderiza linha (engine adiciona ponto no horizonte mesmo sem eventos)
- 🆕 CRUDs completos: cartões de crédito, parcelamentos, eventos planejados — todas com edit/delete
- ✅ Fase 9 — Landing + lançamento: landing page de marketing (Hero, Problema/Solução, Features, Personas, Pricing, FAQ, CTA final, Footer); páginas legais `/termos` e `/privacidade` com texto LGPD-compliant; meta tags SEO (Open Graph, keywords, descrição em PT-BR); guia completo de deploy em `DEPLOY.md`
- 🚀 MVP completo — pronto pra produção
