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
- [ ] RLS habilitado em **todas** as tabelas
- [ ] Policies revisadas (default deny)
- [ ] Service role key isolada
- [ ] Migrations versionadas

### Fase 7 — IA
- [ ] Classificação semântica de escopo
- [ ] Logs de uso (sem dados sensíveis)
- [ ] Rate limiting específico para rotas de IA
- [ ] System prompts versionados
- [ ] Tools com validação Zod nos parâmetros

## 🔁 Revisão periódica

- **Mensal:** `npm audit`, revisão de dependências, revisão de policies RLS
- **Trimestral:** revisão completa deste documento, simulação de incidente
- **Pré-lançamento:** pentest externo, revisão LGPD
