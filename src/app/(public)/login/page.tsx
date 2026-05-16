"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type LoginActionResult } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<
    LoginActionResult | null,
    FormData
  >(loginAction, null);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-slate-50"
        >
          🌬️ Catavento
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            Entrar
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Acesse seu controle financeiro
          </p>

          <form action={formAction} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
              />
              {state && !state.ok && state.fieldErrors?.email && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {state.fieldErrors.email[0]}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
              />
              {state && !state.ok && state.fieldErrors?.password && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {state.fieldErrors.password[0]}
                </p>
              )}
            </div>

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
              className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {pending ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Ainda não tem conta?{" "}
            <Link
              href="/signup"
              className="font-medium text-slate-900 underline dark:text-slate-50"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
