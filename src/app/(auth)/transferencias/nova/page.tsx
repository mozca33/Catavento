import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TransferForm } from "./form";
import type { Account } from "@/types/database";

export default async function NovaTransferenciaPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("accounts")
    .select("*")
    .eq("archived", false);

  const accounts = (data as Account[] | null) ?? [];

  if (accounts.length < 2) {
    redirect("/contas/nova");
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <Link
          href="/transferencias"
          className="text-sm text-slate-600 hover:underline dark:text-slate-400"
        >
          ← Voltar
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">
          Nova transferência recorrente
        </h1>
      </div>

      <TransferForm accounts={accounts} />
    </div>
  );
}
