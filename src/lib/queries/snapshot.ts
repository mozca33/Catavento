import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ProjectionSnapshot } from "@/lib/projection/engine";

/**
 * Carrega o snapshot completo do usuário autenticado pra alimentar o engine
 * de projeção. Toda query respeita RLS (auth.uid() = user_id).
 */
export async function loadUserSnapshot(): Promise<ProjectionSnapshot | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [
    accountsRes,
    cardsRes,
    recurringRes,
    installmentsRes,
    plannedRes,
  ] = await Promise.all([
    supabase.from("accounts").select("*").eq("archived", false),
    supabase.from("credit_cards").select("*").eq("archived", false),
    supabase.from("recurring_entries").select("*").eq("archived", false),
    supabase.from("installments").select("*").eq("archived", false),
    supabase.from("planned_entries").select("*").eq("done", false),
  ]);

  return {
    accounts: accountsRes.data ?? [],
    creditCards: cardsRes.data ?? [],
    recurringEntries: recurringRes.data ?? [],
    installments: installmentsRes.data ?? [],
    plannedEntries: plannedRes.data ?? [],
  };
}
