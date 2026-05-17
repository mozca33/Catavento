"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signupAction, type SignupActionResult } from "./actions";
import { GoogleSignInButton } from "@/components/google-signin-button";
import { Logo } from "@/components/logo";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState<
    SignupActionResult | null,
    FormData
  >(signupAction, null);

  if (state?.ok && state.needsConfirmation) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Confirma seu e-mail 📧
          </h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            Enviamos um link de confirmação. Abre seu e-mail e clica nele pra
            começar a usar o Catavento.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" aria-label="Catavento" className="mb-8 inline-block">
          <Logo size={28} />
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Criar conta
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            7 dias grátis. Sem cartão de crédito.
          </p>

          <div className="mt-6">
            <GoogleSignInButton />
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            <span className="text-xs text-slate-500 dark:text-slate-400">ou</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>

          <form action={formAction} className="space-y-4">
            <Field
              label="Nome completo"
              id="fullName"
              type="text"
              autoComplete="name"
              error={state && !state.ok ? state.fieldErrors?.fullName?.[0] : undefined}
            />
            <Field
              label="E-mail"
              id="email"
              type="email"
              autoComplete="email"
              error={state && !state.ok ? state.fieldErrors?.email?.[0] : undefined}
            />
            <Field
              label="Senha"
              id="password"
              type="password"
              autoComplete="new-password"
              hint="Mínimo 8 caracteres, com maiúscula, minúscula e número"
              error={state && !state.ok ? state.fieldErrors?.password?.[0] : undefined}
            />

            {state && !state.ok && !state.fieldErrors && (
              <div
                role="alert"
                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
              >
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-[color:var(--brand-primary)] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[color:var(--brand-primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? "Criando..." : "Criar conta"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Já tem conta?{" "}
            <Link
              href="/login"
              className="font-medium text-slate-900 underline dark:text-slate-50"
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  id,
  type,
  autoComplete,
  hint,
  error,
}: {
  label: string;
  id: string;
  type: string;
  autoComplete: string;
  hint?: string;
  error?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        required
        className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
      />
      {hint && !error && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
