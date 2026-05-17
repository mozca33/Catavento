/**
 * Tipos do schema do Catavento.
 *
 * Estes tipos são escritos manualmente espelhando `supabase/migrations/`.
 * Quando rodarmos `npx supabase gen types typescript --linked > src/types/database.generated.ts`,
 * usaremos os tipos gerados como fonte de verdade. Por enquanto, manual.
 */

export type AccountKind = "PF" | "PJ";

export type AccountType =
  | "checking"
  | "savings"
  | "investment"
  | "cash"
  | "other";

export type RecurrenceFrequency = "monthly" | "yearly";
export type IntervalUnit = "days" | "weeks" | "months" | "years";

export type EntryDirection = "in" | "out";

export interface Profile {
  id: string;
  full_name: string | null;
  locale: string;
  currency: string;
  onboarded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  kind: AccountKind;
  current_balance: number;
  balance_as_of: string; // ISO date
  currency: string;
  color: string | null;
  icon: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreditCard {
  id: string;
  user_id: string;
  account_id: string;
  name: string;
  kind: AccountKind;
  closing_day: number;
  due_day: number;
  autopay_day: number | null;
  credit_limit: number | null;
  color: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecurringEntry {
  id: string;
  user_id: string;
  account_id: string | null;
  credit_card_id: string | null;
  description: string;
  amount: number;
  direction: EntryDirection;
  frequency: RecurrenceFrequency;
  interval_count: number;
  interval_unit: IntervalUnit;
  day_of_month: number | null;
  month_of_year: number | null;
  start_date: string;
  end_date: string | null;
  kind: AccountKind;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Installment {
  id: string;
  user_id: string;
  account_id: string | null;
  credit_card_id: string | null;
  description: string;
  total_amount: number;
  installment_count: number;
  installment_amount: number;
  first_installment_date: string;
  installments_paid: number;
  kind: AccountKind;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlannedEntry {
  id: string;
  user_id: string;
  account_id: string | null;
  credit_card_id: string | null;
  description: string;
  amount: number;
  direction: EntryDirection;
  scheduled_date: string;
  kind: AccountKind;
  done: boolean;
  created_at: string;
  updated_at: string;
}

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "expired";

export type SubscriptionPlan = "monthly";

export interface Subscription {
  id: string;
  user_id: string;
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  amount: number;
  currency: string;
  mp_preapproval_id: string | null;
  mp_payer_email: string | null;
  trial_ends_at: string;
  current_period_end: string | null;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TransferRule {
  id: string;
  user_id: string;
  from_account_id: string;
  to_account_id: string | null;
  to_external_label: string | null;
  description: string;
  amount: number;
  interval_count: number;
  interval_unit: IntervalUnit;
  day_of_month: number | null;
  start_date: string;
  end_date: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}
