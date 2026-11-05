-- VYZO ACADEMY: a aplicar SOMENTE em projeto dedicado com autenticação.
-- Registra cota de consultas sem armazenar o texto pesquisado.
create table if not exists public.academy_research_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  query_length smallint not null check (query_length between 3 and 150),
  created_at timestamptz not null default now()
);
create index if not exists academy_research_requests_owner_day_idx
 on public.academy_research_requests (user_id, created_at desc);
alter table public.academy_research_requests enable row level security;
revoke all on public.academy_research_requests from anon;
grant select,insert on public.academy_research_requests to authenticated;
create policy "research_read_owner" on public.academy_research_requests for select to authenticated
 using ((select auth.uid()) = user_id);
create policy "research_insert_owner" on public.academy_research_requests for insert to authenticated
 with check ((select auth.uid()) = user_id);
-- Cota diária deve ser reforçada no gateway para impedir requisições paralelas abusivas.
-- Catálogo público reutilizável, com publicação SOMENTE após revisão humana dos documentos.
create table if not exists public.academy_exam_catalog (
 id uuid primary key default gen_random_uuid(),
 identity_key text not null unique,
 exam_name text not null,
 edition text,
 verified_sources jsonb not null default '[]'::jsonb,
 payload jsonb not null default '{}'::jsonb,
 human_verified boolean not null default false,
 reviewed_at timestamptz,
 updated_at timestamptz not null default now()
);
alter table public.academy_exam_catalog enable row level security;
revoke all on public.academy_exam_catalog from anon,authenticated;
grant select on public.academy_exam_catalog to authenticated;
create policy "catalog_curated_read" on public.academy_exam_catalog for select to authenticated
 using (human_verified = true);
-- Não há policy de escrita para usuários. Revisão/publicação exige processo administrativo separado.
