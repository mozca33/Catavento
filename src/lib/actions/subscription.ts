"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mpPreApproval, SUBSCRIPTION_PLANS } from "@/lib/mercadopago/client";

export type SubscriptionActionResult =
  | { ok: true; checkoutUrl: string }
  | { ok: false; error: string };

/**
 * Inicia uma assinatura no Mercado Pago.
 * Retorna a URL de checkout (init_point) para o usuário concluir o pagamento.
 */
export async function startSubscriptionAction(): Promise<SubscriptionActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) {
    return { ok: false, error: "Não autenticado" };
  }

  const plan = SUBSCRIPTION_PLANS.monthly;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const preapproval = await mpPreApproval.create({
      body: {
        reason: plan.name,
        payer_email: user.email,
        back_url: `${appUrl}/assinatura?status=success`,
        auto_recurring: {
          frequency: plan.frequency,
          frequency_type: plan.frequency_type,
          transaction_amount: plan.amount,
          currency_id: plan.currency,
        },
        external_reference: user.id,
        status: "pending",
      },
    });

    if (!preapproval.id || !preapproval.init_point) {
      return { ok: false, error: "Resposta inválida do Mercado Pago" };
    }

    // Salva o preapproval_id na nossa subscription via admin (RLS não permite escrita do user)
    const admin = createAdminClient();
    await admin
      .from("subscriptions")
      .update({
        mp_preapproval_id: preapproval.id,
        mp_payer_email: user.email,
      })
      .eq("user_id", user.id);

    revalidatePath("/assinatura");
    return { ok: true, checkoutUrl: preapproval.init_point };
  } catch (err) {
    console.error("[subscription] erro ao criar preapproval:", err);
    return {
      ok: false,
      error: "Não foi possível iniciar a assinatura. Tente novamente.",
    };
  }
}

/**
 * Cancela a assinatura no Mercado Pago e marca como canceled no banco.
 */
export async function cancelSubscriptionAction(): Promise<SubscriptionActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Não autenticado" };

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("mp_preapproval_id, status")
    .eq("user_id", user.id)
    .single();

  if (!sub || !sub.mp_preapproval_id) {
    return { ok: false, error: "Sem assinatura ativa para cancelar" };
  }

  try {
    await mpPreApproval.update({
      id: sub.mp_preapproval_id,
      body: { status: "cancelled" },
    });

    const admin = createAdminClient();
    await admin
      .from("subscriptions")
      .update({ status: "canceled", canceled_at: new Date().toISOString() })
      .eq("user_id", user.id);

    revalidatePath("/assinatura");
    return { ok: true, checkoutUrl: "" };
  } catch (err) {
    console.error("[subscription] erro ao cancelar:", err);
    return { ok: false, error: "Erro ao cancelar. Tente novamente." };
  }
}
