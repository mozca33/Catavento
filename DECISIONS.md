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

## ❓ Dúvidas pra revisar com o usuário na Fase 6

### Q-001 — Login com Google/social?
Hoje só implementei e-mail/senha. Google OAuth é trivial de adicionar via Supabase. Vale agora ou só depois?

### Q-002 — Modelo de cobrança final
Stripe ou Mercado Pago? Decidir na Fase 8, mas vale alinhar antes da landing.

### Q-003 — Visual / identidade do produto
Hoje uso tema neutro (slate). Quer paleta específica? Logotipo próprio?

### Q-004 — Onboarding obrigatório?
Primeira vez logado, força configurar contas ou deixa explorar dashboard vazio?

### Q-005 — Limite de plano
Quantas contas/cartões/recorrências o trial e o plano pago permitem? Sem limite? Com limite anti-abuso?

### Q-006 — Notificações
Alertas preditivos: e-mail? push? Apenas in-app? Frequência?

### Q-007 — Backup/exportação
LGPD exige exportar dados. JSON cru ou PDF/CSV formatado também?

### Q-008 — Multi-perfil por usuário
Suporte a múltiplos "perfis financeiros" por conta (ex: meu + da empresa + da minha mãe), ou um usuário = um conjunto de dados?
**Tendência:** um usuário = um conjunto. Multi-perfil pós-MVP.

### Q-009 — Compartilhamento (casal)
Bloqueado pós-MVP, mas vale registrar: dois usuários verem o mesmo conjunto de contas.

### Q-010 — Open Finance
Vale priorizar pós-Fase 9? Custo Belvo/Pluggy começa ~R$ 3-8 por usuário/mês.
