import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InstallmentForm } from "../installment-form";
import type { Account, CreditCard } from "@/types/database";

export default async function NovoParcelamentoPage() {
  const supabase = await createClient();
  const [accountsRes, cardsRes] = await Promise.all([
    supabase.from("accounts").select("*").eq("archived", false),
    supabase.from("credit_cards").select("*").eq("archived", false),
  ]);

  const accounts = (accountsRes.data as Account[] | null) ?? [];
  const cards = (cardsRes.data as CreditCard[] | null) ?? [];

  if (accounts.length === 0) redirect("/contas/nova");

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href="/parcelamentos"
          className="text-sm text-[color:var(--text-secondary)] hover:underline"
        >
          ← Voltar
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-[color:var(--text-primary)]">
          Novo parcelamento
        </h1>
      </div>
      <InstallmentForm mode="create" accounts={accounts} cards={cards} />
    </div>
  );
}
