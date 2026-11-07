-- BLOCO 02/A — cota de IA atômica e auditoria de uso, apenas no banco Academy.
-- Preserva IDs e dados existentes e não libera novas contas ou gasto de IA.
alter table public.academy_research_requests
  add column if not exists status text not null default 'reserved',
  add column if not exists model text,
  add column if not exists input_tokens integer not null default 0,
  add column if not exists output_tokens integer not null default 0,
  add column if not exists total_tokens integer not null default 0,
  add column if not exists web_search_calls integer not null default 0,
  add column if not exists estimated_usd numeric(14,6),
  add column if not exists completed_at timestamptz;

do $check$
begin
 if not exists(select 1 from pg_constraint where conrelid='public.academy_research_requests'::regclass and conname='academy_research_status_check') then
  alter table public.academy_research_requests add constraint academy_research_status_check
  check(status in ('reserved','completed','provider_error','timeout','invalid_output'));
 end if;
 if not exists(select 1 from pg_constraint where conrelid='public.academy_research_requests'::regclass and conname='academy_research_usage_check') then
  alter table public.academy_research_requests add constraint academy_research_usage_check
  check(input_tokens>=0 and output_tokens>=0 and total_tokens>=0
   and web_search_calls between 0 and 2 and (estimated_usd is null or estimated_usd>=0));
 end if;
end $check$;

-- Não se aceita inserir registros de quota diretamente pelo cliente.
revoke insert,update,delete on public.academy_research_requests from anon,authenticated;
drop policy if exists "research_insert_owner" on public.academy_research_requests;

-- RPC security-definer estritamente limitado a reservar a cota DO PRÓPRIO
-- usuário confirmado e habilitado por app_metadata (nunca user_metadata).
-- advisory lock transacional resolve corrida entre requisições simultâneas.
create or replace function public.academy_reserve_research(p_query_length integer)
returns uuid
language plpgsql
security definer
set search_path=pg_catalog,pg_temp
as $func$
declare
  v_user uuid := (select auth.uid());
  v_count integer;
  v_key uuid;
  v_start timestamptz := date_trunc('day',now() at time zone 'UTC') at time zone 'UTC';
begin
  if v_user is null or not exists(
    select 1 from auth.users u
    where u.id=v_user and u.email_confirmed_at is not null
      and not coalesce(u.is_anonymous,false)
      and u.raw_app_meta_data->>'academy_ai_research_allowed'='true'
  ) then
    raise exception 'Pesquisa não autorizada para esta conta.'
      using errcode='42501';
  end if;
  if p_query_length is null or p_query_length not between 3 and 150 then
    raise exception 'Comprimento de pesquisa inválido.' using errcode='22023';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user::text,20261107)
  );
  select count(*) into v_count from public.academy_research_requests r
   where r.user_id=v_user and r.created_at>=v_start;
  if v_count>=6 then
    raise exception 'Cota diária de pesquisa esgotada.'
      using errcode='P0001';
  end if;
  select count(*) into v_count from public.academy_research_requests r
   where r.user_id=v_user and r.created_at>=now()-interval '60 seconds';
  if v_count>=2 then
    raise exception 'Aguarde antes de pesquisar novamente.'
      using errcode='P0001';
  end if;
  insert into public.academy_research_requests(user_id,query_length,status)
    values(v_user,p_query_length,'reserved') returning id into v_key;
  return v_key;
end
$func$;

revoke all on function public.academy_reserve_research(integer) from public,anon;
grant execute on function public.academy_reserve_research(integer) to authenticated;

comment on function public.academy_reserve_research(integer)
 is 'Reserva quota por identidade JWT confirmada e app_metadata autorizado; 6/dia e 2/min; atomicamente sob advisory lock.';
comment on table public.academy_research_requests
 is 'Telemetria sem texto de consulta, sem prompt e sem chave de provedor; linha visível só pelo titular RLS.';
