import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const sql=readFileSync(new URL('../supabase/proposals/v15_1_curriculum_model.sql',import.meta.url),'utf8');
assert(sql.includes('PROPOSTA NÃO APLICADA'));
const tables=['academy_curriculum_references','academy_school_lessons','academy_school_questions','academy_school_attempts'];
for(const table of tables){
 assert(sql.includes('create table if not exists public.'+table),'Tabela proposta ausente: '+table);
 assert(sql.includes('alter table public.'+table+' enable row level security'),'RLS ausente: '+table);
 assert(sql.includes('alter table public.'+table+' force row level security'),'RLS forçado ausente: '+table);
 assert(sql.includes('revoke all on public.'+table+' from public,anon'),'Acesso anon não revogado: '+table);
}
assert(sql.includes('primary key(id,curriculum_version)'),'Currículo deve suportar versões históricas');
assert(sql.includes('references public.academy_curriculum_references(id,curriculum_version)'));
assert(sql.includes('references public.academy_school_lessons(id,content_version)'));
assert(sql.includes('(select auth.uid())=user_id'));
assert(sql.includes('with check ((select auth.uid())=user_id'));
assert(sql.includes("auth.jwt()->>'is_anonymous' is distinct from 'true'"));
for(const term of ["content_status='publicado'","editorial_approved=true","content_available=true","editor_reviewed_at is not null","reviewed_at is not null"])
 assert(sql.includes(term),'Acesso editorial não condicionado: '+term);
assert(!/grant\s+all\s+on\s+public\.academy_(?:school|curriculum)/i.test(sql));
console.log('PASS V15.1: esquema proposto (NÃO EXECUTADO) contém bloqueios estáticos RLS, owner, revisão e versionamento');
