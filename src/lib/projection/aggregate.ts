import type { AccountKind } from "@/types/database";
import type { ProjectionResult } from "./engine";
import { compareDates, type DateString } from "./dates";

export interface ChartPoint {
  date: DateString;
  total: number;
  pf: number;
  pj: number;
  // Saldo por conta (id → saldo)
  byAccount: Record<string, number>;
}

/**
 * Constrói uma série temporal consolidada a partir da projeção.
 * Para cada data em que houve evento, calcula o saldo total (e por kind)
 * naquela data carregando o saldo anterior nas contas que não tiveram movimento.
 */
export function buildChartSeries(projection: ProjectionResult): ChartPoint[] {
  // Coletar todas as datas únicas com evento
  const allDates = new Set<DateString>();
  for (const acc of projection.accounts) {
    for (const point of acc.timeline) {
      allDates.add(point.date);
    }
  }

  const dates = Array.from(allDates).sort(compareDates);
  if (dates.length === 0) return [];

  // Pra cada conta, criar lookup date → balance, preenchendo gaps com saldo anterior
  const accountStates = projection.accounts.map((acc) => {
    const map = new Map<DateString, number>();
    for (const p of acc.timeline) {
      map.set(p.date, p.balance);
    }
    return { accountId: acc.accountId, kind: acc.kind, map };
  });

  const result: ChartPoint[] = [];
  // Inicializar balanços com o primeiro ponto de cada conta
  const lastBalance = new Map<string, number>();
  for (const acc of projection.accounts) {
    lastBalance.set(acc.accountId, acc.startBalance);
  }

  for (const date of dates) {
    let total = 0;
    let pf = 0;
    let pj = 0;
    const byAccount: Record<string, number> = {};

    for (const state of accountStates) {
      if (state.map.has(date)) {
        lastBalance.set(state.accountId, state.map.get(date)!);
      }
      const bal = lastBalance.get(state.accountId) ?? 0;
      byAccount[state.accountId] = bal;
      total += bal;
      if (state.kind === "PF") pf += bal;
      else pj += bal;
    }

    result.push({
      date,
      total: round2(total),
      pf: round2(pf),
      pj: round2(pj),
      byAccount,
    });
  }

  return result;
}

export interface KindTotals {
  pf: number;
  pj: number;
  total: number;
}

export function totalsAtDate(
  series: ChartPoint[],
  date: DateString,
): KindTotals | null {
  // Encontrar maior ponto <= date
  let candidate: ChartPoint | null = null;
  for (const p of series) {
    if (p.date <= date) candidate = p;
    else break;
  }
  if (!candidate) return null;
  return { pf: candidate.pf, pj: candidate.pj, total: candidate.total };
}

export function filterByKind(
  series: ChartPoint[],
  kind: AccountKind | "ALL",
): ChartPoint[] {
  if (kind === "ALL") return series;
  return series.map((p) => ({
    ...p,
    total: kind === "PF" ? p.pf : p.pj,
  }));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
