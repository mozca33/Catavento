# Segurança — Catavento

Documentação operacional de segurança. Princípios em `CLAUDE.md`.

## 📞 Reportar vulnerabilidade

Antes do lançamento público, definir canal (e-mail dedicado tipo `security@catavento.app`).

## 🔍 Vulnerabilidades conhecidas e aceitas

### postcss < 8.5.10 (transitiva via Next.js)
- **Severidade:** moderate
- **Advisory:** GHSA-qx2v-qp2m-jg93 (XSS via unescaped `</style>` em CSS stringify)
- **Impacto real:** baixo. Não processamos CSS de input do usuário em runtime; PostCSS roda apenas em build com fontes confiáveis (arquivos do projeto).
- **Mitigação:** aguardar release do Next.js com postcss atualizado. `npm audit fix --force` faria downgrade do Next pra v9 — inaceitável.
- **Revisão:** mensal.

### Fase 8 — Cobrança (Mercado Pago)
- [x] Access token do MP apenas server-side (`server-only`)
- [x] Webhook valida assinatura HMAC-SHA256 com `timingSafeEqual` (anti-timing attack)
- [x] Service role key isolada em `createAdminClient()` — usada só em webhook e actions específicas
- [x] Tabela `subscriptions` com RLS — usuário só lê a própria
- [x] Mutações só via service role (impossível pelo client)
- [x] Trial criado automaticamente via trigger (não confia em input do client)
- [x] Middleware bloqueia rotas protegidas se sem assinatura ativa
- [x] Rotas sempre permitidas: `/assinatura`, `/profile`, `/auth`, `/api/webhooks`
- [x] Open redirect bloqueado em `back_url` do checkout (usa NEXT_PUBLIC_APP_URL controlado)
- [x] Confirmação no client antes de cancelar
- [ ] Rate limiting no webhook (futuro)
- [ ] Logs de auditoria de mudanças de status (futuro)

## ✅ Checklist por fase

Conforme cada fase do roadmap é concluída, marcar aqui os itens implementados.

### Fase 0 — Setup
- [x] `.env*` no `.gitignore`
- [x] `.env.example` com placeholders
- [x] Headers de segurança em `next.config.ts` (HSTS, X-Frame-Options, etc.)
- [x] Header `X-Powered-By` desabilitado
- [x] React Strict Mode habilitado
- [x] Cliente Anthropic com `server-only`
- [x] Filtro de escopo da IA (etapas 1 e 2: sanitização e detecção de injection)
- [ ] Filtro de escopo da IA (etapa 3: classificação semântica) — Fase 7
- [ ] CSP completa — adicionar conforme features (Supabase, Anthropic, etc.)

### Fase 1 — Auth
- [x] Supabase Auth via `@supabase/ssr`
- [x] Middleware protege rotas autenticadas
- [x] Cookies httpOnly/secure/sameSite (gerenciado pelo `@supabase/ssr`)
- [x] Política de senha forte (Zod: min 8, maiúscula, minúscula, número)
- [x] Validação 100% server-side (Zod em Server Actions)
- [x] Mensagens genéricas de erro (não vaza se e-mail existe)
- [x] Callback OAuth com proteção contra open redirect
- [ ] Rate limiting em rotas de auth — pendente (Upstash)
- [ ] 2FA TOTP — pendente (pré-lançamento)

### Fase 2 — Modelo de dados
- [x] RLS habilitado em **todas** as tabelas (profiles, accounts, credit_cards, recurring_entries, installments, planned_entries, transfer_rules)
- [x] Policies revisadas: cada tabela tem select/insert/update/delete restritas a `auth.uid() = user_id`
- [x] Constraints de integridade (CHECK constraints em valores, datas, day-of-month)
- [x] Foreign keys com `on delete cascade` apropriados
- [x] Trigger de criação automática de profile via `security definer`
- [x] Service role key isolada (não usada no app, só pra migrations)
- [x] Migrations versionadas em `supabase/migrations/`

### Fase 3-6 — Aplicação
- [x] Engine de projeção 100% pura (sem efeitos colaterais, sem acesso a BD)
- [x] Validação Zod em todas as Server Actions (accounts, recurring_entries, transfer_rules)
- [x] Mensagens de erro genéricas (não vaza estrutura interna)
- [x] Server Actions verificam `auth.getUser()` antes de qualquer operação
- [x] Inserção sempre com `user_id` do usuário autenticado (não confia em input)
- [x] Componentes simulador rodam apenas em memória do client — nada é salvo

### Fase 7 — IA
- [x] Classificação semântica de escopo (via Claude Haiku 4.5)
- [x] Detecção heurística de prompt injection (regex patterns)
- [x] Sanitização Unicode (NFKC) e limite de tamanho (2000 chars)
- [x] Tools com validação Zod nos parâmetros
- [x] Tools read-only — nenhuma mutação no banco
- [x] System prompts versionados em `src/lib/ai/system-prompt.ts`
- [x] API key Anthropic apenas server-side (`server-only` import)
- [x] Histórico de chat limitado a 40 mensagens (anti-abuso)
- [x] Iterações de tool use limitadas a 5 (anti-loop)
- [x] Mensagens genéricas em refusal/blocked (não vaza system prompt)
- [ ] Rate limiting específico para rotas de IA — pendente (Upstash)
- [ ] Logs de uso pra auditoria — pendente (após decisão de observability)

## 🔁 Revisão periódica

- **Mensal:** `npm audit`, revisão de dependências, revisão de policies RLS
- **Trimestral:** revisão completa deste documento, simulação de incidente
- **Pré-lançamento:** pentest externo, revisão LGPD
