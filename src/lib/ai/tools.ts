import "server-only";
import type Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { loadUserSnapshot } from "@/lib/queries/snapshot";
import { projectCashFlow } from "@/lib/projection/engine";
import { buildChartSeries, totalsAtDate } from "@/lib/projection/aggregate";
import { addMonths, today as todayString } from "@/lib/projection/dates";

/**
 * Tools disponíveis para o assistente IA.
 *
 * Princípios:
 *  - Apenas read/simulate. Nenhuma mutação no banco.
 *  - Toda execução valida parâmetros via Zod antes de tocar dados.
 *  - Toda consulta passa pelo loadUserSnapshot() que respeita RLS via cookies.
 *  - Tools retornam strings prontas pra o modelo consumir.
 */

export const TOOL_DEFINITIONS: Anthropic.Tool[] = [
  {
    name: "get_current_date",
    description:
      "Retorna a data atual no formato YYYY-MM-DD. Use quando precisar raciocinar sobre datas futuras.",
    input_schema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "get_accounts_summary",
    description:
      "Lista todas as contas do usuário (PF e PJ) com saldo atual. Retorna nomes, tipos, saldos e total consolidado.",
    input_schema: {
      type: "object" as const,
      properties: {},
    },
  },
  {
    name: "get_upcoming_events",
    description:
      "Lista os próximos N eventos financeiros (entradas e saídas) do usuário, ordenados por data. Use pra responder 'o que tenho a pagar nos próximos dias?' ou 'quais minhas próximas entradas?'.",
    input_schema: {
      type: "object" as const,
      properties: {
        limit: {
          type: "number" as const,
          description: "Quantos eventos retornar (padrão 10, máximo 30)",
        },
      },
    },
  },
  {
    name: "get_balance_at_date",
    description:
      "Retorna o saldo projetado em uma data específica, separado por PF, PJ e total. Use quando o usuário pergunta 'quanto vou ter em [data]?'.",
    input_schema: {
      type: "object" as const,
      properties: {
        date: {
          type: "string" as const,
          description: "Data no formato YYYY-MM-DD",
        },
      },
      required: ["date"],
    },
  },
  {
    name: "simulate_purchase",
    description:
      "Simula o impacto de uma compra hipotética no caixa do usuário. Retorna saldo previsto em 3, 6 e 12 meses comparado ao cenário atual. Use quando o usuário pergunta 'posso comprar X?', 'qual o impacto se eu comprar Y?'.",
    input_schema: {
      type: "object" as const,
      properties: {
        description: {
          type: "string" as const,
          description: "Descrição da compra (ex: 'geladeira')",
        },
        amount: {
          type: "number" as const,
          description: "Valor total em R$",
        },
        installments: {
          type: "number" as const,
          description: "Número de parcelas (1 para à vista)",
        },
        target_kind: {
          type: "string" as const,
          enum: ["account", "card"],
          description: "Onde a compra é feita: 'account' (débito/PIX) ou 'card' (cartão)",
        },
      },
      required: ["amount", "installments", "target_kind"],
    },
  },
];

// ============================================================================
// Validação de parâmetros — Zod schemas por tool
// ============================================================================

const upcomingEventsInput = z.object({
  limit: z.number().int().min(1).max(30).optional().default(10),
});

const balanceAtDateInput = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
});

const simulatePurchaseInput = z.object({
  description: z.string().max(120).optional(),
  amount: z.number().positive().max(1_000_000),
  installments: z.number().int().min(1).max(120),
  target_kind: z.enum(["account", "card"]),
});

// ============================================================================
// Execução
// ============================================================================

export interface ToolExecutionContext {
  userId: string;
}

export async function executeTool(
  name: string,
  input: unknown,
): Promise<string> {
  switch (name) {
    case "get_current_date":
      return JSON.stringify({ date: todayString() });

    case "get_accounts_summary":
      return executeAccountsSummary();

    case "get_upcoming_events": {
      const parsed = upcomingEventsInput.safeParse(input);
      if (!parsed.success) return errorString(parsed.error);
      return executeUpcomingEvents(parsed.data.limit);
    }

    case "get_balance_at_date": {
      const parsed = balanceAtDateInput.safeParse(input);
      if (!parsed.success) return errorString(parsed.error);
      return executeBalanceAtDate(parsed.data.date);
    }

    case "simulate_purchase": {
      const parsed = simulatePurchaseInput.safeParse(input);
      if (!parsed.success) return errorString(parsed.error);
      return executeSimulatePurchase(parsed.data);
    }

    default:
      return JSON.stringify({ error: `Tool desconhecida: ${name}` });
  }
}

async function executeAccountsSummary(): Promise<string> {
  const snapshot = await loadUserSnapshot();
  if (!snapshot) return JSON.stringify({ error: "Usuário não autenticado" });

  const accounts = snapshot.accounts.map((a) => ({
    name: a.name,
    kind: a.kind,
    type: a.type,
    balance: a.current_balance,
    balance_as_of: a.balance_as_of,
  }));

  const totalPF = accounts.filter((a) => a.kind === "PF").reduce((s, a) => s + a.balance, 0);
  const totalPJ = accounts.filter((a) => a.kind === "PJ").reduce((s, a) => s + a.balance, 0);

  return JSON.stringify({
    accounts,
    total_pf: round2(totalPF),
    total_pj: round2(totalPJ),
    total: round2(totalPF + totalPJ),
  });
}

async function executeUpcomingEvents(limit: number): Promise<string> {
  const snapshot = await loadUserSnapshot();
  if (!snapshot) return JSON.stringify({ error: "Usuário não autenticado" });

  const projection = projectCashFlow(snapshot, { horizonMonths: 12 });
  const upcoming = projection.events.slice(0, limit).map((e) => ({
    date: e.date,
    description: e.description,
    amount: e.amount,
    kind: e.kind,
    source: e.source,
  }));

  return JSON.stringify({ events: upcoming });
}

async function executeBalanceAtDate(date: string): Promise<string> {
  const snapshot = await loadUserSnapshot();
  if (!snapshot) return JSON.stringify({ error: "Usuário não autenticado" });

  const projection = projectCashFlow(snapshot, { horizonMonths: 24 });
  const series = buildChartSeries(projection);
  const totals = totalsAtDate(series, date);

  if (!totals) {
    return JSON.stringify({ error: "Sem dados suficientes pra essa data" });
  }
  return JSON.stringify({
    date,
    pf: totals.pf,
    pj: totals.pj,
    total: totals.total,
  });
}

async function executeSimulatePurchase(input: z.infer<typeof simulatePurchaseInput>): Promise<string> {
  const snapshot = await loadUserSnapshot();
  if (!snapshot) return JSON.stringify({ error: "Usuário não autenticado" });

  const installmentAmount = Math.round((input.amount / input.installments) * 100) / 100;
  const today = todayString();

  // Cenário base
  const baseSeries = buildChartSeries(projectCashFlow(snapshot, { horizonMonths: 12 }));

  // Cenário com compra
  const target =
    input.target_kind === "account"
      ? snapshot.accounts.find((a) => !a.archived)
      : snapshot.creditCards.find((c) => !c.archived);

  if (!target) {
    return JSON.stringify({
      error: `Usuário não tem ${input.target_kind === "account" ? "contas" : "cartões"} cadastrados para simular`,
    });
  }

  const hypotheticalInstallment = {
    id: "sim",
    user_id: "sim",
    description: input.description ?? "Compra simulada",
    total_amount: input.amount,
    installment_count: input.installments,
    installment_amount: installmentAmount,
    first_installment_date: today,
    installments_paid: 0,
    archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    account_id: input.target_kind === "account" ? target.id : null,
    credit_card_id: input.target_kind === "card" ? target.id : null,
    kind: "kind" in target ? target.kind : "PF",
  };

  const scenarioSnapshot = {
    ...snapshot,
    installments: [...snapshot.installments, hypotheticalInstallment],
  };
  const scenarioSeries = buildChartSeries(
    projectCashFlow(scenarioSnapshot, { horizonMonths: 12 }),
  );

  const points = [3, 6, 12].map((m) => {
    const date = addMonths(today, m);
    return {
      months: m,
      date,
      baseline: totalsAtDate(baseSeries, date)?.total ?? 0,
      scenario: totalsAtDate(scenarioSeries, date)?.total ?? 0,
    };
  });

  return JSON.stringify({
    description: input.description ?? "Compra simulada",
    total_amount: input.amount,
    installments: input.installments,
    installment_amount: installmentAmount,
    target: input.target_kind,
    comparison: points,
  });
}

function errorString(err: z.ZodError): string {
  return JSON.stringify({ error: "Parâmetros inválidos", details: err.flatten() });
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
