# Decisões e dúvidas em aberto

Registro de decisões tomadas durante o desenvolvimento e questões a revisar com o usuário.

---

## ✅ Decisões tomadas (a confirmar)

### D-001 — Moeda
**Decisão:** BRL apenas no MVP, mas schema tem coluna `currency` pra futuro.
**Quando revisar:** quando partirmos pra i18n/multi-mercado.

### D-002 — Histórico de transações
**Decisão:** MVP **não** registra transações passadas individualmente. Cada conta tem `current_balance` + `balance_as_of` (data). Usuário atualiza o saldo manualmente quando quiser; a projeção parte daí pra frente.
**Razão:** simplicidade radical; foco no futuro, não no passado. Integração Open Finance no futuro fará import automático.
**Quando revisar:** Fase 6 ou quando Open Finance entrar.

### D-003 — Frequências recorrentes suportadas
**Decisão:** MVP suporta `monthly` e `yearly` apenas (cobre 95% dos casos: aluguel, condomínio, IPTU, anuidades).
**Quando revisar:** se algum beta-tester pedir semanal/quinzenal.

### D-004 — Tratamento de fins de semana/feriados
**Decisão:** MVP aplica eventos na data literal, sem ajustar pra dia útil seguinte.
**Por quê:** complexidade alta (calendário de feriados BR varia por estado/município), e usuário ajusta manualmente se necessário.
**Quando revisar:** pós-MVP com feedback.

### D-005 — Biblioteca de gráficos
**Decisão:** `recharts` — popular, leve, boa integração com React/Next.js.
**Quando revisar:** se performance virar problema.

### D-006 — Categorias
**Decisão:** MVP não exige categorização. Cada entrada tem descrição livre + tipo (entrada/saída). Categorias automáticas via IA virão pós-MVP.

### D-007 — Cartões podem ser PF ou PJ
**Decisão:** cartão tem `kind` (PF/PJ) e está ligado a uma `account` que paga. Despesas no cartão herdam o `kind` do cartão.

### D-008 — Saldo "como em [data]"
**Decisão:** `accounts.balance_as_of` é a data a partir da qual a projeção começa. Se o usuário não atualizar, fica defasado e ele vê aviso.

### D-009 — Edição de perfil (Fase 1)
**Decisão:** placeholder no MVP. Só leitura. Edição real virá depois.

---

## ✅ Decisões definidas pelo usuário (2026-05-17)

### Q-001 — Login com Google → **SIM, implementar**
Botão "Continuar com Google" adicionado a `/login` e `/signup`. Requer config externa (ver instruções no chat).

### Q-003 — Identidade visual → **Paleta "Brisa" + wordmark com símbolo**
- Primária: #2563EB (azul confiável)
- Acento: #F97066 (coral)
- Sucesso: #10B981 (verde-esmeralda)
- Alerta: #F59E0B (âmbar)
- Fundo: #FEFCF6 (creme suave)
- Texto: #0F172A
- Logo: catavento de 4 pás coloridas + wordmark "Catavento"
- Variáveis CSS em `src/app/globals.css`; componente `Logo`/`LogoMark` em `src/components/logo.tsx`

### Q-004 — Onboarding → **Opcional**
Após signup, usuário vai direto pro dashboard. Se não tem contas, vê empty state com CTA "Adicionar primeira conta" (não bloqueia, só sugere).

### Q-006 — Notificações → **Configuráveis pelo usuário**
Construir UI de preferências onde o usuário escolhe: e-mail / push (futuro) / só in-app. Tabela `notification_preferences` será adicionada quando implementarmos alertas preditivos (Fase 7+).

## ✅ Decisões confirmadas (2026-05-17)

### Q-002 — Cobrança → **Mercado Pago**
Brasil-only no MVP, PIX recorrente nativo, taxa menor (~3%). Implementação na Fase 8.

### Q-005 — Limites técnicos → **Generosos (anti-abuso)**
- Máximo 100 contas por usuário
- Máximo 50 cartões por usuário
- Máximo 500 recorrências por usuário
- Máximo 1000 parcelamentos ativos
- Máximo 1000 eventos planejados
Implementar via CHECK constraint ou validação na criação. Decidido antes do lançamento.

### Q-007 — Exportação LGPD → **JSON apenas no MVP**
Endpoint `/api/me/export` que devolve todos os dados do usuário em JSON. CSV/PDF se houver pedido.

### Q-008 — Multi-perfis por usuário → **Pós-MVP** (não decidido ainda, manter como possibilidade)

### Q-009 — Compartilhamento (casal) → **SIM, pós-MVP**
Permitir 2+ usuários compartilharem o mesmo conjunto de dados (importante pra casais que gerenciam finanças juntos). Implementação após validação inicial.

### Q-010 — Open Finance → **SIM, pós-MVP**
Integração com Belvo/Pluggy pra sync automático com bancos. Implementação após base paga estável (custo ~R$ 3-8/usuário/mês).
