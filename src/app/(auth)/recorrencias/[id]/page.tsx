import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RecurringForm } from "../recurring-form";
import type { Account, CreditCard, RecurringEntry } from "@/types/database";

export default async function EditarRecorrenciaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [recRes, accountsRes, cardsRes] = await Promise.all([
    supabase.from("recurring_entries").select("*").eq("id", id).single(),
    supabase.from("accounts").select("*").eq("archived", false),
    supabase.from("credit_cards").select("*").eq("archived", false),
  ]);

  if (!recRes.data) notFound();
  const recurring = recRes.data as RecurringEntry;
  const accounts = (accountsRes.data as Account[] | null) ?? [];
  const cards = (cardsRes.data as CreditCard[] | null) ?? [];

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href="/recorrencias"
          className="text-sm text-[color:var(--text-secondary)] hover:underline"
        >
          ← Voltar
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-[color:var(--text-primary)]">
          Editar recorrência
        </h1>
      </div>
      <RecurringForm
        mode="edit"
        recurringId={recurring.id}
        initialValues={recurring}
        accounts={accounts}
        cards={cards}
      />
    </div>
  );
}
