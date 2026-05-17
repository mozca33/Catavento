-- ============================================================================
-- Catavento — Recorrências customizadas + Transferências externas
-- ============================================================================

-- ----------------------------------------------------------------------------
-- recurring_entries: intervalo customizado
-- ----------------------------------------------------------------------------
-- Antes só suportava 'monthly' / 'yearly'. Agora suporta qualquer combinação
-- de N + unidade (days/weeks/months/years), com day_of_month opcional pra
-- frequências mensais/anuais.
alter table public.recurring_entries
  add column interval_count smallint not null default 1
    check (interval_count between 1 and 365),
  add column interval_unit text not null default 'months'
    check (interval_unit in ('days', 'weeks', 'months', 'years'));

-- Backfill: traduz frequency atual pra novo modelo
update public.recurring_entries
  set interval_count = 1, interval_unit = 'months'
  where frequency = 'monthly';

update public.recurring_entries
  set interval_count = 1, interval_unit = 'years'
  where frequency = 'yearly';

-- day_of_month passa a ser opcional (recorrências por dias/semanas não usam)
alter table public.recurring_entries
  alter column day_of_month drop not null;

-- ----------------------------------------------------------------------------
-- transfer_rules: destino pode ser conta interna OU externo (boleto, PIX, etc)
-- ----------------------------------------------------------------------------
alter table public.transfer_rules
  drop constraint transfer_rules_diff_accounts;

alter table public.transfer_rules
  alter column to_account_id drop not null;

alter table public.transfer_rules
  add column to_external_label text;

-- Destino XOR: interno ou externo, nunca os dois nem nenhum
alter table public.transfer_rules
  add constraint transfer_rules_dest_xor check (
    (to_account_id is not null and to_external_label is null and from_account_id <> to_account_id) or
    (to_account_id is null and to_external_label is not null and length(trim(to_external_label)) > 0)
  );

-- Também adiciona intervalo customizado em transfer_rules
alter table public.transfer_rules
  add column interval_count smallint not null default 1
    check (interval_count between 1 and 365),
  add column interval_unit text not null default 'months'
    check (interval_unit in ('days', 'weeks', 'months', 'years'));

alter table public.transfer_rules
  alter column day_of_month drop not null;
