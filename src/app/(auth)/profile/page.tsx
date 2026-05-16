import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fullName = user?.user_metadata?.full_name as string | undefined;
  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("pt-BR")
    : "—";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
          Perfil
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Suas informações de conta
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <dl className="divide-y divide-slate-200 dark:divide-slate-800">
          <Row label="Nome" value={fullName ?? "Não informado"} />
          <Row label="E-mail" value={user?.email ?? "—"} />
          <Row label="Membro desde" value={createdAt} />
        </dl>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        🚧 Edição de perfil será adicionada em breve.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3 text-sm">
      <dt className="text-slate-600 dark:text-slate-400">{label}</dt>
      <dd className="col-span-2 text-slate-900 dark:text-slate-50">{value}</dd>
    </div>
  );
}
