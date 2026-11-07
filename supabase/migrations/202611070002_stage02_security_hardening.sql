-- Stage 02: melhorias aditivas identificadas pelo Supabase Database Advisors.
-- Índices cobrindo chaves estrangeiras e coerência entre sessão e objetivo.
create index academy_activity_history_fk_goal on public.academy_activity_history(goal_id,user_id);
create index academy_activity_history_fk_session on public.academy_activity_history(session_id,user_id);
create index academy_assessment_answers_fk_session on public.academy_assessment_answers(session_id,user_id);
create index academy_assessment_sessions_fk_goal on public.academy_assessment_sessions(goal_id,user_id);
create index academy_diagnostics_fk_goal on public.academy_diagnostics(goal_id,user_id);
create index academy_essays_fk_goal on public.academy_essays(goal_id,user_id);
create index academy_goal_subjects_fk_goal on public.academy_goal_subjects(goal_id,user_id);
create index academy_guardian_permissions_fk_guardian on public.academy_guardian_permissions(guardian_user_id);
create index academy_plan_tasks_fk_plan on public.academy_plan_tasks(plan_id,user_id);
create index academy_revision_items_fk_goal on public.academy_revision_items(goal_id,user_id);
create index academy_revision_items_fk_session on public.academy_revision_items(session_id,user_id);
create index academy_study_plans_fk_goal on public.academy_study_plans(goal_id,user_id);
create index academy_study_sessions_fk_goal on public.academy_study_sessions(goal_id,user_id);
create index academy_study_tasks_fk_goal on public.academy_study_tasks(goal_id,user_id);

-- Antes havia apenas FKs independentes para goal_id e session_id.
-- O vínculo composto a seguir também impede misturar sessões e metas
-- diferentes pertencentes ao MESMO estudante.
alter table public.academy_assessment_sessions
 add constraint academy_assessment_sessions_owner_goal_unique unique(id,user_id,goal_id);
alter table public.academy_activity_history
 add constraint academy_activity_history_session_same_goal
 foreign key(session_id,user_id,goal_id)
 references public.academy_assessment_sessions(id,user_id,goal_id) on delete restrict;
alter table public.academy_revision_items
 add constraint academy_revision_items_session_same_goal
 foreign key(session_id,user_id,goal_id)
 references public.academy_assessment_sessions(id,user_id,goal_id) on delete restrict;
create index academy_activity_history_fk_session_goal
 on public.academy_activity_history(session_id,user_id,goal_id);
create index academy_revision_items_fk_session_goal
 on public.academy_revision_items(session_id,user_id,goal_id);

-- Otimiza auth.jwt() nas RLS antigas sem mudar a titularidade protegida.
do $policies$
declare action text; expression text;
begin
 expression := '((select auth.uid())=user_id and (select auth.jwt())->>''is_anonymous'' is distinct from ''true'')';
 foreach action in array array['select','insert','update','delete'] loop
  execute format('drop policy if exists %I on public.academy_private_records', 'academy_private_records_'||action||'_own');
  if action='select' or action='delete' then
   execute format('create policy %I on public.academy_private_records for %s to authenticated using (%s)',
    'academy_private_records_'||action||'_own',action,expression);
  elsif action='insert' then
   execute format('create policy academy_private_records_insert_own on public.academy_private_records for insert to authenticated with check (%s)', expression);
  else
   execute format('create policy academy_private_records_update_own on public.academy_private_records for update to authenticated using (%s) with check (%s)',expression,expression);
  end if;
 end loop;
end $policies$;
-- Cota de pesquisas pode ser consultada apenas pelo usuário autenticado não-anônimo.
alter table public.academy_research_requests force row level security;
drop policy if exists research_read_owner on public.academy_research_requests;
drop policy if exists research_insert_owner on public.academy_research_requests;
create policy research_read_owner on public.academy_research_requests for select to authenticated
 using ((select auth.uid())=user_id and (select auth.jwt())->>'is_anonymous' is distinct from 'true');
create policy research_insert_owner on public.academy_research_requests for insert to authenticated
 with check ((select auth.uid())=user_id and (select auth.jwt())->>'is_anonymous' is distinct from 'true');
-- Índices sem leitura em uma base vazia são esperados: não eliminá-los prematuramente.
