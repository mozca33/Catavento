import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Subscription, SubscriptionStatus } from "@/types/database";

export async function getCurrentSubscription(): Promise<Subscription | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (data as Subscription | null) ?? null;
}

/**
 * Avalia se o usuário tem acesso ao app:
 *  - `trialing` com trial_ends_at no futuro → acesso
 *  - `active` → acesso
 *  - resto → bloqueado (redireciona pra assinatura)
 */
export function hasAppAccess(sub: Subscription | null): boolean {
  if (!sub) return false;
  if (sub.status === "active") return true;
  if (sub.status === "trialing") {
    return new Date(sub.trial_ends_at) > new Date();
  }
  return false;
}

export function statusLabel(status: SubscriptionStatus): string {
  switch (status) {
    case "trialing":
      return "Em período de teste";
    case "active":
      return "Ativa";
    case "past_due":
      return "Pagamento pendente";
    case "canceled":
      return "Cancelada";
    case "expired":
      return "Expirada";
  }
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil((target - now) / (1000 * 60 * 60 * 24)));
}
