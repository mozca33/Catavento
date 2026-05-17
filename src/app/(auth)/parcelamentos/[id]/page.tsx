import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InstallmentForm } from "../installment-form";
import type { Account, CreditCard, Installment } from "@/types/database";

export default async function EditarParcelamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [insRes, accountsRes, cardsRes] = await Promise.all([
    supabase.from("installments").select("*").eq("id", id).single(),
    supabase.from("accounts").select("*").eq("archived", false),
    supabase.from("credit_cards").select("*").eq("archived", false),
  ]);

  if (!insRes.data) notFound();
  const ins = insRes.data as Installment;
  const accounts = (accountsRes.data as Account[] | null) ?? [];
  const cards = (cardsRes.data as CreditCard[] | null) ?? [];

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
          Editar parcelamento
        </h1>
      </div>
      <InstallmentForm
        mode="edit"
        installmentId={ins.id}
        initialValues={ins}
        accounts={accounts}
        cards={cards}
      />
    </div>
  );
}
