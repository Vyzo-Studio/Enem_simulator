-- VYZO ACADEMY V8: esquema independente para um NOVO projeto Supabase dedicado.
-- Não executar nos bancos Haus Barber, GNG Barbearia ou Santomen.
-- Requer Supabase Auth com confirmação de e-mail habilitada.
create extension if not exists pgcrypto;

create table if not exists public.academy_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(trim(display_name)) between 2 and 100),
  onboarding_complete boolean not null default false,
  availability jsonb not null default '{"0":0,"1":120,"2":120,"3":120,"4":120,"5":120,"6":0}'::jsonb,
  learning_preferences text[] not null default '{}'::text[],
  perceived_difficulties text[] not null default '{}'::text[],
  terms_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.academy_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_type text not null check(exam_type in ('ENEM','Vestibular','Concurso federal','Concurso estadual','Concurso municipal','Concurso militar','Certificação','Prova escolar','Personalizada')),
  exam_name text not null check (char_length(trim(exam_name)) between 2 and 200),
  institution text not null default '',
  objective text not null default '',
  board text not null default '',
  edition text not null default '',
  exam_date date,
  date_tbd boolean not null default true,
  subjects text[] not null default '{}'::text[],
  official_source text,
  priority text not null default 'medium' check(priority in ('high','medium','low')),
  status text not null default 'preparing' check(status in ('preparing','diagnostic_pending','active','paused','completed','archived')),
  diagnostic_status text not null default 'pending' check(diagnostic_status in ('pending','in_progress','completed')),
  allow_provisional boolean not null default false,
  color text not null default '#4776e6' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  syllabus jsonb not null default '[]'::jsonb,
  subject_weights jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint academy_goals_owner_unique unique(id,user_id),
  constraint exam_date_consistency check (date_tbd or exam_date is not null)
);
create index if not exists academy_goals_user_idx on public.academy_goals(user_id);

create table if not exists public.academy_diagnostics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null,
  status text not null default 'in_progress' check(status in ('in_progress','completed')),
  assessment_type text not null default 'original' check(assessment_type in ('original','provisional_general')),
  question_ids text[] not null default '{}'::text[],
  answers jsonb not null default '{}'::jsonb,
  result jsonb,
  duration_seconds integer not null default 0 check(duration_seconds between 0 and 43200),
  version bigint not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint academy_diag_owner_unique unique(id,user_id),
  constraint academy_diag_goal_owner foreign key(goal_id,user_id) references public.academy_goals(id,user_id) on delete restrict
);
create index if not exists academy_diagnostics_owner_goal_idx on public.academy_diagnostics(user_id,goal_id);

create table if not exists public.academy_study_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null,
  day date not null,
  start_minute integer check(start_minute between 0 and 1439),
  minutes integer not null check(minutes between 5 and 720),
  subject text not null,
  topic text not null,
  objective text not null default '',
  notes text not null default '',
  priority text not null default 'medium' check(priority in ('high','medium','low')),
  status text not null default 'pending' check(status in ('pending','completed','missed','cancelled')),
  plan_version integer not null default 1,
  resource_type text not null default 'local',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint academy_task_goal_owner foreign key(goal_id,user_id) references public.academy_goals(id,user_id) on delete restrict
);
create index if not exists academy_tasks_user_day_idx on public.academy_study_tasks(user_id,day);

create table if not exists public.academy_essays (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid,
  title text not null default 'Minha redação',
  prompt text not null default '',
  body text not null default '',
  versions jsonb not null default '[]'::jsonb,
  assessment jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint academy_essay_owner_unique unique(id,user_id),
  constraint academy_essay_goal_owner foreign key(goal_id,user_id) references public.academy_goals(id,user_id) on delete restrict
);
create index if not exists academy_essays_user_idx on public.academy_essays(user_id);

create table if not exists public.academy_study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid,
  subject text not null default '',
  minutes integer not null check(minutes between 1 and 720),
  recorded_at timestamptz not null default now(),
  constraint academy_session_goal_owner foreign key(goal_id,user_id) references public.academy_goals(id,user_id) on delete restrict
);
create index if not exists academy_sessions_user_idx on public.academy_study_sessions(user_id);

create table if not exists public.academy_legacy_imports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  original_state jsonb not null,
  imported_at timestamptz not null default now()
);
create index if not exists academy_imports_user_idx on public.academy_legacy_imports(user_id);

-- Não publica dados de alunos para visitantes anônimos.
-- RLS em TODAS as tabelas expostas; autenticação não é autorização.
DO $security$
DECLARE target text;
BEGIN
  FOREACH target IN ARRAY ARRAY[
    'academy_profiles','academy_goals','academy_diagnostics',
    'academy_study_tasks','academy_essays','academy_study_sessions','academy_legacy_imports'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',target);
    EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY',target);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon',target);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I TO authenticated',target);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I',target||'_select_own',target);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I',target||'_insert_own',target);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I',target||'_update_own',target);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I',target||'_delete_own',target);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING ((select auth.uid()) = user_id)',target||'_select_own',target);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id)',target||'_insert_own',target);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id)',target||'_update_own',target);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING ((select auth.uid()) = user_id)',target||'_delete_own',target);
  END LOOP;
END;
$security$;
-- NOTA: Exclusões na UI são lógicas (arquivar). Evitar usar DELETE sem autorização explícita.
