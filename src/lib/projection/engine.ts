import type {
  Account,
  AccountKind,
  CreditCard,
  EntryDirection,
  Installment,
  PlannedEntry,
  RecurringEntry,
} from "@/types/database";
import {
  addInterval,
  addMonths,
  compareDates,
  dateOnMonth,
  getDay,
  getMonthIndex,
  getYear,
  isBefore,
  isWithin,
  type DateString,
} from "./dates";
import { billDebitDate } from "./bill";

// ============================================================================
// Tipos públicos
// ============================================================================

export interface ProjectionSnapshot {
  accounts: Account[];
  creditCards: CreditCard[];
  recurringEntries: RecurringEntry[];
  installments: Installment[];
  plannedEntries: PlannedEntry[];
}

export interface ProjectionEvent {
  date: DateString;
  accountId: string;
  description: string;
  amount: number; // positivo = entrada, negativo = saída
  source:
    | "recurring"
    | "installment"
    | "planned"
    | "transfer_in"
    | "transfer_out"
    | "card_bill";
  kind: AccountKind;
}

export interface AccountTimelinePoint {
  date: DateString;
  balance: number;
  events: ProjectionEvent[];
}

export interface AccountProjection {
  accountId: string;
  accountName: string;
  kind: AccountKind;
  startBalance: number;
  startDate: DateString;
  timeline: AccountTimelinePoint[];
}

export interface ProjectionResult {
  horizon: DateString;
  accounts: AccountProjection[];
  events: ProjectionEvent[]; // todos os eventos agregados, ordenados por data
}

// ============================================================================
// Configuração
// ============================================================================

const DEFAULT_HORIZON_MONTHS = 12;

export interface ProjectionOptions {
  from?: DateString; // padrão: data atual
  horizonMonths?: number; // padrão: 12
}

// ============================================================================
// Engine principal
// ============================================================================

export function projectCashFlow(
  snapshot: ProjectionSnapshot,
  options: ProjectionOptions = {},
): ProjectionResult {
  const from = options.from ?? earliestAccountDate(snapshot.accounts);
  const horizon = addMonths(from, options.horizonMonths ?? DEFAULT_HORIZON_MONTHS);

  // 1. Coletar todos os eventos no período
  const events: ProjectionEvent[] = [];

  // Mapa de cartão -> conta de débito
  const cardToAccount = new Map(
    snapshot.creditCards.map((c) => [c.id, c.account_id]),
  );

  // --- Recorrências (entrada, saída, transferência interna) ---
  for (const r of snapshot.recurringEntries) {
    if (r.archived) continue;
    const dates = expandRecurrence(r, from, horizon);
    for (const date of dates) {
      const signedAmount = r.direction === "in" ? r.amount : -r.amount;

      // Transferência interna: saída na conta de origem + entrada no destino
      if (r.to_account_id && r.account_id) {
        events.push({
          date,
          accountId: r.account_id,
          description: `→ Transferência: ${r.description}`,
          amount: -r.amount,
          source: "transfer_out",
          kind: r.kind,
        });
        events.push({
          date,
          accountId: r.to_account_id,
          description: `← Transferência: ${r.description}`,
          amount: r.amount,
          source: "transfer_in",
          kind: getAccountKind(snapshot.accounts, r.to_account_id),
        });
        continue;
      }

      if (r.account_id) {
        events.push({
          date,
          accountId: r.account_id,
          description: r.description,
          amount: signedAmount,
          source: "recurring",
          kind: r.kind,
        });
      } else if (r.credit_card_id) {
        const card = snapshot.creditCards.find((c) => c.id === r.credit_card_id);
        if (card) {
          const debitDate = billDebitDate(card, date);
          if (debitDate <= horizon) {
            events.push({
              date: debitDate,
              accountId: card.account_id,
              description: `${r.description} (fatura ${card.name})`,
              amount: signedAmount,
              source: "card_bill",
              kind: card.kind,
            });
          }
        }
      }
    }
  }

  // --- Parcelamentos ---
  for (const i of snapshot.installments) {
    if (i.archived) continue;
    const remaining = i.installment_count - i.installments_paid;
    for (let k = 0; k < remaining; k++) {
      const installmentDate = addMonths(i.first_installment_date, i.installments_paid + k);
      if (isBefore(installmentDate, from)) continue;
      if (installmentDate > horizon) break;

      if (i.account_id) {
        events.push({
          date: installmentDate,
          accountId: i.account_id,
          description: `${i.description} (${i.installments_paid + k + 1}/${i.installment_count})`,
          amount: -i.installment_amount,
          source: "installment",
          kind: i.kind,
        });
      } else if (i.credit_card_id) {
        const card = snapshot.creditCards.find((c) => c.id === i.credit_card_id);
        if (card) {
          // first_installment_date pra cartão já é a data de débito da 1ª parcela
          events.push({
            date: installmentDate,
            accountId: card.account_id,
            description: `${i.description} (${i.installments_paid + k + 1}/${i.installment_count}) — ${card.name}`,
            amount: -i.installment_amount,
            source: "card_bill",
            kind: card.kind,
          });
        }
      }
    }
  }

  // --- Eventos planejados ---
  for (const p of snapshot.plannedEntries) {
    if (p.done) continue;
    if (isBefore(p.scheduled_date, from)) continue;
    if (p.scheduled_date > horizon) continue;
    const signedAmount = p.direction === "in" ? p.amount : -p.amount;
    if (p.account_id) {
      events.push({
        date: p.scheduled_date,
        accountId: p.account_id,
        description: p.description,
        amount: signedAmount,
        source: "planned",
        kind: p.kind,
      });
    } else if (p.credit_card_id) {
      const card = snapshot.creditCards.find((c) => c.id === p.credit_card_id);
      if (card) {
        const debitDate = billDebitDate(card, p.scheduled_date);
        if (debitDate <= horizon) {
          events.push({
            date: debitDate,
            accountId: card.account_id,
            description: `${p.description} (fatura ${card.name})`,
            amount: signedAmount,
            source: "card_bill",
            kind: card.kind,
          });
        }
      }
    }
  }

  void cardToAccount; // referência reservada pra otimizações futuras

  // 2. Ordenar eventos por data
  events.sort((a, b) => compareDates(a.date, b.date));

  // 3. Construir timelines por conta
  const accountProjections: AccountProjection[] = snapshot.accounts
    .filter((a) => !a.archived)
    .map((account) => {
      const accountEvents = events.filter((e) => e.accountId === account.id);
      const timeline = buildTimeline(
        account.current_balance,
        account.balance_as_of,
        accountEvents,
        horizon,
      );
      return {
        accountId: account.id,
        accountName: account.name,
        kind: account.kind,
        startBalance: account.current_balance,
        startDate: account.balance_as_of,
        timeline,
      };
    });

  return { horizon, accounts: accountProjections, events };
}

// ============================================================================
// Helpers internos
// ============================================================================

function earliestAccountDate(accounts: Account[]): DateString {
  if (accounts.length === 0) {
    return new Date().toISOString().slice(0, 10);
  }
  return accounts
    .map((a) => a.balance_as_of)
    .sort(compareDates)[0];
}

function getAccountKind(accounts: Account[], id: string): AccountKind {
  return accounts.find((a) => a.id === id)?.kind ?? "PF";
}

/**
 * Expande uma recorrência em todas as datas dentro de [from, horizon]
 * respeitando start_date e end_date.
 */
function expandRecurrence(
  r: RecurringEntry,
  from: DateString,
  horizon: DateString,
): DateString[] {
  return expandIntervalDates(
    r.start_date,
    r.end_date,
    r.interval_count,
    r.interval_unit,
    r.day_of_month,
    r.month_of_year,
    from,
    horizon,
  );
}

/**
 * Expande uma recorrência com intervalo customizado.
 * - days/weeks: aplica direto a partir de start_date
 * - months/years: aplica intervalo + ajusta pro day_of_month (se fornecido)
 */
function expandIntervalDates(
  startDate: DateString,
  endDate: DateString | null | undefined,
  intervalCount: number,
  intervalUnit: "days" | "weeks" | "months" | "years",
  dayOfMonth: number | null,
  monthOfYear: number | null,
  from: DateString,
  horizon: DateString,
): DateString[] {
  const result: DateString[] = [];
  let cursor = startDate;

  // Para months/years com day_of_month, ajusta o cursor inicial
  if ((intervalUnit === "months" || intervalUnit === "years") && dayOfMonth) {
    cursor = dateOnMonth(getYear(cursor), getMonthIndex(cursor), dayOfMonth);
    if (intervalUnit === "years" && monthOfYear) {
      cursor = dateOnMonth(getYear(cursor), monthOfYear - 1, dayOfMonth);
    }
    if (cursor < startDate) {
      cursor = addInterval(cursor, intervalCount, intervalUnit);
    }
  }

  let safetyCounter = 0;
  while (cursor <= horizon && safetyCounter < 1000) {
    if (isWithin(cursor, startDate, endDate) && cursor >= from) {
      result.push(cursor);
    }
    cursor = addInterval(cursor, intervalCount, intervalUnit);
    safetyCounter++;
  }

  return result;
}

/**
 * Constrói timeline de saldo aplicando eventos em ordem.
 * Cada ponto da timeline é uma data em que houve evento — não emitimos
 * pontos pra dias sem movimento (UI interpola).
 */
function buildTimeline(
  startBalance: number,
  startDate: DateString,
  events: ProjectionEvent[],
  horizon: DateString,
): AccountTimelinePoint[] {
  const timeline: AccountTimelinePoint[] = [
    { date: startDate, balance: startBalance, events: [] },
  ];

  // Agrupar eventos por data
  const byDate = new Map<DateString, ProjectionEvent[]>();
  for (const e of events) {
    if (!byDate.has(e.date)) byDate.set(e.date, []);
    byDate.get(e.date)!.push(e);
  }

  const sortedDates = Array.from(byDate.keys()).sort(compareDates);
  let balance = startBalance;
  for (const date of sortedDates) {
    const dayEvents = byDate.get(date)!;
    for (const e of dayEvents) {
      balance += e.amount;
    }
    timeline.push({ date, balance: round2(balance), events: dayEvents });
  }

  // Garante que sempre há um ponto no horizonte, mesmo sem eventos.
  // Isso permite que o gráfico desenhe uma linha mesmo quando não há
  // recorrências/parcelamentos cadastrados.
  const lastDate = timeline[timeline.length - 1].date;
  if (lastDate < horizon) {
    timeline.push({ date: horizon, balance: round2(balance), events: [] });
  }

  return timeline;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
