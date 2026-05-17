"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { accountSchema } from "@/lib/validation/account";

export type AccountActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

async function authedClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function createAccountAction(
  _prev: AccountActionResult | null,
  formData: FormData,
): Promise<AccountActionResult> {
  const parsed = accountSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    kind: formData.get("kind"),
    current_balance: formData.get("current_balance"),
    balance_as_of: formData.get("balance_as_of"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { supabase, user } = await authedClient();
  if (!user) return { ok: false, error: "Não autenticado" };

  const { error } = await supabase.from("accounts").insert({
    user_id: user.id,
    ...parsed.data,
  });

  if (error) return { ok: false, error: "Erro ao criar conta" };

  revalidatePath("/contas");
  revalidatePath("/dashboard");
  redirect("/contas");
}

export async function updateAccountAction(
  id: string,
  _prev: AccountActionResult | null,
  formData: FormData,
): Promise<AccountActionResult> {
  const parsed = accountSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    kind: formData.get("kind"),
    current_balance: formData.get("current_balance"),
    balance_as_of: formData.get("balance_as_of"),
  });

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
    .from("accounts")
    .update(parsed.data)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { ok: false, error: "Erro ao atualizar conta" };

  revalidatePath("/contas");
  revalidatePath("/dashboard");
  redirect("/contas");
}

export async function deleteAccountAction(formData: FormData): Promise<void> {
  const id = formData.get("id") as string;
  if (!id) return;

  const { supabase, user } = await authedClient();
  if (!user) return;

  await supabase
    .from("accounts")
    .update({ archived: true })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/contas");
  revalidatePath("/dashboard");
}
