import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PlannedForm } from "../planned-form";
import type { Account, CreditCard, PlannedEntry } from "@/types/database";

export default async function EditarPlanejadoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [planRes, accountsRes, cardsRes] = await Promise.all([
    supabase.from("planned_entries").select("*").eq("id", id).single(),
    supabase.from("accounts").select("*").eq("archived", false),
    supabase.from("credit_cards").select("*").eq("archived", false),
  ]);

  if (!planRes.data) notFound();
  const planned = planRes.data as PlannedEntry;
  const accounts = (accountsRes.data as Account[] | null) ?? [];
  const cards = (cardsRes.data as CreditCard[] | null) ?? [];

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href="/planejados"
          className="text-sm text-[color:var(--text-secondary)] hover:underline"
        >
          ← Voltar
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-[color:var(--text-primary)]">
          Editar evento
        </h1>
      </div>
      <PlannedForm
        mode="edit"
        plannedId={planned.id}
        initialValues={planned}
        accounts={accounts}
        cards={cards}
      />
    </div>
  );
}
