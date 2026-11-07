-- Stage 02 RLS live test. Run ONLY in the dedicated Academy project.
-- All temporary users and student data are rolled back.
begin;
-- Habilitação somente dentro da transação que será revertida ao fim.
update academy_internal.registration_gate set enabled=true where singleton=true;
insert into auth.users(id,email,aud,role,is_sso_user,is_anonymous,raw_user_meta_data)
values
 ('a0a0a0a0-0000-4000-8000-000000000001','vyzo-stage02-a@example.invalid','authenticated','authenticated',false,false,'{"vyzo_adult_attested":"true"}'::jsonb),
 ('b0b0b0b0-0000-4000-8000-000000000002','vyzo-stage02-b@example.invalid','authenticated','authenticated',false,false,'{"vyzo_adult_attested":"true"}'::jsonb);

insert into public.academy_goals(id,user_id,exam_type,exam_name)
values
 ('a0a0a0a0-1000-4000-8000-000000000001','a0a0a0a0-0000-4000-8000-000000000001','ENEM','Objetivo do aluno A'),
 ('b0b0b0b0-1000-4000-8000-000000000002','b0b0b0b0-0000-4000-8000-000000000002','ENEM','Objetivo do aluno B');
insert into public.academy_assessment_sessions(id,user_id,goal_id)
values
 ('a0a0a0a0-2000-4000-8000-000000000001','a0a0a0a0-0000-4000-8000-000000000001','a0a0a0a0-1000-4000-8000-000000000001'),
 ('b0b0b0b0-2000-4000-8000-000000000002','b0b0b0b0-0000-4000-8000-000000000002','b0b0b0b0-1000-4000-8000-000000000002');
insert into public.academy_assessment_answers(user_id,session_id,question_id,selected_option)
values
 ('a0a0a0a0-0000-4000-8000-000000000001','a0a0a0a0-2000-4000-8000-000000000001','test-qa',1),
 ('b0b0b0b0-0000-4000-8000-000000000002','b0b0b0b0-2000-4000-8000-000000000002','test-qa',2);
insert into public.academy_study_plans(id,user_id,goal_id,title)
values
 ('a0a0a0a0-3000-4000-8000-000000000001','a0a0a0a0-0000-4000-8000-000000000001','a0a0a0a0-1000-4000-8000-000000000001','Plano do aluno A'),
 ('b0b0b0b0-3000-4000-8000-000000000002','b0b0b0b0-0000-4000-8000-000000000002','b0b0b0b0-1000-4000-8000-000000000002','Plano do aluno B');

set local role authenticated;
select set_config('request.jwt.claim.sub','a0a0a0a0-0000-4000-8000-000000000001',true);
select set_config('request.jwt.claims','{"sub":"a0a0a0a0-0000-4000-8000-000000000001","role":"authenticated","is_anonymous":false}',true);
do $test_a$
declare n int;
begin
 select count(*) into n from public.academy_goals;
 if n<>1 then raise exception 'RLS FAIL: student A sees % goals, expected 1',n; end if;
 select count(*) into n from public.academy_assessment_answers;
 if n<>1 then raise exception 'RLS FAIL: student A sees % answers, expected 1',n; end if;
 select count(*) into n from public.academy_study_plans;
 if n<>1 then raise exception 'RLS FAIL: student A sees % plans, expected 1',n; end if;
 update public.academy_goals set exam_name='tampered' where id='b0b0b0b0-1000-4000-8000-000000000002';
 if found then raise exception 'RLS FAIL: A changed B goal'; end if;
 begin
  update public.academy_goals set user_id='b0b0b0b0-0000-4000-8000-000000000002'
   where id='a0a0a0a0-1000-4000-8000-000000000001';
  raise exception 'RLS FAIL: owner reassignment allowed';
 exception when insufficient_privilege or foreign_key_violation or check_violation then null; end;
 begin
  insert into public.academy_assessment_sessions(user_id,goal_id)
  values('a0a0a0a0-0000-4000-8000-000000000001','b0b0b0b0-1000-4000-8000-000000000002');
  raise exception 'RLS FAIL: session linked to foreign goal';
 exception when foreign_key_violation or insufficient_privilege then null; end;
 begin
  insert into public.academy_assessment_answers(user_id,session_id,question_id)
  values('a0a0a0a0-0000-4000-8000-000000000001','b0b0b0b0-2000-4000-8000-000000000002','foreign-session');
  raise exception 'RLS FAIL: answer linked to foreign session';
 exception when foreign_key_violation or insufficient_privilege then null; end;
 begin
  insert into public.academy_plan_tasks(user_id,plan_id,scheduled_for,minutes,subject)
  values('a0a0a0a0-0000-4000-8000-000000000001','b0b0b0b0-3000-4000-8000-000000000002',current_date,30,'Matemática');
  raise exception 'RLS FAIL: task linked to foreign plan';
 exception when foreign_key_violation or insufficient_privilege then null; end;
end $test_a$;

select set_config('request.jwt.claim.sub','b0b0b0b0-0000-4000-8000-000000000002',true);
select set_config('request.jwt.claims','{"sub":"b0b0b0b0-0000-4000-8000-000000000002","role":"authenticated","is_anonymous":false}',true);
do $test_b$
declare n int;
begin
 select count(*) into n from public.academy_goals;
 if n<>1 then raise exception 'RLS FAIL: student B sees % goals, expected 1',n; end if;
 select count(*) into n from public.academy_assessment_answers;
 if n<>1 then raise exception 'RLS FAIL: student B sees % answers, expected 1',n; end if;
end $test_b$;

select set_config('request.jwt.claims','{"sub":"b0b0b0b0-0000-4000-8000-000000000002","role":"authenticated","is_anonymous":true}',true);
do $test_anonymous_auth$
declare n int;
begin
 select count(*) into n from public.academy_goals;
 if n<>0 then raise exception 'RLS FAIL: anonymous-auth JWT sees private goals'; end if;
 begin
  insert into public.academy_goal_subjects(user_id,goal_id,subject_code,subject_name)
  values('b0b0b0b0-0000-4000-8000-000000000002','b0b0b0b0-1000-4000-8000-000000000002','mat','Matemática');
  raise exception 'RLS FAIL: anonymous-auth JWT inserted private data';
 exception when insufficient_privilege then null; end;
end $test_anonymous_auth$;

set local role anon;
do $test_no_auth$
begin
 begin
  perform count(*) from public.academy_goals;
  raise exception 'RLS FAIL: anon role queried private table';
 exception when insufficient_privilege then null; end;
end $test_no_auth$;

rollback;
select 'PASS: Student A/B isolation; ownership immutable; composite foreign keys; anonymous denied; fixtures rolled back' as stage02_rls_result;
