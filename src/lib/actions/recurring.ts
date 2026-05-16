"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  recurringEntrySchema,
  transferRuleSchema,
} from "@/lib/validation/recurring";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createRecurringAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = recurringEntrySchema.safeParse({
    description: formData.get("description"),
    amount: formData.get("amount"),
    direction: formData.get("direction"),
    frequency: formData.get("frequency"),
    day_of_month: formData.get("day_of_month"),
    month_of_year: formData.get("month_of_year") || undefined,
    target_type: formData.get("target_type"),
    target_id: formData.get("target_id"),
    kind: formData.get("kind"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Não autenticado" };

  const d = parsed.data;
  const { error } = await supabase.from("recurring_entries").insert({
    user_id: user.id,
    account_id: d.target_type === "account" ? d.target_id : null,
    credit_card_id: d.target_type === "card" ? d.target_id : null,
    description: d.description,
    amount: d.amount,
    direction: d.direction,
    frequency: d.frequency,
    day_of_month: d.day_of_month,
    month_of_year: d.month_of_year ?? null,
    start_date: d.start_date,
    end_date: d.end_date || null,
    kind: d.kind,
  });

  if (error) return { ok: false, error: "Erro ao salvar" };

  revalidatePath("/recorrencias");
  revalidatePath("/dashboard");
  redirect("/recorrencias");
}

export async function createTransferRuleAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = transferRuleSchema.safeParse({
    from_account_id: formData.get("from_account_id"),
    to_account_id: formData.get("to_account_id"),
    description: formData.get("description"),
    amount: formData.get("amount"),
    day_of_month: formData.get("day_of_month"),
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Não autenticado" };

  const d = parsed.data;
  const { error } = await supabase.from("transfer_rules").insert({
    user_id: user.id,
    from_account_id: d.from_account_id,
    to_account_id: d.to_account_id,
    description: d.description,
    amount: d.amount,
    day_of_month: d.day_of_month,
    start_date: d.start_date,
    end_date: d.end_date || null,
  });

  if (error) return { ok: false, error: "Erro ao salvar" };

  revalidatePath("/transferencias");
  revalidatePath("/dashboard");
  redirect("/transferencias");
}
