-- Stage 02: CRUD real, RLS A/B e consistência de objetivo-sessão. Sem persistência de fixtures.
begin;
-- Habilitação somente dentro da transação que será revertida ao fim.
update academy_internal.registration_gate set enabled=true where singleton=true;
insert into auth.users(id,email,aud,role,is_sso_user,is_anonymous,raw_user_meta_data) values
 ('a0a0a0a0-0000-4000-8000-000000000011','stage02crud-a@example.invalid','authenticated','authenticated',false,false,'{"vyzo_adult_attested":"true"}'::jsonb),
 ('b0b0b0b0-0000-4000-8000-000000000012','stage02crud-b@example.invalid','authenticated','authenticated',false,false,'{"vyzo_adult_attested":"true"}'::jsonb);
insert into public.academy_goals(id,user_id,exam_type,exam_name) values
 ('a0a0a0a0-1000-4000-8000-000000000011','a0a0a0a0-0000-4000-8000-000000000011','ENEM','Meta A1'),
 ('a0a0a0a0-1000-4000-8000-000000000013','a0a0a0a0-0000-4000-8000-000000000011','ENEM','Meta A2'),
 ('b0b0b0b0-1000-4000-8000-000000000012','b0b0b0b0-0000-4000-8000-000000000012','ENEM','Meta B1');
insert into public.academy_assessment_sessions(id,user_id,goal_id)
values('a0a0a0a0-2000-4000-8000-000000000011','a0a0a0a0-0000-4000-8000-000000000011','a0a0a0a0-1000-4000-8000-000000000011');
set local role authenticated;
select set_config('request.jwt.claim.sub','a0a0a0a0-0000-4000-8000-000000000011',true);
select set_config('request.jwt.claims','{"sub":"a0a0a0a0-0000-4000-8000-000000000011","role":"authenticated","is_anonymous":false}',true);
do $a$
declare inserted_id uuid; n int;
begin
 insert into public.academy_goal_subjects(user_id,goal_id,subject_code,subject_name)
 values('a0a0a0a0-0000-4000-8000-000000000011','a0a0a0a0-1000-4000-8000-000000000011','mat','Matemática')
 returning id into inserted_id;
 if inserted_id is null then raise exception 'FAIL A INSERT'; end if;
 update public.academy_goal_subjects set subject_name='Matemática avançada' where id=inserted_id;
 if not found then raise exception 'FAIL A UPDATE'; end if;
 select count(*) into n from public.academy_goal_subjects where id=inserted_id and subject_name='Matemática avançada';
 if n<>1 then raise exception 'FAIL A SELECT'; end if;
 delete from public.academy_goal_subjects where id=inserted_id;
 if not found then raise exception 'FAIL A DELETE'; end if;
 begin
  insert into public.academy_activity_history(user_id,goal_id,session_id,event_type)
  values('a0a0a0a0-0000-4000-8000-000000000011','a0a0a0a0-1000-4000-8000-000000000013','a0a0a0a0-2000-4000-8000-000000000011','assessment_finished');
  raise exception 'FAIL: activity history references another same-owner goal';
 exception when foreign_key_violation then null; end;
 begin
  insert into public.academy_revision_items(user_id,goal_id,session_id,question_id)
  values('a0a0a0a0-0000-4000-8000-000000000011','a0a0a0a0-1000-4000-8000-000000000013','a0a0a0a0-2000-4000-8000-000000000011','q-1');
  raise exception 'FAIL: revision references another same-owner goal';
 exception when foreign_key_violation then null; end;
end $a$;
select set_config('request.jwt.claim.sub','b0b0b0b0-0000-4000-8000-000000000012',true);
select set_config('request.jwt.claims','{"sub":"b0b0b0b0-0000-4000-8000-000000000012","role":"authenticated","is_anonymous":false}',true);
do $b$
declare affected int;
begin
 delete from public.academy_goals where id='a0a0a0a0-1000-4000-8000-000000000011';
 get diagnostics affected=row_count;
 if affected<>0 then raise exception 'FAIL: B deleted A goal'; end if;
end $b$;
rollback;
select 'PASS: own CRUD, cross-user DELETE denied, same-owner goal/session coherence, fixtures rolled back' as stage02_integrity;
