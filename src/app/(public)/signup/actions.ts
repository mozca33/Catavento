"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { signupSchema } from "@/lib/validation/auth";

export type SignupActionResult =
  | { ok: true; needsConfirmation: boolean }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function signupAction(
  _prev: SignupActionResult | null,
  formData: FormData,
): Promise<SignupActionResult> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Dados inválidos",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return { ok: false, error: "Não foi possível criar a conta. Tente novamente." };
  }

  // Se a sessão veio já (auto-confirm), redireciona pro onboarding
  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/onboarding");
  }

  return { ok: true, needsConfirmation: true };
}
