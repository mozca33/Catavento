"use client";

import { useState, useTransition } from "react";
import {
  startSubscriptionAction,
  cancelSubscriptionAction,
} from "@/lib/actions/subscription";
import type { SubscriptionStatus } from "@/types/database";

interface Props {
  status: SubscriptionStatus;
}

export function SubscriptionActions({ status }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isActive = status === "active";

  function handleSubscribe() {
    setError(null);
    startTransition(async () => {
      const result = await startSubscriptionAction();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      window.location.href = result.checkoutUrl;
    });
  }

  function handleCancel() {
    if (!confirm("Cancelar a assinatura? Você manterá acesso até o fim do período pago.")) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await cancelSubscriptionAction();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      window.location.reload();
    });
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      {isActive ? (
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="w-full rounded-lg border border-[color:var(--border-strong)] px-4 py-3 text-sm font-medium text-[color:var(--text-primary)] hover:bg-[color:var(--bg-muted)] disabled:opacity-50"
        >
          {isPending ? "Cancelando..." : "Cancelar assinatura"}
        </button>
      ) : (
        <button
          onClick={handleSubscribe}
          disabled={isPending}
          className="w-full rounded-lg bg-[color:var(--brand-primary)] px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-[color:var(--brand-primary-hover)] disabled:opacity-50"
        >
          {isPending ? "Redirecionando..." : "Assinar agora — R$ 29/mês"}
        </button>
      )}
    </div>
  );
}
