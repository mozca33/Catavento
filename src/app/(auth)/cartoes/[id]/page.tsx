import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CardForm } from "../card-form";
import type { Account, CreditCard } from "@/types/database";

export default async function EditarCartaoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [cardRes, accountsRes] = await Promise.all([
    supabase.from("credit_cards").select("*").eq("id", id).single(),
    supabase.from("accounts").select("*").eq("archived", false),
  ]);

  if (!cardRes.data) notFound();
  const card = cardRes.data as CreditCard;
  const accounts = (accountsRes.data as Account[] | null) ?? [];

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
          Editar cartão
        </h1>
      </div>
      <CardForm mode="edit" cardId={card.id} initialValues={card} accounts={accounts} />
    </div>
  );
}
