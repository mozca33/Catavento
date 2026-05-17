# Deploy — Guia de produção

Guia passo a passo para colocar o Catavento em produção na Vercel.

## Pré-requisitos

- ✅ Repositório no GitHub (já feito: `github.com/mozca33/Catavento`)
- ✅ Projeto Supabase criado e migration aplicada (`npx supabase db push`)
- ⏳ Conta na Vercel (https://vercel.com)
- ⏳ Conta no Mercado Pago (https://www.mercadopago.com.br/developers)
- ⏳ Anthropic API key (https://console.anthropic.com) — para o assistente IA
- ⏳ Domínio próprio (opcional, mas recomendado)

---

## 1. Conectar GitHub à Vercel

1. Acesse https://vercel.com/new
2. Importe o repositório `mozca33/Catavento`
3. **Framework Preset**: Next.js (detectado automaticamente)
4. **Root Directory**: `./`
5. Antes de clicar **Deploy**, vá em **Environment Variables** e configure todas (próxima seção)

---

## 2. Variáveis de ambiente em produção

Cole todas no painel da Vercel (Project Settings → Environment Variables):

```
NEXT_PUBLIC_SUPABASE_URL=https://wzmbeiespcxtwsweengy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxx
SUPABASE_SERVICE_ROLE_KEY=sb_secret_xxx
ANTHROPIC_API_KEY=sk-ant-xxx
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-xxx
MERCADO_PAGO_WEBHOOK_SECRET=xxx
NEXT_PUBLIC_APP_URL=https://catavento.app
```

⚠️ **NEXT_PUBLIC_APP_URL** deve ser a URL pública final (com `https://`). Sem ela, o `back_url` do checkout MP volta pra `localhost:3000`.

---

## 3. Configurar Supabase para produção

### 3.1 URL Configuration
No dashboard Supabase → **Authentication → URL Configuration**:
- **Site URL**: `https://catavento.app`
- **Redirect URLs** (adicione, mantendo localhost para dev):
  ```
  https://catavento.app/**
  http://localhost:3000/**
  ```

### 3.2 Google OAuth (produção)
No Google Cloud Console → **Credentials → OAuth Client**:
- **Authorized redirect URIs**: `https://wzmbeiespcxtwsweengy.supabase.co/auth/v1/callback`
  (continua o mesmo — é o callback do Supabase, não do app)

---

## 4. Configurar Mercado Pago

### 4.1 Criar aplicação
https://www.mercadopago.com.br/developers/panel/app → **Criar aplicação**:
- Nome: Catavento
- Modelo: **Pagamentos online** + **Assinaturas**

### 4.2 Credenciais
- **Produção**: copie o `APP_USR-...` access token → variável `MERCADO_PAGO_ACCESS_TOKEN`
- **Sandbox** (para testar antes): use o `TEST-...` access token

### 4.3 Webhook
Painel da aplicação → **Webhooks → Configurar notificações**:
- **URL**: `https://catavento.app/api/webhooks/mercadopago`
- **Eventos** (marcar):
  - ✅ Assinaturas (`subscription_preapproval`)
  - ✅ Pagamentos de assinatura (`subscription_authorized_payment`)
- **Segredo**: copie → variável `MERCADO_PAGO_WEBHOOK_SECRET`

### 4.4 Testar webhook (dev)
Para testar em desenvolvimento, exponha localhost via ngrok:
```bash
ngrok http 3000
```
Configure o webhook do MP apontando para a URL do ngrok (`https://xxx.ngrok.io/api/webhooks/mercadopago`).

---

## 5. Domínio próprio

Painel Vercel → **Settings → Domains** → **Add Domain**:
1. Adicione `catavento.app` (ou o que escolher)
2. Vercel mostra os registros DNS necessários (geralmente CNAME ou A)
3. Configure no painel do seu registrador (Registro.br, Cloudflare, etc.)
4. Aguarde propagação (~5-30 min)

Atualize `NEXT_PUBLIC_APP_URL` com o domínio final.

---

## 6. Primeiro deploy

Após configurar tudo:
1. Vercel → **Deploy**
2. Acompanhe o build (~2 min)
3. URL temporária: `catavento.vercel.app` (até DNS propagar)
4. Cada push pra `main` faz deploy automático

---

## 7. Pós-deploy: checklist

- [ ] Cria uma conta nova em produção e confirma o e-mail
- [ ] Cria conta, recorrência, parcelamento — vê a projeção
- [ ] Vai em `/assinatura` → "Assinar" → completa pagamento em sandbox
- [ ] Confirma webhook chegou: tabela `subscriptions` mostra `status = active`
- [ ] Verifica que `/assistente` funciona (Anthropic key ok)
- [ ] Testa logout/login
- [ ] Roda Lighthouse no `/` e confirma Performance > 90

---

## 8. Monitoramento e manutenção

- **Logs**: Vercel → Project → **Logs**
- **Database**: Supabase Dashboard → Database → Logs
- **Pagamentos**: Mercado Pago → Painel → Atividades
- **IA**: Anthropic Console → Usage

### Backups
Supabase faz backup automático no plano Free (7 dias). Para produção séria, ative o plano Pro com Point-in-Time Recovery.

### Rotação de chaves
Toda chave (Supabase service_role, Anthropic, MP) deve ser rotacionada a cada 6 meses ou imediatamente se houver suspeita de vazamento.

---

## 9. Próximos passos pós-lançamento

- [ ] Configurar canal de suporte (e-mail `security@catavento.app` e `support@catavento.app`)
- [ ] Adicionar rate limiting nas rotas de IA e auth (Upstash Redis)
- [ ] Habilitar 2FA TOTP no Supabase Auth
- [ ] Adicionar analytics (Plausible ou Vercel Analytics)
- [ ] Configurar alertas no Supabase para erros e queries lentas
- [ ] Pentest externo antes de aceitar pagamentos reais em volume
