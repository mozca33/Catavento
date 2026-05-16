# CLAUDE.md — Diretivas do projeto Catavento

Este arquivo guia toda contribuição (humana ou IA) ao código do Catavento. Leia antes de qualquer mudança.

---

## 🎯 O que é o Catavento

SaaS de controle financeiro focado em **projeção de caixa futuro** pra autônomos/profissionais liberais que misturam PJ e PF. Diferencial: simulador "e se eu comprar X?", IA conversacional, multi-conta nativa.

Detalhes do produto, features e roadmap: ver `README.md`.

---

## 📜 Diretivas obrigatórias

### D1. README sempre atualizado
**Toda alteração que afeta funcionalidade, stack, status de fase ou roadmap exige atualização do `README.md` na mesma mudança.**
- Status de features (⏳ → 🚧 → ✅) atualizado conforme implementação
- Versões de pacotes mantidas sincronizadas com `package.json`
- Changelog ao final do README com data e resumo da mudança
- Novas features adicionadas à seção apropriada

### D2. Segurança não é opcional
Toda feature passa pelo crivo de segurança **antes** de ser considerada pronta. Princípios em "Segurança" abaixo.

### D3. IA com escopo restrito
Toda interação com Claude API tem **dois filtros**:
1. **Filtro semântico de pré-direcionamento** (camada adicional): rejeita inputs fora do domínio financeiro antes de enviar ao modelo principal
2. **Validação Zod** nos parâmetros de tools antes da execução

Inputs do usuário **nunca** são concatenados diretamente em system prompts. Tools da IA são read/simulate-only por padrão — mutações exigem confirmação explícita na UI.

### D4. Bibliotecas reais e verificadas
Antes de adicionar qualquer dependência: verificar que existe no npm registry, qual a versão estável atual e se tem manutenção ativa. Não inventar pacotes.

### D5. Tipagem estrita
TypeScript em modo strict. Nada de `any` sem justificativa em comentário. Tipos derivados do schema do Supabase via codegen.

### D6. Server-first
Por padrão, lógica e dados ficam em Server Components / Server Actions. Client Components só onde há interatividade real.

---

## 🔒 Segurança — checklist obrigatório

### Autenticação e sessão
- [ ] Supabase Auth via `@supabase/ssr` (não usar `auth-helpers-nextjs` deprecated)
- [ ] Cookies: `httpOnly`, `secure`, `sameSite=lax`
- [ ] Middleware Next.js protege rotas autenticadas
- [ ] 2FA TOTP habilitado antes do lançamento

### Autorização (RLS)
- [ ] **Row Level Security habilitado em TODAS as tabelas** — sem exceção
- [ ] Policy padrão: `auth.uid() = user_id`
- [ ] Service role key **nunca** vai pro client (só server-side específico)
- [ ] Audit log em operações sensíveis (mudança de email, exportação, deleção)

### Validação de input
- [ ] Zod valida 100% dos inputs em Server Actions e API Routes
- [ ] Validação acontece **no servidor** mesmo que já valide no client
- [ ] Strings que vão pra IA passam por sanitização adicional

### Segredos
- [ ] `.env.local` no `.gitignore`
- [ ] `.env.example` com placeholders no repo
- [ ] Anon key vs Service role key separadas e claras
- [ ] Claude API key só em código server-side
- [ ] Production secrets só no Vercel

### Dados financeiros
- [ ] Nunca armazenar credenciais bancárias
- [ ] Tokens de Open Finance (futuro) criptografados em coluna dedicada
- [ ] Logs **nunca** contêm valores financeiros ou identificadores pessoais
- [ ] Backups automáticos do Supabase verificados

### LGPD
- [ ] Política de privacidade publicada antes do lançamento
- [ ] Endpoint de exportação de dados do usuário
- [ ] Endpoint de deleção de conta (com soft delete + purge após 30 dias)
- [ ] Consentimento explícito por finalidade

### Aplicação
- [ ] Headers de segurança em `next.config.ts`: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- [ ] Rate limiting em rotas de auth, IA e exportação (Upstash Redis ou similar)
- [ ] Server Actions usadas com proteção CSRF nativa do Next.js
- [ ] Proibido `dangerouslySetInnerHTML` (regra de lint)
- [ ] Validação de URLs em redirects (sem open redirects)

### IA
- [ ] Filtro semântico de escopo **antes** do modelo principal
- [ ] Parâmetros de tools validados com Zod
- [ ] IA tem permissões limitadas (read/simulate por padrão)
- [ ] Mutações via IA exigem confirmação na UI
- [ ] Logs de uso da IA (sem dados sensíveis) para auditoria
- [ ] System prompts versionados e revisáveis

### Dependências
- [ ] `npm audit` no CI
- [ ] Renovate/Dependabot configurado
- [ ] `package-lock.json` versionado
- [ ] Sem `npm install <pacote>@latest` sem revisar mudanças

---

## 🛠️ Stack e convenções

### Estrutura de pastas
```
src/
  app/                # Rotas (App Router)
    (auth)/           # Grupo de rotas autenticadas
    (public)/         # Landing, login, signup
    api/              # API routes (quando server actions não bastam)
  components/
    ui/               # Componentes shadcn/ui
    features/         # Componentes específicos de feature
  lib/
    supabase/         # Clients Supabase (server, client, middleware)
    ai/               # Cliente Claude + filtro de escopo + tools
    projection/       # Engine de projeção de caixa
    validation/       # Schemas Zod compartilhados
  types/              # Tipos compartilhados (incluindo gerados do Supabase)
```

### Convenções
- **Nomes:** kebab-case em arquivos, PascalCase em componentes, camelCase em funções/variáveis
- **Componentes:** Server Components por padrão; adicionar `"use client"` só quando necessário
- **Data fetching:** preferir Server Components; em mutations usar Server Actions
- **Validação:** schema Zod compartilhado entre client e server (mesma fonte de verdade)
- **Erros:** usar Result/Either pattern em operações que podem falhar (não throw em fluxo esperado)

### Padrões de código
- **Imports:** absolutos via `@/` (configurado no `tsconfig.json`)
- **Async:** `async/await`, evitar `.then()` em código novo
- **Comentários:** só quando o "porquê" não é óbvio; nunca documentar o "o quê"
- **Commits:** convenção Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`)

---

## 🤖 Filtro de escopo da IA — especificação

Antes de qualquer chamada ao Claude API com input do usuário, o input passa por:

1. **Sanitização básica:** trim, normalização Unicode, limite de tamanho (ex: 2000 chars)
2. **Detecção de prompt injection:** padrões conhecidos ("ignore previous", "you are now", system markers, etc.)
3. **Classificação semântica de escopo:** chamada leve (haiku) com prompt restrito que classifica se a pergunta é sobre:
   - ✅ Finanças pessoais/empresariais do usuário
   - ✅ Projeção de caixa, simulação de compra, planejamento
   - ✅ Funcionalidades do Catavento
   - ❌ Qualquer outro tópico → resposta padrão: "Posso te ajudar só com seu controle financeiro no Catavento. Reformule sua pergunta nesse contexto."

Apenas inputs aprovados nos 3 estágios chegam ao modelo principal.

---

## 📋 Roadmap de fases

Ver `README.md` seção Roadmap. Status sincronizado entre `README.md` e tasks do projeto.

---

## 🌐 Idioma e mercado

- **Idioma da UI:** Português (Brasil) no MVP
- **i18n:** estrutura preparada (`next-intl` ou similar), mas só PT-BR no lançamento
- **Moeda:** BRL (com fallback futuro pra USD/EUR)
- **Formatação de datas:** `dd/MM/yyyy`
- **Pagamentos:** PIX prioritário, cartão como fallback
