"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { movementSchema } from "@/lib/validation/recurring";

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

function parseMovement(formData: FormData) {
  const get = (k: string) => {
    const v = formData.get(k);
    return v === null || v === "" ? undefined : v;
  };
  return movementSchema.safeParse({
    description: get("description"),
    amount: get("amount"),
    movement_type: get("movement_type"),
    from_account_id: get("from_account_id"),
    use_card: get("use_card"),
    card_id: get("card_id"),
    to_account_id: get("to_account_id"),
    interval_count: get("interval_count"),
    interval_unit: get("interval_unit"),
    day_of_month: get("day_of_month"),
    month_of_year: get("month_of_year"),
    kind: get("kind"),
    start_date: get("start_date"),
    end_date: get("end_date"),
  });
}

function buildPayload(d: ReturnType<typeof movementSchema.parse>) {
  const direction = d.movement_type === "income" ? "in" : "out";

  // Caso 1: saída em cartão
  if (d.movement_type === "expense" && d.use_card && d.card_id) {
    return {
      account_id: null,
      credit_card_id: d.card_id,
      to_account_id: null,
      direction,
    };
  }
  // Caso 2: transferência entre minhas contas
  if (d.movement_type === "transfer") {
    return {
      account_id: d.from_account_id,
      credit_card_id: null,
      to_account_id: d.to_account_id ?? null,
      direction: "out" as const,
    };
  }
  // Caso 3: entrada ou saída direta em conta
  return {
    account_id: d.from_account_id,
    credit_card_id: null,
    to_account_id: null,
    direction,
  };
}

function legacyFrequency(unit: string): "monthly" | "yearly" {
  return unit === "years" ? "yearly" : "monthly";
}

export async function createMovementAction(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseMovement(formData);
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
  const targets = buildPayload(d);

  const { error } = await supabase.from("recurring_entries").insert({
    user_id: user.id,
    ...targets,
    description: d.description,
    amount: d.amount,
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
    console.error("[movement:create]", error);
    return { ok: false, error: `Erro ao salvar: ${error.message}` };
  }

  revalidatePath("/recorrencias");
  revalidatePath("/dashboard");
  redirect("/recorrencias");
}

export async function updateMovementAction(
  id: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = parseMovement(formData);
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
  const targets = buildPayload(d);

  const { error } = await supabase
    .from("recurring_entries")
    .update({
      ...targets,
      description: d.description,
      amount: d.amount,
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
    console.error("[movement:update]", error);
    return { ok: false, error: `Erro ao atualizar: ${error.message}` };
  }

  revalidatePath("/recorrencias");
  revalidatePath("/dashboard");
  redirect("/recorrencias");
}

export async function deleteMovementAction(formData: FormData): Promise<void> {
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

// Aliases retrocompatíveis enquanto a renomeação chega
export const createRecurringAction = createMovementAction;
export const updateRecurringAction = updateMovementAction;
export const deleteRecurringAction = deleteMovementAction;
