import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TransferForm } from "../transfer-form";
import type { Account, TransferRule } from "@/types/database";

export default async function EditarTransferenciaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [trRes, accountsRes] = await Promise.all([
    supabase.from("transfer_rules").select("*").eq("id", id).single(),
    supabase.from("accounts").select("*").eq("archived", false),
  ]);

  if (!trRes.data) notFound();
  const transfer = trRes.data as TransferRule;
  const accounts = (accountsRes.data as Account[] | null) ?? [];

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href="/transferencias"
          className="text-sm text-[color:var(--text-secondary)] hover:underline"
        >
          ← Voltar
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-[color:var(--text-primary)]">
          Editar transferência
        </h1>
      </div>
      <TransferForm
        mode="edit"
        transferId={transfer.id}
        initialValues={transfer}
        accounts={accounts}
      />
    </div>
  );
}
