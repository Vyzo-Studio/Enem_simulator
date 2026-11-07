-- BLOCO 02/A — QA real do PostgreSQL; TODOS os dados e mudanças de gate são revertidos.
begin;
update academy_internal.registration_gate set enabled=true where singleton=true;
insert into auth.users(
 id,email,aud,role,is_sso_user,is_anonymous,email_confirmed_at,raw_user_meta_data,raw_app_meta_data
) values
 ('a0a0a0a0-6202-4000-8000-000000000001','block02-a@example.invalid','authenticated','authenticated',false,false,now(),
  '{"vyzo_adult_attested":"true"}','{"academy_ai_research_allowed":true}'),
 ('b0b0b0b0-6202-4000-8000-000000000002','block02-b@example.invalid','authenticated','authenticated',false,false,now(),
  '{"vyzo_adult_attested":"true"}','{"academy_ai_research_allowed":true}'),
 ('c0c0c0c0-6202-4000-8000-000000000003','block02-not-allowed@example.invalid','authenticated','authenticated',false,false,now(),
  '{"vyzo_adult_attested":"true"}','{}');

set local role authenticated;
select set_config('request.jwt.claim.sub','a0a0a0a0-6202-4000-8000-000000000001',true);
select set_config('request.jwt.claims','{"sub":"a0a0a0a0-6202-4000-8000-000000000001","role":"authenticated","is_anonymous":false}',true);
do $test_a$
declare
 first_id uuid; second_id uuid; denied boolean:=false;
begin
 first_id:=public.academy_reserve_research(8);
 second_id:=public.academy_reserve_research(12);
 if first_id=second_id then raise exception 'FAIL: reservation IDs duplicated';end if;
 begin
  perform public.academy_reserve_research(20);
 exception when sqlstate 'P0001' then denied:=true;
 end;
 if not denied then raise exception 'FAIL: concurrent/minute quota not enforced';end if;
 denied:=false;
 begin
  insert into public.academy_research_requests(user_id,query_length)
  values('a0a0a0a0-6202-4000-8000-000000000001',20);
 exception when insufficient_privilege then denied:=true;
 end;
 if not denied then raise exception 'FAIL: user can bypass RPC with INSERT';end if;
 if (select count(*) from public.academy_research_requests)<>2 then
  raise exception 'FAIL: A cannot see own two records';
 end if;
end $test_a$;

select set_config('request.jwt.claim.sub','b0b0b0b0-6202-4000-8000-000000000002',true);
select set_config('request.jwt.claims','{"sub":"b0b0b0b0-6202-4000-8000-000000000002","role":"authenticated","is_anonymous":false}',true);
do $test_b$
begin
 if (select count(*) from public.academy_research_requests)<>0 then
  raise exception 'FAIL: B sees records from A';
 end if;
 perform public.academy_reserve_research(7);
 if (select count(*) from public.academy_research_requests)<>1 then
  raise exception 'FAIL: quota B not independent of A';
 end if;
end $test_b$;

select set_config('request.jwt.claim.sub','c0c0c0c0-6202-4000-8000-000000000003',true);
select set_config('request.jwt.claims','{"sub":"c0c0c0c0-6202-4000-8000-000000000003","role":"authenticated","is_anonymous":false}',true);
do $test_c$
declare denied boolean:=false;
begin
 begin
  perform public.academy_reserve_research(5);
 exception when insufficient_privilege then denied:=true;
 end;
 if not denied then raise exception 'FAIL: non-approved user got research quota';end if;
end $test_c$;

reset role;
rollback;
select 'PASS: quota 2/min, owner A/B isolation, direct insert blocked, unauthorized rejected; test data rolled back' as result;
