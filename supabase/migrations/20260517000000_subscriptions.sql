-- ============================================================================
-- Catavento — Subscriptions (Fase 8: Cobrança via Mercado Pago)
-- ============================================================================
-- Princípios:
--  - Cada usuário tem no máximo uma assinatura ativa
--  - Trial de 7 dias começa no signup automaticamente (via trigger)
--  - Status flui: trialing → active → canceled / past_due
--  - mp_preapproval_id é a "subscription" no Mercado Pago (preapproval)
-- ============================================================================

create type subscription_status as enum (
  'trialing',   -- período de teste grátis (7 dias)
  'active',     -- pagando, acesso liberado
  'past_due',   -- cobrança falhou, em retry
  'canceled',   -- usuário cancelou ou MP encerrou
  'expired'     -- trial expirou sem assinatura
);

create type subscription_plan as enum (
  'monthly'     -- único plano no MVP
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  status subscription_status not null default 'trialing',
  plan subscription_plan not null default 'monthly',
  amount numeric(8, 2) not null default 29.00,
  currency text not null default 'BRL',

  -- Mercado Pago refs
  mp_preapproval_id text unique,    -- ID da preapproval no MP
  mp_payer_email text,               -- email do pagador no MP

  -- Períodos
  trial_ends_at timestamptz not null,
  current_period_end timestamptz,
  canceled_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subscriptions_status_idx on public.subscriptions(status);
create index subscriptions_mp_preapproval_idx on public.subscriptions(mp_preapproval_id) where mp_preapproval_id is not null;

alter table public.subscriptions enable row level security;

-- Usuário só lê a própria assinatura. Mutações só via service role (webhook + actions).
create policy "subscriptions_select_own"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create trigger touch_subscriptions_updated_at before update on public.subscriptions
  for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- Trigger: criar assinatura em trial automaticamente quando user é criado
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_subscription()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.subscriptions (user_id, status, trial_ends_at)
  values (new.id, 'trialing', now() + interval '7 days');
  return new;
end;
$$;

create trigger on_profile_created_create_subscription
  after insert on public.profiles
  for each row execute function public.handle_new_subscription();

-- ----------------------------------------------------------------------------
-- Backfill: criar assinatura em trial para usuários já existentes
-- ----------------------------------------------------------------------------
insert into public.subscriptions (user_id, status, trial_ends_at)
select id, 'trialing', now() + interval '7 days'
from public.profiles
where id not in (select user_id from public.subscriptions)
on conflict do nothing;
