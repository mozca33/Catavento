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

## ❓ Dúvidas restantes — re-explicadas e pendentes

### Q-002 — Cobrança: Stripe ou Mercado Pago?
Quando lançarmos com plano pago, precisamos de um processador de pagamentos. **O que isso significa na prática:**
- **Stripe**: cobrança internacional, suporta cartão + PIX, taxa ~4-5% por transação. Vantagem: dashboard ótimo, fácil de programar, aceita cartões internacionais.
- **Mercado Pago**: brasileiro, taxa ~3% (pode ser menor), PIX recorrente nativo. Vantagem: melhor pra quem usa só BRL e clientes Brasil.
- **Pode decidir na Fase 8**, mas vale pensar agora.

### Q-005 — Limites do plano
Pra evitar abuso (ex: alguém criar 10.000 contas e quebrar performance), pode haver limites técnicos. **Sugestão**:
- Trial 7 dias: tudo liberado
- Plano pago: sem limite na prática (limites técnicos só anti-abuso, ex: 100 contas, 500 recorrências)
- **Decisão pendente**: definir esses limites antes do lançamento.

### Q-007 — Exportação de dados (LGPD)
Lei brasileira obriga deixar usuário baixar todos os dados dele. **Formato**:
- JSON cru (técnico): obrigatório
- CSV / PDF formatado: opcional, mas torna o produto melhor
- **Decisão pendente**: implementar antes do lançamento. Por ora, JSON basta.

### Q-008 — Múltiplos "livros" por usuário?
Hoje, 1 usuário = 1 conjunto de contas. Cenário futuro: você quer gerenciar sua vida financeira + a da sua mãe + a da empresa do seu amigo na mesma conta? Isso são "perfis financeiros" separados sob o mesmo login.
- **Tendência**: deixar pós-MVP. 1 usuário = 1 livro no início.

### Q-009 — Compartilhamento (ex: casal)
Você e sua esposa Julia logarem com contas diferentes mas verem/editarem o mesmo conjunto de dados financeiros do casamento/casa.
- **Tendência**: deixar pós-MVP. Mas vale considerar pra v2 dado que vocês são casal.

### Q-010 — Open Finance (sincronização automática com banco)
Belvo e Pluggy são serviços que conectam ao seu banco e puxam saldo + transações automaticamente, via Open Finance (regulado pelo BC).
- Vantagem: usuário não precisa atualizar saldo manualmente
- Custo: ~R$ 3-8 por usuário/mês (impacta margem)
- **Tendência**: implementar pós-Fase 9, quando tivermos base paga. Diferencial forte mas custoso.
