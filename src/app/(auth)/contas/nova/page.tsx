import Link from "next/link";
import { AccountForm } from "../account-form";

export default function NovaContaPage() {
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
          Nova conta
        </h1>
      </div>
      <AccountForm mode="create" />
    </div>
  );
}
