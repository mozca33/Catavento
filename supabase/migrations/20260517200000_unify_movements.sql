-- ============================================================================
-- Catavento — Unificação: transferências viram um tipo de recorrência
-- ============================================================================
-- Antes: tabelas separadas `recurring_entries` (entradas/saídas) e `transfer_rules`.
-- Depois: tudo em `recurring_entries`. Transferência interna = saída com to_account_id.
-- Transferência externa = simplesmente uma saída (com a descrição apontando pro destinatário).
-- ============================================================================

-- 1) Adiciona to_account_id em recurring_entries (só preenchido em transferências internas)
alter table public.recurring_entries
  add column to_account_id uuid references public.accounts(id) on delete cascade;

-- 2) Recria a constraint XOR para suportar o caso de transferência interna
alter table public.recurring_entries
  drop constraint recurring_entries_target_xor;

alter table public.recurring_entries
  add constraint recurring_entries_target_check check (
    -- A) Entrada/saída em conta (sem cartão, sem transferência)
    (account_id is not null and credit_card_id is null and to_account_id is null) or
    -- B) Saída em cartão (sem to_account_id)
    (account_id is null and credit_card_id is not null and to_account_id is null and direction = 'out') or
    -- C) Transferência interna entre minhas contas
    (account_id is not null and credit_card_id is null and to_account_id is not null and direction = 'out' and account_id <> to_account_id)
  );

-- 3) Migra dados de transfer_rules para recurring_entries
insert into public.recurring_entries (
  user_id,
  account_id,
  credit_card_id,
  to_account_id,
  description,
  amount,
  direction,
  frequency,
  interval_count,
  interval_unit,
  day_of_month,
  month_of_year,
  start_date,
  end_date,
  kind,
  archived,
  created_at,
  updated_at
)
select
  user_id,
  from_account_id,
  null,
  to_account_id, -- null se era externo
  case
    when to_external_label is not null
      then description || ' (→ ' || to_external_label || ')'
    else description
  end,
  amount,
  'out'::entry_direction,
  case when interval_unit = 'years' then 'yearly'::recurrence_frequency else 'monthly'::recurrence_frequency end,
  interval_count,
  interval_unit,
  day_of_month,
  null,
  start_date,
  end_date,
  -- Herda o kind da conta de origem
  (select kind from public.accounts where id = transfer_rules.from_account_id),
  archived,
  created_at,
  updated_at
from public.transfer_rules;

-- 4) Drop da tabela antiga (cascade pra remover policies/triggers)
drop trigger if exists touch_transfer_rules_updated_at on public.transfer_rules;
drop table public.transfer_rules cascade;
