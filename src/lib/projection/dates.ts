/**
 * Utilitários de data para o engine de projeção.
 *
 * Decisão de design: usamos string "YYYY-MM-DD" como representação canônica
 * de data (sem timezone). Finanças são por dia, não por instante.
 */

export type DateString = string; // "YYYY-MM-DD"

export function parseDate(s: DateString): Date {
  // Forçar UTC pra evitar drift de timezone
  const [y, m, d] = s.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatDate(d: Date): DateString {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function today(): DateString {
  return formatDate(new Date());
}

export function addDays(s: DateString, n: number): DateString {
  const d = parseDate(s);
  d.setUTCDate(d.getUTCDate() + n);
  return formatDate(d);
}

export function addWeeks(s: DateString, n: number): DateString {
  return addDays(s, n * 7);
}

export function addYears(s: DateString, n: number): DateString {
  return addMonths(s, n * 12);
}

export function addInterval(
  s: DateString,
  count: number,
  unit: "days" | "weeks" | "months" | "years",
): DateString {
  switch (unit) {
    case "days":
      return addDays(s, count);
    case "weeks":
      return addWeeks(s, count);
    case "months":
      return addMonths(s, count);
    case "years":
      return addYears(s, count);
  }
}

export function addMonths(s: DateString, n: number): DateString {
  const d = parseDate(s);
  const targetMonth = d.getUTCMonth() + n;
  const desiredDay = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(targetMonth);
  // Ajustar pro último dia do mês se necessário
  const lastDay = lastDayOfMonth(d.getUTCFullYear(), d.getUTCMonth());
  d.setUTCDate(Math.min(desiredDay, lastDay));
  return formatDate(d);
}

export function lastDayOfMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

export function compareDates(a: DateString, b: DateString): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

export function isBefore(a: DateString, b: DateString): boolean {
  return a < b;
}

export function isAfterOrEqual(a: DateString, b: DateString): boolean {
  return a >= b;
}

export function isWithin(
  d: DateString,
  start: DateString,
  end: DateString | null | undefined,
): boolean {
  if (d < start) return false;
  if (end && d > end) return false;
  return true;
}

/**
 * Retorna a data correspondente ao dia D do mês de uma referência.
 * Se D > último dia do mês, retorna o último dia (não estoura pro próximo).
 */
export function dateOnMonth(
  year: number,
  monthIndex: number,
  dayOfMonth: number,
): DateString {
  const last = lastDayOfMonth(year, monthIndex);
  const safeDay = Math.min(dayOfMonth, last);
  const d = new Date(Date.UTC(year, monthIndex, safeDay));
  return formatDate(d);
}

export function getYear(s: DateString): number {
  return parseInt(s.slice(0, 4), 10);
}

export function getMonthIndex(s: DateString): number {
  return parseInt(s.slice(5, 7), 10) - 1;
}

export function getDay(s: DateString): number {
  return parseInt(s.slice(8, 10), 10);
}
