-- VYZO ACADEMY V12: aplicar SOMENTE em projeto Supabase EXCLUSIVO da plataforma.
-- Executar após 202611050001_vyzo_academy_v8.sql e 202611050002_vyzo_academy_research.sql.
-- Migração aditiva; não exclui dados existentes.
alter table public.academy_legacy_imports
  add column if not exists source_key text not null default 'enem-intelligence-v2',
  add column if not exists fingerprint text;
alter table public.academy_legacy_imports
  drop constraint if exists academy_legacy_imports_source_key_check;
alter table public.academy_legacy_imports
  add constraint academy_legacy_imports_source_key_check
  check(source_key in ('enem-intelligence-v2','enem-intelligence-v1','vyzo-academy-v9-guest-1'));
create unique index if not exists academy_legacy_imports_owner_source_hash
  on public.academy_legacy_imports(user_id,source_key,fingerprint)
  where fingerprint is not null;
create index if not exists academy_legacy_imports_user_source_idx
  on public.academy_legacy_imports(user_id,source_key,imported_at desc);

-- Documentos privados para evolução dos recursos locais. Atualizações com controle
-- de revisão no cliente: WHERE revision = :previous_revision e incrementar na escrita.
create table if not exists public.academy_private_records(
  user_id uuid not null references auth.users(id) on delete cascade,
  record_key text not null check(record_key ~ '^[a-z][a-z0-9_:-]{0,159}$'),
  payload jsonb not null default '{}'::jsonb,
  revision bigint not null default 1 check(revision>0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(user_id,record_key)
);
create index if not exists academy_private_records_user_updated_idx
  on public.academy_private_records(user_id,updated_at desc);

-- Não permitir acesso a dados de estudantes sem sessão autenticada verificável.
alter table public.academy_private_records enable row level security;
alter table public.academy_private_records force row level security;
revoke all on public.academy_private_records from public,anon;
grant select,insert,update,delete on public.academy_private_records to authenticated;
drop policy if exists academy_private_records_select_own on public.academy_private_records;
drop policy if exists academy_private_records_insert_own on public.academy_private_records;
drop policy if exists academy_private_records_update_own on public.academy_private_records;
drop policy if exists academy_private_records_delete_own on public.academy_private_records;
create policy academy_private_records_select_own on public.academy_private_records
  for select to authenticated using (
    (select auth.uid())=user_id AND auth.jwt()->>'is_anonymous' is distinct from 'true'
  );
create policy academy_private_records_insert_own on public.academy_private_records
  for insert to authenticated with check (
    (select auth.uid())=user_id AND auth.jwt()->>'is_anonymous' is distinct from 'true'
  );
create policy academy_private_records_update_own on public.academy_private_records
  for update to authenticated
  using ((select auth.uid())=user_id AND auth.jwt()->>'is_anonymous' is distinct from 'true')
  with check ((select auth.uid())=user_id AND auth.jwt()->>'is_anonymous' is distinct from 'true');
create policy academy_private_records_delete_own on public.academy_private_records
  for delete to authenticated using (
    (select auth.uid())=user_id AND auth.jwt()->>'is_anonymous' is distinct from 'true'
  );

-- Limitar importações à sessão identificada, não a contas anônimas temporárias.
-- O esquema anterior já tem RLS por owner_id; atualizamos apenas essa tabela.
drop policy if exists academy_legacy_imports_select_own on public.academy_legacy_imports;
drop policy if exists academy_legacy_imports_insert_own on public.academy_legacy_imports;
drop policy if exists academy_legacy_imports_update_own on public.academy_legacy_imports;
drop policy if exists academy_legacy_imports_delete_own on public.academy_legacy_imports;
create policy academy_legacy_imports_select_own on public.academy_legacy_imports
  for select to authenticated using (
    (select auth.uid())=user_id AND auth.jwt()->>'is_anonymous' is distinct from 'true'
  );
create policy academy_legacy_imports_insert_own on public.academy_legacy_imports
  for insert to authenticated with check (
    (select auth.uid())=user_id AND auth.jwt()->>'is_anonymous' is distinct from 'true'
  );
create policy academy_legacy_imports_update_own on public.academy_legacy_imports
  for update to authenticated
  using ((select auth.uid())=user_id AND auth.jwt()->>'is_anonymous' is distinct from 'true')
  with check ((select auth.uid())=user_id AND auth.jwt()->>'is_anonymous' is distinct from 'true');
create policy academy_legacy_imports_delete_own on public.academy_legacy_imports
  for delete to authenticated using (
    (select auth.uid())=user_id AND auth.jwt()->>'is_anonymous' is distinct from 'true'
  );

-- TABELAS DE HISTÓRICO NÃO SÃO APAGADAS. Não guardar senhas nem tokens nos JSONs.
