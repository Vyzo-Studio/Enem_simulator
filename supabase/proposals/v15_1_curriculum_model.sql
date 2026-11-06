-- VYZO ACADEMY V15.1 — PROPOSTA NÃO APLICADA.
-- Copiar para uma migração oficial somente após criar projeto Supabase dedicado,
-- importar e testar as migrações V8/V10/V12, revisar privacidade infantil e aplicar QA RLS A/B.
-- NÃO EXECUTAR em Haus_Barber, GNG Barbearia ou Santomen.
-- A tabela public.academy_goals(id,user_id) é criada pela migração V8.
-- Para links públicos, exigir HTTPS e proveniência governamental na curadoria administrativa.
create table if not exists public.academy_curriculum_references(
 id text primary key check(id ~ '^[a-z0-9][a-z0-9:_.-]{2,119}$'),
 curriculum_version text not null,
 stage text not null check(stage in ('fundamental1','fundamental2','medio')),
 grade smallint not null check(grade between 1 and 9),
 area text not null,
 subject text not null,
 topic text not null,
 subtopic text not null default '',
 skill_code text not null,
 learning_objective text not null,
 source_url text not null check(source_url ~ '^https://'),
 source_document text not null,
 source_section text not null default '',
 source_verified_at timestamptz,
 content_status text not null default 'em_revisao'
   check(content_status in ('rascunho','em_revisao','validado','publicado','retirado')),
 editorial_approved boolean not null default false,
 content_available boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(id,curriculum_version)
);
create index if not exists academy_curriculum_stage_grade_idx
 on public.academy_curriculum_references(stage,grade,subject);
alter table public.academy_curriculum_references enable row level security;
alter table public.academy_curriculum_references force row level security;
revoke all on public.academy_curriculum_references from public,anon,authenticated;
grant select on public.academy_curriculum_references to authenticated;
drop policy if exists academy_curriculum_published_read on public.academy_curriculum_references;
create policy academy_curriculum_published_read on public.academy_curriculum_references
 for select to authenticated using (
  content_status = 'publicado' AND editorial_approved = true AND
  content_available = true AND source_verified_at is not null
 );
-- Nunca confiar em raw_user_meta_data para determinar perfil de professor/editor.
-- A publicação administrativa requer serviço separado autenticado e auditado.

create table if not exists public.academy_school_lessons(
 id text not null check(id ~ '^[a-z0-9][a-z0-9:_.-]{2,159}$'),
 reference_id text not null references public.academy_curriculum_references(id) on delete restrict,
 content_version text not null,
 title text not null,
 material jsonb not null,
 editorial_status text not null default 'em_revisao'
  check(editorial_status in ('rascunho','em_revisao','validado','publicado','retirado')),
 editor_reviewed_at timestamptz,
 editor_id uuid,
 created_at timestamptz not null default now(),
 primary key(id,content_version)
);
create index if not exists academy_school_lessons_reference_idx
 on public.academy_school_lessons(reference_id);
alter table public.academy_school_lessons enable row level security;
alter table public.academy_school_lessons force row level security;
revoke all on public.academy_school_lessons from public,anon,authenticated;
grant select on public.academy_school_lessons to authenticated;
drop policy if exists academy_school_lessons_published_read on public.academy_school_lessons;
create policy academy_school_lessons_published_read on public.academy_school_lessons
 for select to authenticated using (
 editorial_status='publicado' AND editor_reviewed_at is not null AND
 exists(select 1 from public.academy_curriculum_references r
  where r.id=reference_id and r.content_status='publicado'
   and r.editorial_approved=true and r.content_available=true)
 );

create table if not exists public.academy_school_questions(
 id text not null check(id ~ '^[a-z0-9][a-z0-9:_.-]{2,159}$'),
 lesson_id text not null,
 lesson_version text not null,
 content_version text not null,
 stem text not null,
 options jsonb not null check(jsonb_typeof(options)='array'),
 correct_option smallint not null check(correct_option between 0 and 7),
 explanation text not null,
 math_rule jsonb,
 difficulty text not null default 'introdutoria',
 editorial_status text not null default 'em_revisao'
  check(editorial_status in ('rascunho','em_revisao','validado','publicado','retirado')),
 reviewed_at timestamptz,
 created_at timestamptz not null default now(),
 primary key(id,content_version),
 constraint academy_school_question_lesson_version foreign key (lesson_id,lesson_version)
  references public.academy_school_lessons(id,content_version) on delete restrict
);
create index if not exists academy_school_questions_lesson_idx
 on public.academy_school_questions(lesson_id);
alter table public.academy_school_questions enable row level security;
alter table public.academy_school_questions force row level security;
revoke all on public.academy_school_questions from public,anon,authenticated;
grant select on public.academy_school_questions to authenticated;
drop policy if exists academy_school_questions_published_read on public.academy_school_questions;
create policy academy_school_questions_published_read on public.academy_school_questions
 for select to authenticated using (
 editorial_status='publicado' AND reviewed_at is not null AND
 exists(select 1 from public.academy_school_lessons lesson
  join public.academy_curriculum_references r on r.id=lesson.reference_id
  where lesson.id=lesson_id and lesson.editorial_status='publicado' and
   lesson.editor_reviewed_at is not null and
   r.content_status='publicado' and r.editorial_approved=true)
 );

-- Respostas são dados privados. É proibido ao estudante editar notas oficiais pelo cliente.
-- Esta tabela contém tentativas autorrelatadas, não classificações de domínio.
create table if not exists public.academy_school_attempts(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 goal_id uuid not null,
 lesson_id text not null,
 lesson_version text not null,
 answers jsonb not null default '{}'::jsonb check(jsonb_typeof(answers)='object'),
 revision bigint not null default 1 check(revision>0),
 started_at timestamptz not null default now(),
 completed_at timestamptz,
 updated_at timestamptz not null default now(),
 constraint academy_school_attempts_owner_goal foreign key (goal_id,user_id)
   references public.academy_goals(id,user_id) on delete restrict,
 constraint academy_school_attempts_lesson_version foreign key (lesson_id,lesson_version)
   references public.academy_school_lessons(id,content_version) on delete restrict
);
create index if not exists academy_school_attempts_owner_idx
 on public.academy_school_attempts(user_id,goal_id,updated_at desc);
alter table public.academy_school_attempts enable row level security;
alter table public.academy_school_attempts force row level security;
revoke all on public.academy_school_attempts from public,anon;
grant select,insert,update on public.academy_school_attempts to authenticated;
drop policy if exists academy_school_attempts_read_own on public.academy_school_attempts;
drop policy if exists academy_school_attempts_insert_own on public.academy_school_attempts;
drop policy if exists academy_school_attempts_update_own on public.academy_school_attempts;
create policy academy_school_attempts_read_own on public.academy_school_attempts
 for select to authenticated using (
  (select auth.uid())=user_id AND auth.jwt()->>'is_anonymous' is distinct from 'true'
 );
create policy academy_school_attempts_insert_own on public.academy_school_attempts
 for insert to authenticated with check (
  (select auth.uid())=user_id AND auth.jwt()->>'is_anonymous' is distinct from 'true'
 );
create policy academy_school_attempts_update_own on public.academy_school_attempts
 for update to authenticated
 using ((select auth.uid())=user_id AND auth.jwt()->>'is_anonymous' is distinct from 'true')
 with check ((select auth.uid())=user_id AND auth.jwt()->>'is_anonymous' is distinct from 'true');
-- Sem DELETE concedido aos estudantes até revisão de retenção e fluxo de exclusão de conta.
-- Para sincronização sem conflito: UPDATE WHERE id=:id AND revision=:expected, SET revision=revision+1.
-- Atualizações de dados escolares, publicações de aulas, RLS e autenticação exigem testes reais A/B.
