import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { mpPreApproval } from "@/lib/mercadopago/client";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SubscriptionStatus } from "@/types/database";

/**
 * Webhook do Mercado Pago.
 *
 * Eventos relevantes:
 *  - subscription_preapproval: status muda (pending → authorized → cancelled/paused)
 *  - subscription_authorized_payment: cada cobrança recorrente
 *
 * Segurança:
 *  - Valida assinatura HMAC via header `x-signature` e `x-request-id`
 *  - Segredo configurado em MERCADO_PAGO_WEBHOOK_SECRET
 */

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signatureHeader = request.headers.get("x-signature") ?? "";
  const requestId = request.headers.get("x-request-id") ?? "";

  if (!verifySignature(rawBody, signatureHeader, requestId)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let payload: { type?: string; action?: string; data?: { id?: string } };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const eventType = payload.type ?? payload.action;
  const resourceId = payload.data?.id;

  if (!eventType || !resourceId) {
    return NextResponse.json({ ok: true });
  }

  try {
    if (eventType.startsWith("subscription_preapproval") || eventType === "preapproval") {
      await handlePreapprovalUpdate(resourceId);
    }
  } catch (err) {
    console.error("[webhook/mercadopago] erro ao processar:", err);
    // Retornamos 200 mesmo em erro pra evitar retry storm do MP — log fica registrado
  }

  return NextResponse.json({ ok: true });
}

async function handlePreapprovalUpdate(preapprovalId: string): Promise<void> {
  const preapproval = await mpPreApproval.get({ id: preapprovalId });
  if (!preapproval || !preapproval.id) return;

  const userId = preapproval.external_reference;
  if (!userId) return;

  const status = mapMpStatus(preapproval.status);
  const updates: Record<string, unknown> = { status };

  if (preapproval.next_payment_date) {
    updates.current_period_end = preapproval.next_payment_date;
  }
  if (status === "canceled") {
    updates.canceled_at = new Date().toISOString();
  }

  const admin = createAdminClient();
  await admin
    .from("subscriptions")
    .update(updates)
    .eq("user_id", userId);
}

function mapMpStatus(mpStatus: string | undefined): SubscriptionStatus {
  switch (mpStatus) {
    case "authorized":
      return "active";
    case "paused":
      return "past_due";
    case "cancelled":
    case "finished":
      return "canceled";
    case "pending":
    default:
      return "trialing";
  }
}

function verifySignature(
  body: string,
  signatureHeader: string,
  requestId: string,
): boolean {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("[webhook/mercadopago] MERCADO_PAGO_WEBHOOK_SECRET não configurado");
    return false;
  }

  // x-signature tem formato: "ts=123,v1=hexhash"
  const parts = signatureHeader.split(",").map((p) => p.trim());
  const tsPart = parts.find((p) => p.startsWith("ts="));
  const hashPart = parts.find((p) => p.startsWith("v1="));
  if (!tsPart || !hashPart) return false;

  const ts = tsPart.slice(3);
  const providedHash = hashPart.slice(3);

  // Template oficial: id:<data.id>;request-id:<x-request-id>;ts:<ts>;
  // Como temos body completo, vamos extrair data.id dele
  let dataId = "";
  try {
    const parsed = JSON.parse(body);
    dataId = parsed.data?.id ?? "";
  } catch {
    return false;
  }

  const template = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(template).digest("hex");

  try {
    return timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(providedHash, "hex"),
    );
  } catch {
    return false;
  }
}
