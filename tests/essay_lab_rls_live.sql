-- WRITING LAB A — TESTE REAL PostgreSQL COM ROLLBACK OBRIGATÓRIO.
-- Requer migração writing_lab_essay_metadata previamente aplicada.
begin;
update academy_internal.registration_gate set enabled=true where singleton=true;
insert into auth.users(id,email,aud,role,is_sso_user,is_anonymous,email_confirmed_at,raw_user_meta_data)
values
 ('a0a0a0a0-4100-4000-8000-000000000001','writing-a@example.invalid','authenticated','authenticated',false,false,now(),'{"vyzo_adult_attested":"true"}'::jsonb),
 ('b0b0b0b0-4100-4000-8000-000000000002','writing-b@example.invalid','authenticated','authenticated',false,false,now(),'{"vyzo_adult_attested":"true"}'::jsonb);
set local role authenticated;
select set_config('request.jwt.claim.sub','a0a0a0a0-4100-4000-8000-000000000001',true);
select set_config('request.jwt.claims','{"sub":"a0a0a0a0-4100-4000-8000-000000000001","role":"authenticated","is_anonymous":false}',true);
insert into public.academy_essays(id,user_id,title,prompt,body,versions)
values('a0a0a0a0-4100-4000-8000-000000000011','a0a0a0a0-4100-4000-8000-000000000001',
 'Redação anterior','Tema pessoal','Texto de outubro','[{"at":"2026-10-01","body":"Versão original","prompt":"Tema antigo"}]'::jsonb);
insert into public.academy_essays(id,user_id,title,prompt,body,versions,proposal_id,proposal_version,writing_mode,elapsed_seconds)
values('a0a0a0a0-4100-4000-8000-000000000012','a0a0a0a0-4100-4000-8000-000000000001',
 'Nova redação','Tema autoral','Texto novo','[]'::jsonb,'enem-inclusao-digital-2026-a1',1,'simulado',70);
do $a$
declare prior_ts timestamptz; affected integer;
begin
 if (select count(*) from public.academy_essays)<>2 then
  raise exception 'FAIL: A não vê ambos registros próprios';end if;
 if (select proposal_id from public.academy_essays where id='a0a0a0a0-4100-4000-8000-000000000011') is not null
  then raise exception 'FAIL: migração alterou redação histórica';end if;
 if (select versions->0->>'body' from public.academy_essays where id='a0a0a0a0-4100-4000-8000-000000000011')<>'Versão original'
  then raise exception 'FAIL: versão antiga alterada';end if;
 select updated_at into prior_ts from public.academy_essays where id='a0a0a0a0-4100-4000-8000-000000000012';
 update public.academy_essays set body='Texto corrigido manualmente',
  updated_at=prior_ts+interval '1 second'
  where id='a0a0a0a0-4100-4000-8000-000000000012' and updated_at=prior_ts;
 get diagnostics affected=row_count;
 if affected<>1 then raise exception 'FAIL: CAS não salvou versão atual';end if;
 update public.academy_essays set body='Sobrescrita antiga'
  where id='a0a0a0a0-4100-4000-8000-000000000012' and updated_at=prior_ts;
 get diagnostics affected=row_count;
 if affected<>0 then raise exception 'FAIL: CAS permite sobrescrita atrasada';end if;
end $a$;
select set_config('request.jwt.claim.sub','b0b0b0b0-4100-4000-8000-000000000002',true);
select set_config('request.jwt.claims','{"sub":"b0b0b0b0-4100-4000-8000-000000000002","role":"authenticated","is_anonymous":false}',true);
do $b$
declare affected integer; denied boolean:=false;
begin
 if (select count(*) from public.academy_essays)<>0
  then raise exception 'FAIL: B pode ler redações de A';end if;
 update public.academy_essays set body='Texto de B' where id='a0a0a0a0-4100-4000-8000-000000000011';
 get diagnostics affected=row_count;
 if affected<>0 then raise exception 'FAIL: B alterou redação de A';end if;
 begin
  insert into public.academy_essays(user_id,title)
   values('a0a0a0a0-4100-4000-8000-000000000001','Invasão');
 exception when insufficient_privilege then denied:=true;
 end;
 if not denied then raise exception 'FAIL: B consegue inserir como A';end if;
end $b$;
reset role;
rollback;
select 'PASS: redações antigas intactas, CAS impede sobrescrita, metadados novos, RLS A/B e rollback' as result;
