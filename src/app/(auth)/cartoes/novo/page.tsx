import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CardForm } from "../card-form";
import type { Account } from "@/types/database";

export default async function NovoCartaoPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("accounts")
    .select("*")
    .eq("archived", false);
  const accounts = (data as Account[] | null) ?? [];

  if (accounts.length === 0) redirect("/contas/nova");

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href="/cartoes"
          className="text-sm text-[color:var(--text-secondary)] hover:underline"
        >
          ← Voltar
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-[color:var(--text-primary)]">
          Novo cartão
        </h1>
      </div>
      <CardForm mode="create" accounts={accounts} />
    </div>
  );
}
