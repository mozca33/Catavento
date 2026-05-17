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

async function authedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

// ============================================================================
// Recurring Entries
// ============================================================================

function parseRecurring(formData: FormData) {
  const get = (k: string) => {
    const v = formData.get(k);
    return v === null || v === "" ? undefined : v;
  };
  return recurringEntrySchema.safeParse({
    description: get("description"),
    amount: get("amount"),
    direction: get("direction"),
    interval_count: get("interval_count"),
    interval_unit: get("interval_unit"),
    day_of_month: get("day_of_month"),
    month_of_year: get("month_of_year"),
    target_type: get("target_type"),
    target_id: get("target_id"),
    kind: get("kind"),
    start_date: get("start_date"),
    end_date: get("end_date"),
  });
}

function legacyFrequency(unit: string): "monthly" | "yearly" {
  return unit === "years" ? "yearly" : "monthly";
}

export async function createRecurringAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseRecurring(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { supabase, user } = await authedClient();
  if (!user) return { ok: false, error: "Não autenticado" };

  const d = parsed.data;
  const { error } = await supabase.from("recurring_entries").insert({
    user_id: user.id,
    account_id: d.target_type === "account" ? d.target_id : null,
    credit_card_id: d.target_type === "card" ? d.target_id : null,
    description: d.description,
    amount: d.amount,
    direction: d.direction,
    frequency: legacyFrequency(d.interval_unit),
    interval_count: d.interval_count,
    interval_unit: d.interval_unit,
    day_of_month: d.day_of_month ?? null,
    month_of_year: d.month_of_year ?? null,
    start_date: d.start_date,
    end_date: d.end_date || null,
    kind: d.kind,
  });

  if (error) {
    console.error("[recurring:create]", error);
    return { ok: false, error: `Erro ao salvar: ${error.message}` };
  }

  revalidatePath("/recorrencias");
  revalidatePath("/dashboard");
  redirect("/recorrencias");
}

export async function updateRecurringAction(
  id: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseRecurring(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { supabase, user } = await authedClient();
  if (!user) return { ok: false, error: "Não autenticado" };

  const d = parsed.data;
  const { error } = await supabase
    .from("recurring_entries")
    .update({
      account_id: d.target_type === "account" ? d.target_id : null,
      credit_card_id: d.target_type === "card" ? d.target_id : null,
      description: d.description,
      amount: d.amount,
      direction: d.direction,
      frequency: legacyFrequency(d.interval_unit),
      interval_count: d.interval_count,
      interval_unit: d.interval_unit,
      day_of_month: d.day_of_month ?? null,
      month_of_year: d.month_of_year ?? null,
      start_date: d.start_date,
      end_date: d.end_date || null,
      kind: d.kind,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[recurring:update]", error);
    return { ok: false, error: `Erro ao atualizar: ${error.message}` };
  }

  revalidatePath("/recorrencias");
  revalidatePath("/dashboard");
  redirect("/recorrencias");
}

export async function deleteRecurringAction(formData: FormData): Promise<void> {
  const id = formData.get("id") as string;
  if (!id) return;
  const { supabase, user } = await authedClient();
  if (!user) return;
  await supabase
    .from("recurring_entries")
    .update({ archived: true })
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath("/recorrencias");
  revalidatePath("/dashboard");
}

// ============================================================================
// Transfer Rules
// ============================================================================

function parseTransfer(formData: FormData) {
  const get = (k: string) => {
    const v = formData.get(k);
    return v === null || v === "" ? undefined : v;
  };
  return transferRuleSchema.safeParse({
    from_account_id: get("from_account_id"),
    destination_type: get("destination_type"),
    to_account_id: get("to_account_id"),
    to_external_label: get("to_external_label"),
    description: get("description"),
    amount: get("amount"),
    interval_count: get("interval_count"),
    interval_unit: get("interval_unit"),
    day_of_month: get("day_of_month"),
    start_date: get("start_date"),
    end_date: get("end_date"),
  });
}

export async function createTransferRuleAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseTransfer(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const { supabase, user } = await authedClient();
  if (!user) return { ok: false, error: "Não autenticado" };

  const d = parsed.data;
  const { error } = await supabase.from("transfer_rules").insert({
    user_id: user.id,
    from_account_id: d.from_account_id,
    to_account_id:
      d.destination_type === "internal" ? d.to_account_id || null : null,
    to_external_label:
      d.destination_type === "external" ? d.to_external_label || null : null,
    description: d.description,
    amount: d.amount,
    interval_count: d.interval_count,
    interval_unit: d.interval_unit,
    day_of_month: d.day_of_month ?? null,
    start_date: d.start_date,
    end_date: d.end_date || null,
  });

  if (error) {
    console.error("[transfer:create]", error);
    return { ok: false, error: `Erro ao salvar: ${error.message}` };
  }

  revalidatePath("/transferencias");
  revalidatePath("/dashboard");
  redirect("/transferencias");
}

export async function updateTransferRuleAction(
  id: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseTransfer(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const { supabase, user } = await authedClient();
  if (!user) return { ok: false, error: "Não autenticado" };

  const d = parsed.data;
  const { error } = await supabase
    .from("transfer_rules")
    .update({
      from_account_id: d.from_account_id,
      to_account_id:
        d.destination_type === "internal" ? d.to_account_id || null : null,
      to_external_label:
        d.destination_type === "external" ? d.to_external_label || null : null,
      description: d.description,
      amount: d.amount,
      interval_count: d.interval_count,
      interval_unit: d.interval_unit,
      day_of_month: d.day_of_month ?? null,
      start_date: d.start_date,
      end_date: d.end_date || null,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("[transfer:update]", error);
    return { ok: false, error: `Erro ao atualizar: ${error.message}` };
  }

  revalidatePath("/transferencias");
  revalidatePath("/dashboard");
  redirect("/transferencias");
}

export async function deleteTransferRuleAction(formData: FormData): Promise<void> {
  const id = formData.get("id") as string;
  if (!id) return;
  const { supabase, user } = await authedClient();
  if (!user) return;
  await supabase
    .from("transfer_rules")
    .update({ archived: true })
    .eq("id", id)
    .eq("user_id", user.id);
  revalidatePath("/transferencias");
  revalidatePath("/dashboard");
}
