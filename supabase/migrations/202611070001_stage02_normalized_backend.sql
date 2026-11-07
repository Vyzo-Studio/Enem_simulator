-- VYZO ACADEMY - Stage 02 - aditiva, somente projeto Supabase Vyzo_Academy dedicado.
-- Nunca executar nos bancos de clientes. Não expõe chaves, ativa contas, conteúdo infantil nem IA.
-- Referências parentais (id,user_id) impedem apontar para dados de outro estudante.
create table public.academy_goal_subjects (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 goal_id uuid not null,
 subject_code text not null check(length(trim(subject_code)) between 1 and 90),
 subject_name text not null check(length(trim(subject_name)) between 1 and 120),
 priority text not null default 'medium' check(priority in ('low','medium','high')),
 created_at timestamptz not null default now(),
 unique (id,user_id),
 unique (user_id,goal_id,subject_code),
 foreign key (goal_id,user_id) references public.academy_goals(id,user_id) on delete restrict
);
create index academy_goal_subjects_goal_idx on public.academy_goal_subjects(user_id,goal_id);

create table public.academy_assessment_sessions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 goal_id uuid not null,
 status text not null default 'in_progress' check(status in ('in_progress','completed','cancelled')),
 mode text not null default 'practice' check(mode in ('practice','diagnostic','mock_exam')),
 question_ids text[] not null default array[]::text[],
 version bigint not null default 1 check(version>0),
 started_at timestamptz not null default now(),
 finished_at timestamptz,
 updated_at timestamptz not null default now(),
 unique (id,user_id),
 foreign key (goal_id,user_id) references public.academy_goals(id,user_id) on delete restrict,
 check (finished_at is null or finished_at >= started_at)
);
create index academy_assessment_sessions_goal_idx on public.academy_assessment_sessions(user_id,goal_id,started_at desc);

create table public.academy_assessment_answers (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 session_id uuid not null,
 question_id text not null check(length(question_id) between 1 and 160),
 selected_option smallint check(selected_option between 0 and 7),
 is_flagged boolean not null default false,
 answered_at timestamptz,
 unique(id,user_id),
 unique(session_id,question_id),
 foreign key (session_id,user_id) references public.academy_assessment_sessions(id,user_id) on delete cascade
);
create index academy_answers_owner_session_idx on public.academy_assessment_answers(user_id,session_id);

create table public.academy_study_plans (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 goal_id uuid not null,
 plan_version bigint not null default 1 check(plan_version>0),
 title text not null check(length(trim(title)) between 1 and 160),
 state text not null default 'draft' check(state in ('draft','active','superseded','archived')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(id,user_id),
 unique(user_id,goal_id,plan_version),
 foreign key (goal_id,user_id) references public.academy_goals(id,user_id) on delete restrict
);
create index academy_study_plans_goal_idx on public.academy_study_plans(user_id,goal_id);

create table public.academy_plan_tasks (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 plan_id uuid not null,
 scheduled_for date not null,
 minutes smallint not null check(minutes between 5 and 720),
 subject text not null check(length(trim(subject)) between 1 and 120),
 topic text not null default '',
 state text not null default 'pending' check(state in ('pending','done','skipped','cancelled')),
 completed_at timestamptz,
 created_at timestamptz not null default now(),
 unique(id,user_id),
 foreign key(plan_id,user_id) references public.academy_study_plans(id,user_id) on delete cascade
);
create index academy_plan_tasks_owner_date_idx on public.academy_plan_tasks(user_id,scheduled_for);

create table public.academy_activity_history (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 goal_id uuid not null,
 session_id uuid,
 event_type text not null check(event_type in ('goal_updated','assessment_started','assessment_finished','study_done','review_done','imported')),
 details jsonb not null default '{}'::jsonb check(jsonb_typeof(details)='object'),
 occurred_at timestamptz not null default now(),
 unique(id,user_id),
 foreign key(goal_id,user_id) references public.academy_goals(id,user_id) on delete restrict,
 foreign key(session_id,user_id) references public.academy_assessment_sessions(id,user_id) on delete restrict
);
create index academy_activity_history_owner_time_idx on public.academy_activity_history(user_id,occurred_at desc);

create table public.academy_revision_items (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 goal_id uuid not null,
 session_id uuid,
 question_id text not null check(length(question_id) between 1 and 160),
 state text not null default 'pending' check(state in ('pending','reviewing','done')),
 next_review_on date,
 review_count integer not null default 0 check(review_count>=0),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(id,user_id),
 foreign key(goal_id,user_id) references public.academy_goals(id,user_id) on delete restrict,
 foreign key(session_id,user_id) references public.academy_assessment_sessions(id,user_id) on delete restrict
);
create index academy_revision_items_owner_due_idx on public.academy_revision_items(user_id,next_review_on);

-- As estruturas futuras permanecem privativas a serviços verificados, sem acesso pela API do aluno.
create table public.academy_curriculum_catalog (
 id uuid primary key default gen_random_uuid(),
 curriculum_key text not null unique,
 stage text not null check(stage in ('fundamental1','fundamental2','medio','enem')),
 grade smallint,
 subject text not null,
 skill_code text,
 version text not null,
 source_url text,
 editorial_state text not null default 'draft'
   check(editorial_state in ('draft','review','approved','published','withdrawn')),
 reviewed_at timestamptz,
 created_at timestamptz not null default now(),
 check(grade is null or grade between 1 and 9)
);
create index academy_curriculum_stage_idx on public.academy_curriculum_catalog(stage,grade,subject);
create table public.academy_ai_audit_queue (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 purpose text not null,
 request_metadata jsonb not null default '{}'::jsonb check(jsonb_typeof(request_metadata)='object'),
 created_at timestamptz not null default now()
);
create index academy_ai_audit_owner_idx on public.academy_ai_audit_queue(user_id,created_at desc);
create table public.academy_guardian_permissions (
 id uuid primary key default gen_random_uuid(),
 student_user_id uuid not null references auth.users(id) on delete cascade,
 guardian_user_id uuid not null references auth.users(id) on delete cascade,
 consent_state text not null default 'pending' check(consent_state in ('pending','verified','revoked')),
 verified_at timestamptz,
 created_at timestamptz not null default now(),
 unique(student_user_id,guardian_user_id),
 check(student_user_id <> guardian_user_id)
);

do $rls$
declare tbl text;
begin
 foreach tbl in array array[
  'academy_goal_subjects','academy_assessment_sessions','academy_assessment_answers',
  'academy_study_plans','academy_plan_tasks','academy_activity_history','academy_revision_items'
 ] loop
  execute format('alter table public.%I enable row level security',tbl);
  execute format('alter table public.%I force row level security',tbl);
  execute format('revoke all on public.%I from public, anon, authenticated',tbl);
  execute format('grant select,insert,update,delete on public.%I to authenticated',tbl);
  execute format('create policy %I on public.%I for select to authenticated using ((select auth.uid())=user_id and (select auth.jwt())->>''is_anonymous'' is distinct from ''true'')',tbl||'_own_select',tbl);
  execute format('create policy %I on public.%I for insert to authenticated with check ((select auth.uid())=user_id and (select auth.jwt())->>''is_anonymous'' is distinct from ''true'')',tbl||'_own_insert',tbl);
  execute format('create policy %I on public.%I for update to authenticated using ((select auth.uid())=user_id and (select auth.jwt())->>''is_anonymous'' is distinct from ''true'') with check ((select auth.uid())=user_id and (select auth.jwt())->>''is_anonymous'' is distinct from ''true'')',tbl||'_own_update',tbl);
  execute format('create policy %I on public.%I for delete to authenticated using ((select auth.uid())=user_id and (select auth.jwt())->>''is_anonymous'' is distinct from ''true'')',tbl||'_own_delete',tbl);
 end loop;
 foreach tbl in array array['academy_curriculum_catalog','academy_ai_audit_queue','academy_guardian_permissions'] loop
  execute format('alter table public.%I enable row level security',tbl);
  execute format('alter table public.%I force row level security',tbl);
  execute format('revoke all on public.%I from public, anon, authenticated',tbl);
 end loop;
end $rls$;

-- Reforça a proteção das antigas tabelas: contas de login anônimo não ganham acesso
-- somente por possuírem o papel Postgres authenticated.
do $existing$
declare tbl text; action text; predicate text;
begin
 predicate := '((select auth.uid())=user_id and (select auth.jwt())->>''is_anonymous'' is distinct from ''true'')';
 foreach tbl in array array[
  'academy_profiles','academy_goals','academy_diagnostics','academy_study_tasks',
  'academy_essays','academy_study_sessions','academy_legacy_imports'
 ] loop
  execute format('alter table public.%I force row level security',tbl);
  foreach action in array array['select','insert','update','delete'] loop
   execute format('drop policy if exists %I on public.%I',tbl||'_'||action||'_own',tbl);
   if action='select' or action='delete' then
    execute format('create policy %I on public.%I for %s to authenticated using (%s)',tbl||'_'||action||'_own',tbl,action,predicate);
   elsif action='insert' then
    execute format('create policy %I on public.%I for insert to authenticated with check (%s)',tbl||'_insert_own',tbl,predicate);
   else
    execute format('create policy %I on public.%I for update to authenticated using (%s) with check (%s)',tbl||'_update_own',tbl,predicate,predicate);
   end if;
  end loop;
 end loop;
end $existing$;
