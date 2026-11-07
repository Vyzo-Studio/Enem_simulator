/** V15 Stage 01 — bloqueios obrigatórios na publicação incremental. */
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';

const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
const unavailable=[
 'academy/v12-entry.html',
 'academy/v12-entry.mjs',
 'academy/v15-school-content.mjs',
 'academy/v15-school-engine.mjs',
 'academy/v15-school-ui.mjs',
 'academy/v15-official-papers.mjs',
 'supabase/proposals/v15_1_curriculum_model.sql'
];
for(const path of unavailable){
 assert.equal(existsSync(new URL(path,root)),false,
  'Recurso em revisão não pode ser incluído no release V15: '+path);
}
// Migrações SQL podem ser versionadas na main sem habilitar a UI de login.
// O núcleo de autenticação V12 é autorizado na Etapa 03; pilotos e entrada V12 separada seguem bloqueados.
assert.match(read('supabase/migrations/202611050003_vyzo_academy_v12.sql'),/academy_private_records/);
assert.match(read('supabase/migrations/202611070003_stage03_registration_gate.sql'),/guard_signup/);
assert.match(read('academy/config.js'),/registrationEnabled: false/);
const html=read('academy/v9.html');
const journey=read('academy/v9.mjs');
const core=read('academy/v9-core.mjs');
assert.match(html,/Modo local · sem conta/,'A jornada precisa identificar explicitamente o modo local.');
assert.match(html,/Entenda o armazenamento local/,'Não anunciar cadastro indisponível.');
assert.doesNotMatch(html,/Ver cadastro em nuvem/);
assert.match(journey,/const KEY='vyzo-academy-v9-guest-1'/,'Chave de histórico local V9 deve permanecer igual.');
assert.match(journey,/schema:9/,'Schema de backup local V9 deve ser preservado.');
assert.match(core,/if\(goal.type==='Prova escolar'\|\|goal.educationStage\)return \[\];/,
 'Nenhuma questão ENEM deve aparecer como diagnóstico de série escolar.');
assert.doesNotMatch(journey,/v12-entry|v12-auth-core|v15-school-content|v15-school-ui/,
 'A versão pública não pode carregar serviços V12 ou pilotos não homologados.');
console.log('PASS release gate: autenticação controlada na Etapa 03, inscrições bloqueadas e pilotos V15.1 isolados; backups V9 preservados.');
