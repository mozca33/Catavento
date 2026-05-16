import type { CreditCard } from "@/types/database";
import {
  addMonths,
  dateOnMonth,
  getDay,
  getMonthIndex,
  getYear,
  type DateString,
} from "./dates";

/**
 * Cálculo de fatura: dado uma compra em `purchaseDate` num cartão,
 * retorna a data em que essa compra é debitada (autopay) na conta vinculada.
 *
 * Regra:
 *  - Compras feitas até closing_day do mês M entram na fatura que fecha
 *    em closing_day de M.
 *  - Compras feitas depois de closing_day do mês M entram na fatura que
 *    fecha em closing_day de M+1.
 *  - A fatura debita no autopay_day (ou due_day se autopay não configurado).
 *  - Se autopay_day > closing_day: débito no mesmo mês do fechamento.
 *  - Se autopay_day <= closing_day: débito no mês seguinte ao fechamento.
 */
export function billDebitDate(
  card: Pick<CreditCard, "closing_day" | "autopay_day" | "due_day">,
  purchaseDate: DateString,
): DateString {
  const closing = card.closing_day;
  const payDay = card.autopay_day ?? card.due_day;

  const year = getYear(purchaseDate);
  const monthIdx = getMonthIndex(purchaseDate);
  const day = getDay(purchaseDate);

  // Mês de fechamento: M se day <= closing, senão M+1
  const closingMonthIdx = day <= closing ? monthIdx : monthIdx + 1;

  // Mês de débito: mesmo do fechamento se payDay > closing, senão M+1
  const debitMonthOffset = payDay > closing ? 0 : 1;
  const debitMonthIdx = closingMonthIdx + debitMonthOffset;

  // Construir data ajustando overflow de meses via dateOnMonth
  // Calcular ano e mês reais
  const totalMonths = year * 12 + debitMonthIdx;
  const debitYear = Math.floor(totalMonths / 12);
  const debitMonth = totalMonths % 12;

  return dateOnMonth(debitYear, debitMonth, payDay);
}

/**
 * Retorna a data de fechamento da fatura em que uma compra cai.
 * Útil pra agrupar compras por fatura e debitar tudo de uma vez.
 */
export function billClosingDate(
  card: Pick<CreditCard, "closing_day">,
  purchaseDate: DateString,
): DateString {
  const closing = card.closing_day;
  const year = getYear(purchaseDate);
  const monthIdx = getMonthIndex(purchaseDate);
  const day = getDay(purchaseDate);

  const closingMonthIdx = day <= closing ? monthIdx : monthIdx + 1;

  const totalMonths = year * 12 + closingMonthIdx;
  const closingYear = Math.floor(totalMonths / 12);
  const closingMonth = totalMonths % 12;

  return dateOnMonth(closingYear, closingMonth, closing);
}

/**
 * Próxima ocorrência do closing_day a partir de uma data (inclusivo).
 */
export function nextClosingDate(
  closingDay: number,
  from: DateString,
): DateString {
  const year = getYear(from);
  const monthIdx = getMonthIndex(from);
  const day = getDay(from);

  const sameMonthClosing = dateOnMonth(year, monthIdx, closingDay);
  if (day <= closingDay) {
    return sameMonthClosing;
  }
  return addMonths(sameMonthClosing, 1);
}
