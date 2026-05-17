import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountForm } from "../account-form";
import type { Account } from "@/types/database";

export default async function EditarContaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();
  const account = data as Account;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href="/contas"
          className="text-sm text-[color:var(--text-secondary)] hover:underline"
        >
          ← Voltar
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-[color:var(--text-primary)]">
          Editar conta
        </h1>
      </div>
      <AccountForm mode="edit" accountId={account.id} initialValues={account} />
    </div>
  );
}
