"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { accountSchema } from "@/lib/validation/account";

export type AccountActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Não autenticado" };
  }

  const { error } = await supabase.from("accounts").insert({
    user_id: user.id,
    ...parsed.data,
  });

  if (error) {
    return { ok: false, error: "Erro ao criar conta. Tente novamente." };
  }

  revalidatePath("/contas");
  revalidatePath("/dashboard");
  redirect("/contas");
}

export async function archiveAccountAction(accountId: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("accounts")
    .update({ archived: true })
    .eq("id", accountId);
  revalidatePath("/contas");
  revalidatePath("/dashboard");
}
