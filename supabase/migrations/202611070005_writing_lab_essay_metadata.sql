-- WRITING LAB A1 — atualização aditiva da tabela privada de redações.
-- Não altera texto, versões, avaliações, IDs, usuários nem metas existentes.
-- Metadados opcionais preservam compatibilidade de redações históricas sem proposta.
alter table public.academy_essays
 add column if not exists proposal_id text,
 add column if not exists proposal_version integer,
 add column if not exists writing_mode text not null default 'treino',
 add column if not exists elapsed_seconds integer not null default 0;

do $check$
begin
 if not exists(select 1 from pg_constraint where conrelid='public.academy_essays'::regclass
  and conname='academy_essay_writing_mode_check') then
  alter table public.academy_essays add constraint academy_essay_writing_mode_check
   check(writing_mode in ('treino','simulado'));
 end if;
 if not exists(select 1 from pg_constraint where conrelid='public.academy_essays'::regclass
  and conname='academy_essay_elapsed_seconds_check') then
  alter table public.academy_essays add constraint academy_essay_elapsed_seconds_check
   check(elapsed_seconds between 0 and 604800);
 end if;
 if not exists(select 1 from pg_constraint where conrelid='public.academy_essays'::regclass
  and conname='academy_essay_proposal_version_check') then
  alter table public.academy_essays add constraint academy_essay_proposal_version_check
   check(proposal_version is null or proposal_version>=1);
 end if;
end $check$;
comment on column public.academy_essays.proposal_id is
 'Identificador de proposta editorial verificada no catálogo estático. NULL em redações legadas.';
comment on column public.academy_essays.proposal_version is
 'Versão da proposta escolhida. Mantida mesmo quando o catálogo for atualizado.';
comment on column public.academy_essays.writing_mode is
 'Modo de escrita: treino ou simulado. Sem correção automática na subetapa A.';
comment on column public.academy_essays.elapsed_seconds is
 'Tempo de escrita medido pelo editor (segundos); não representa duração oficial do ENEM.';
-- A tabela já possui RLS própria e FK composta para impedir objetivos de outro aluno.
