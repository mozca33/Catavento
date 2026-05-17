import "server-only";
import { MercadoPagoConfig, PreApproval } from "mercadopago";

/**
 * Cliente Mercado Pago — APENAS server-side.
 *
 * Variáveis necessárias:
 *  - MERCADO_PAGO_ACCESS_TOKEN: token de acesso (test ou prod)
 *  - MERCADO_PAGO_WEBHOOK_SECRET: segredo usado pra validar assinatura HMAC dos webhooks
 *  - NEXT_PUBLIC_APP_URL: URL do app, usada pra back_url do checkout
 */

if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
  console.warn("[catavento] MERCADO_PAGO_ACCESS_TOKEN não configurada");
}

export const mpConfig = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN ?? "",
  options: {
    timeout: 10_000,
  },
});

export const mpPreApproval = new PreApproval(mpConfig);

export const SUBSCRIPTION_PLANS = {
  monthly: {
    name: "Catavento Mensal",
    amount: 29.0,
    currency: "BRL",
    frequency: 1,
    frequency_type: "months" as const,
  },
} as const;
