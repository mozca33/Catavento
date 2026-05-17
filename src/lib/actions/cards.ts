"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  creditCardSchema,
  installmentSchema,
  plannedEntrySchema,
} from "@/lib/validation/cards";

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

function revalidateAll() {
  revalidatePath("/cartoes");
  revalidatePath("/parcelamentos");
  revalidatePath("/planejados");
  revalidatePath("/dashboard");
}

// ============================================================================
// Credit Cards
// ============================================================================

function parseCard(formData: FormData) {
  return creditCardSchema.safeParse({
    name: formData.get("name"),
    account_id: formData.get("account_id"),
    kind: formData.get("kind"),
    closing_day: formData.get("closing_day"),
    due_day: formData.get("due_day"),
    autopay_day: formData.get("autopay_day"),
    credit_limit: formData.get("credit_limit"),
  });
}

export async function createCardAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseCard(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const { supabase, user } = await authedClient();
  if (!user) return { ok: false, error: "Não autenticado" };

  const { error } = await supabase
    .from("credit_cards")
    .insert({ user_id: user.id, ...parsed.data });
  if (error) return { ok: false, error: "Erro ao salvar" };

  revalidateAll();
  redirect("/cartoes");
}

export async function updateCardAction(
  id: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseCard(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const { supabase, user } = await authedClient();
  if (!user) return { ok: false, error: "Não autenticado" };

  const { error } = await supabase
    .from("credit_cards")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: "Erro ao atualizar" };

  revalidateAll();
  redirect("/cartoes");
}

export async function deleteCardAction(formData: FormData): Promise<void> {
  const id = formData.get("id") as string;
  if (!id) return;
  const { supabase, user } = await authedClient();
  if (!user) return;
  await supabase
    .from("credit_cards")
    .update({ archived: true })
    .eq("id", id)
    .eq("user_id", user.id);
  revalidateAll();
}

// ============================================================================
// Installments
// ============================================================================

function parseInstallment(formData: FormData) {
  return installmentSchema.safeParse({
    description: formData.get("description"),
    target_type: formData.get("target_type"),
    target_id: formData.get("target_id"),
    total_amount: formData.get("total_amount"),
    installment_count: formData.get("installment_count"),
    installments_paid: formData.get("installments_paid") || 0,
    first_installment_date: formData.get("first_installment_date"),
    kind: formData.get("kind"),
  });
}

export async function createInstallmentAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseInstallment(formData);
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
  const installmentAmount =
    Math.round((d.total_amount / d.installment_count) * 100) / 100;

  const { error } = await supabase.from("installments").insert({
    user_id: user.id,
    account_id: d.target_type === "account" ? d.target_id : null,
    credit_card_id: d.target_type === "card" ? d.target_id : null,
    description: d.description,
    total_amount: d.total_amount,
    installment_count: d.installment_count,
    installment_amount: installmentAmount,
    first_installment_date: d.first_installment_date,
    installments_paid: d.installments_paid,
    kind: d.kind,
  });
  if (error) return { ok: false, error: "Erro ao salvar" };

  revalidateAll();
  redirect("/parcelamentos");
}

export async function updateInstallmentAction(
  id: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseInstallment(formData);
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
  const installmentAmount =
    Math.round((d.total_amount / d.installment_count) * 100) / 100;

  const { error } = await supabase
    .from("installments")
    .update({
      account_id: d.target_type === "account" ? d.target_id : null,
      credit_card_id: d.target_type === "card" ? d.target_id : null,
      description: d.description,
      total_amount: d.total_amount,
      installment_count: d.installment_count,
      installment_amount: installmentAmount,
      first_installment_date: d.first_installment_date,
      installments_paid: d.installments_paid,
      kind: d.kind,
    })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: "Erro ao atualizar" };

  revalidateAll();
  redirect("/parcelamentos");
}

export async function deleteInstallmentAction(formData: FormData): Promise<void> {
  const id = formData.get("id") as string;
  if (!id) return;
  const { supabase, user } = await authedClient();
  if (!user) return;
  await supabase
    .from("installments")
    .update({ archived: true })
    .eq("id", id)
    .eq("user_id", user.id);
  revalidateAll();
}

// ============================================================================
// Planned Entries
// ============================================================================

function parsePlanned(formData: FormData) {
  return plannedEntrySchema.safeParse({
    description: formData.get("description"),
    target_type: formData.get("target_type"),
    target_id: formData.get("target_id"),
    amount: formData.get("amount"),
    direction: formData.get("direction"),
    scheduled_date: formData.get("scheduled_date"),
    kind: formData.get("kind"),
  });
}

export async function createPlannedAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parsePlanned(formData);
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
  const { error } = await supabase.from("planned_entries").insert({
    user_id: user.id,
    account_id: d.target_type === "account" ? d.target_id : null,
    credit_card_id: d.target_type === "card" ? d.target_id : null,
    description: d.description,
    amount: d.amount,
    direction: d.direction,
    scheduled_date: d.scheduled_date,
    kind: d.kind,
  });
  if (error) return { ok: false, error: "Erro ao salvar" };

  revalidateAll();
  redirect("/planejados");
}

export async function updatePlannedAction(
  id: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parsePlanned(formData);
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
    .from("planned_entries")
    .update({
      account_id: d.target_type === "account" ? d.target_id : null,
      credit_card_id: d.target_type === "card" ? d.target_id : null,
      description: d.description,
      amount: d.amount,
      direction: d.direction,
      scheduled_date: d.scheduled_date,
      kind: d.kind,
    })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return { ok: false, error: "Erro ao atualizar" };

  revalidateAll();
  redirect("/planejados");
}

export async function deletePlannedAction(formData: FormData): Promise<void> {
  const id = formData.get("id") as string;
  if (!id) return;
  const { supabase, user } = await authedClient();
  if (!user) return;
  await supabase
    .from("planned_entries")
    .update({ done: true })
    .eq("id", id)
    .eq("user_id", user.id);
  revalidateAll();
}
