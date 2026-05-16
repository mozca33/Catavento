import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RecurringForm } from "./form";
import type { Account, CreditCard } from "@/types/database";

export default async function NovaRecorrenciaPage() {
  const supabase = await createClient();
  const [accountsRes, cardsRes] = await Promise.all([
    supabase.from("accounts").select("*").eq("archived", false),
    supabase.from("credit_cards").select("*").eq("archived", false),
  ]);

  const accounts = (accountsRes.data as Account[] | null) ?? [];
  const cards = (cardsRes.data as CreditCard[] | null) ?? [];

  if (accounts.length === 0) {
    redirect("/contas/nova");
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href="/recorrencias"
          className="text-sm text-slate-600 hover:underline dark:text-slate-400"
        >
          ← Voltar
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">
          Nova recorrência
        </h1>
      </div>

      <RecurringForm accounts={accounts} cards={cards} />
    </div>
  );
}
