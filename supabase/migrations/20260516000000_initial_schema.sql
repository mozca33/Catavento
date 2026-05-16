-- ============================================================================
-- Catavento — Schema inicial
-- ============================================================================
-- Princípios:
--  - RLS habilitado em TODAS as tabelas (sem exceção)
--  - Toda tabela tem user_id apontando pra auth.users
--  - Policies default-deny: precisa de auth.uid() = user_id explícito
--  - Valores monetários em numeric(14,2) — precisão de centavos, suporta R$ 999 bi
--  - Datas em date (sem timezone) — finanças são por dia, não por instante
--  - Timestamps de auditoria (created_at, updated_at) em todas as tabelas
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
create type account_kind as enum ('PF', 'PJ');

create type account_type as enum (
  'checking',     -- conta corrente
  'savings',      -- poupança
  'investment',   -- investimento (CDB, Tesouro, etc.)
  'cash',         -- dinheiro físico
  'other'
);

create type recurrence_frequency as enum (
  'monthly',
  'yearly'
);

create type entry_direction as enum (
  'in',   -- entrada (positivo)
  'out'   -- saída (negativo)
);

-- ----------------------------------------------------------------------------
-- profiles: extensão de auth.users com dados de perfil do app
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  locale text not null default 'pt-BR',
  currency text not null default 'BRL',
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Trigger pra criar profile automaticamente quando usuário se registra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- accounts: contas bancárias, carteiras, investimentos
-- ----------------------------------------------------------------------------
create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type account_type not null default 'checking',
  kind account_kind not null default 'PF',
  current_balance numeric(14, 2) not null default 0,
  balance_as_of date not null default current_date,
  currency text not null default 'BRL',
  color text,         -- hex pra UI
  icon text,          -- emoji ou nome do ícone
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint accounts_name_not_empty check (length(trim(name)) > 0)
);

create index accounts_user_id_idx on public.accounts(user_id) where archived = false;

alter table public.accounts enable row level security;

create policy "accounts_select_own"
  on public.accounts for select
  using (auth.uid() = user_id);

create policy "accounts_insert_own"
  on public.accounts for insert
  with check (auth.uid() = user_id);

create policy "accounts_update_own"
  on public.accounts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "accounts_delete_own"
  on public.accounts for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- credit_cards: cartões de crédito
-- ----------------------------------------------------------------------------
create table public.credit_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete restrict,
  name text not null,
  kind account_kind not null default 'PF',
  closing_day smallint not null check (closing_day between 1 and 31),
  due_day smallint not null check (due_day between 1 and 31),
  -- Dia em que débito automático sai (na conta vinculada). Null = pagamento manual.
  autopay_day smallint check (autopay_day between 1 and 31),
  credit_limit numeric(14, 2),
  color text,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint credit_cards_name_not_empty check (length(trim(name)) > 0)
);

create index credit_cards_user_id_idx on public.credit_cards(user_id) where archived = false;
create index credit_cards_account_id_idx on public.credit_cards(account_id);

alter table public.credit_cards enable row level security;

create policy "credit_cards_select_own"
  on public.credit_cards for select
  using (auth.uid() = user_id);

create policy "credit_cards_insert_own"
  on public.credit_cards for insert
  with check (auth.uid() = user_id);

create policy "credit_cards_update_own"
  on public.credit_cards for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "credit_cards_delete_own"
  on public.credit_cards for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- recurring_entries: entradas e saídas recorrentes
-- ----------------------------------------------------------------------------
create table public.recurring_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- Vai pra conta (entrada/saída em conta) OU cartão (despesa no cartão)
  account_id uuid references public.accounts(id) on delete cascade,
  credit_card_id uuid references public.credit_cards(id) on delete cascade,
  description text not null,
  amount numeric(14, 2) not null check (amount > 0),
  direction entry_direction not null,
  frequency recurrence_frequency not null default 'monthly',
  -- Para frequency='monthly': dia do mês (1-31). Se >28 e mês curto, aplica último dia.
  -- Para 'yearly': dia + mês.
  day_of_month smallint not null check (day_of_month between 1 and 31),
  month_of_year smallint check (month_of_year between 1 and 12),
  start_date date not null default current_date,
  end_date date,
  kind account_kind not null default 'PF',
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recurring_entries_target_xor check (
    (account_id is not null and credit_card_id is null) or
    (account_id is null and credit_card_id is not null)
  ),
  constraint recurring_entries_yearly_needs_month check (
    frequency <> 'yearly' or month_of_year is not null
  ),
  constraint recurring_entries_card_only_out check (
    credit_card_id is null or direction = 'out'
  )
);

create index recurring_entries_user_id_idx on public.recurring_entries(user_id) where archived = false;

alter table public.recurring_entries enable row level security;

create policy "recurring_entries_select_own"
  on public.recurring_entries for select
  using (auth.uid() = user_id);

create policy "recurring_entries_insert_own"
  on public.recurring_entries for insert
  with check (auth.uid() = user_id);

create policy "recurring_entries_update_own"
  on public.recurring_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "recurring_entries_delete_own"
  on public.recurring_entries for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- installments: parcelamentos (compra em N vezes no cartão ou via boleto)
-- ----------------------------------------------------------------------------
create table public.installments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete cascade,
  credit_card_id uuid references public.credit_cards(id) on delete cascade,
  description text not null,
  total_amount numeric(14, 2) not null check (total_amount > 0),
  installment_count smallint not null check (installment_count between 1 and 120),
  installment_amount numeric(14, 2) not null check (installment_amount > 0),
  -- Data da primeira parcela:
  --  - Pra cartão: data em que a 1ª parcela está na fatura (data de débito da fatura)
  --  - Pra conta: data em que sai a 1ª parcela
  first_installment_date date not null,
  installments_paid smallint not null default 0 check (installments_paid >= 0),
  kind account_kind not null default 'PF',
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint installments_target_xor check (
    (account_id is not null and credit_card_id is null) or
    (account_id is null and credit_card_id is not null)
  ),
  constraint installments_paid_le_total check (installments_paid <= installment_count)
);

create index installments_user_id_idx on public.installments(user_id) where archived = false;

alter table public.installments enable row level security;

create policy "installments_select_own"
  on public.installments for select
  using (auth.uid() = user_id);

create policy "installments_insert_own"
  on public.installments for insert
  with check (auth.uid() = user_id);

create policy "installments_update_own"
  on public.installments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "installments_delete_own"
  on public.installments for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- planned_entries: eventos pontuais futuros (pagamento de casamento, viagem etc.)
-- ----------------------------------------------------------------------------
create table public.planned_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete cascade,
  credit_card_id uuid references public.credit_cards(id) on delete cascade,
  description text not null,
  amount numeric(14, 2) not null check (amount > 0),
  direction entry_direction not null,
  scheduled_date date not null,
  kind account_kind not null default 'PF',
  done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint planned_entries_target_xor check (
    (account_id is not null and credit_card_id is null) or
    (account_id is null and credit_card_id is not null)
  ),
  constraint planned_entries_card_only_out check (
    credit_card_id is null or direction = 'out'
  )
);

create index planned_entries_user_id_idx on public.planned_entries(user_id) where done = false;

alter table public.planned_entries enable row level security;

create policy "planned_entries_select_own"
  on public.planned_entries for select
  using (auth.uid() = user_id);

create policy "planned_entries_insert_own"
  on public.planned_entries for insert
  with check (auth.uid() = user_id);

create policy "planned_entries_update_own"
  on public.planned_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "planned_entries_delete_own"
  on public.planned_entries for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- transfer_rules: regras de transferência recorrente (ex: PJ → PF mensal)
-- ----------------------------------------------------------------------------
create table public.transfer_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  from_account_id uuid not null references public.accounts(id) on delete cascade,
  to_account_id uuid not null references public.accounts(id) on delete cascade,
  description text not null,
  amount numeric(14, 2) not null check (amount > 0),
  day_of_month smallint not null check (day_of_month between 1 and 31),
  start_date date not null default current_date,
  end_date date,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transfer_rules_diff_accounts check (from_account_id <> to_account_id)
);

create index transfer_rules_user_id_idx on public.transfer_rules(user_id) where archived = false;

alter table public.transfer_rules enable row level security;

create policy "transfer_rules_select_own"
  on public.transfer_rules for select
  using (auth.uid() = user_id);

create policy "transfer_rules_insert_own"
  on public.transfer_rules for insert
  with check (auth.uid() = user_id);

create policy "transfer_rules_update_own"
  on public.transfer_rules for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "transfer_rules_delete_own"
  on public.transfer_rules for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- updated_at trigger genérico
-- ----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_profiles_updated_at before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger touch_accounts_updated_at before update on public.accounts
  for each row execute function public.touch_updated_at();
create trigger touch_credit_cards_updated_at before update on public.credit_cards
  for each row execute function public.touch_updated_at();
create trigger touch_recurring_entries_updated_at before update on public.recurring_entries
  for each row execute function public.touch_updated_at();
create trigger touch_installments_updated_at before update on public.installments
  for each row execute function public.touch_updated_at();
create trigger touch_planned_entries_updated_at before update on public.planned_entries
  for each row execute function public.touch_updated_at();
create trigger touch_transfer_rules_updated_at before update on public.transfer_rules
  for each row execute function public.touch_updated_at();
