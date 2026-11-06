import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  LEGACY_SOURCES,isVerifiedStudent,getVerifiedStudent,privateRoute,safeReturnRoute,
  validateLegacyRecord,scanLegacySources,importLegacyWithConsent
} from '../academy/v12-auth-core.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const u=id=>({id,email:'aluno'+id+'@exemplo.com',email_confirmed_at:'2026-11-05T12:00:00Z'});
assert(isVerifiedStudent(u('a')),'Aluna validada');
assert(!isVerifiedStudent({...u('a'),email_confirmed_at:null}),'Email não confirmado');
assert(!isVerifiedStudent({...u('a'),is_anonymous:true}),'Usuário anônimo');
assert(!isVerifiedStudent({id:'x',email:'sem_email',email_confirmed_at:'2026-11-05'}));
assert.equal(await getVerifiedStudent({auth:{getUser:async()=>({data:{user:null},error:null})}}),null);
assert.equal((await getVerifiedStudent({auth:{getUser:async()=>({data:{user:u('a')},error:null})}})).id,'a');
assert.equal(await getVerifiedStudent({auth:{getUser:async()=>({data:{user:u('a')},error:new Error('sessão expirada')})}}),null);
for(const route of ['/','/index.html','/academy/','/academy/index.html','/academy/v9.html','/academy/demo.html','/academy/v12.html','/Vyzo_Academy/academy/v9.html'])
 assert(privateRoute(route),'Rota privada não listada '+route);
assert.equal(safeReturnRoute('https://site-malicioso.com'),'\/Vyzo_Academy\/academy\/');
assert.equal(safeReturnRoute('/Vyzo_Academy/academy/v9.html'),'/Vyzo_Academy/academy/v9.html');
const storage=new Map();
storage.set('enem-intelligence-v2',JSON.stringify({history:[{id:1}],essay:{body:'redação de teste'}}));
storage.set('vyzo-academy-v9-guest-1',JSON.stringify({schema:9,goals:[{id:'g'}],assessments:[{id:'a'}],tasks:[],profile:{minutes:120}}));
const ls={getItem:k=>storage.get(k)||null,removeItem:k=>storage.delete(k)};
const scanned=scanLegacySources(ls);
assert.equal(scanned.filter(s=>!s.blocked).length,2);
assert.equal(scanned.find(s=>s.key==='vyzo-academy-v9-guest-1').records,1);
assert.throws(()=>validateLegacyRecord(LEGACY_SOURCES[0],JSON.stringify({history:[],access_token:'FALSO'})),/autenticação/);
assert.throws(()=>validateLegacyRecord(LEGACY_SOURCES[2],JSON.stringify({goals:[]})),/incompatível/);
assert.throws(()=>validateLegacyRecord(LEGACY_SOURCES[0],'{não-json'),/JSON válido/);
assert.throws(()=>validateLegacyRecord(LEGACY_SOURCES[0],JSON.stringify({history:[], nested:{password:'falso'}})),/autenticação/);
const rows=[];
const client={
  auth:{getUser:async()=>({data:{user:u('a')},error:null})},
  from(table){
    assert.equal(table,'academy_legacy_imports');
    return {
      select(){
        const filters=[];
        const chain={eq:(k,v)=>{filters.push([k,v]);return chain;},limit:async()=>({data:rows.filter(r=>filters.every(([k,v])=>r[k]===v)),error:null})};
        return chain;
      },
      insert:async row=>{rows.push(row);return {error:null};}
    };
  }
};
await assert.rejects(()=>importLegacyWithConsent({client,storage:ls,user:u('a'),keys:[LEGACY_SOURCES[0].key],confirmed:false}),/confirmar/);
const first=await importLegacyWithConsent({client,storage:ls,user:u('a'),keys:[LEGACY_SOURCES[0].key,LEGACY_SOURCES[2].key],confirmed:true});
assert.equal(first.length,2);assert.equal(rows.length,2);
assert.equal(ls.getItem('enem-intelligence-v2')!==null,true,'Originais locais devem permanecer');
const next=await importLegacyWithConsent({client,storage:ls,user:u('a'),keys:[LEGACY_SOURCES[0].key],confirmed:true});
assert.equal(next[0].alreadySaved,true);assert.equal(rows.length,2,'Importação deve ser idempotente');
await assert.rejects(()=>importLegacyWithConsent({client,storage:ls,user:u('b'),keys:[LEGACY_SOURCES[0].key],confirmed:true}),/conta ativa mudou/);
const config=read('academy/config.js'),gateway=read('academy/v12-entry.html'),entry=read('academy/v12-entry.mjs'),app=read('academy/app.mjs');
assert(gateway.includes('Verificando a segurança do acesso'));
assert(!gateway.includes('src/questions.js'),'Não carregar questões no portal público');
assert(entry.includes('getVerifiedStudent(client)'));
assert(entry.includes('Inscrições ainda não abertas'),'Falha segura se backend ausente');
assert(app.includes('signUp(')&&app.includes('signInWithPassword(')&&app.includes('resetPasswordForEmail('));
assert(app.includes('renderLegacyOptions()'));
assert(!/sb_secret_[a-zA-Z0-9]+|service_role["']\s*:\s*["']/.test(config));
assert(!app.includes("localStorage.setItem('password'"));
const migration=read('supabase/migrations/202611050003_vyzo_academy_v12.sql');
assert(migration.includes('academy_private_records')&&migration.includes('enable row level security'));
assert(migration.includes('academy_legacy_imports_owner_source_hash'),'Cópias idempotentes');
assert(migration.includes('auth.uid()')&&migration.includes('is_anonymous'),'Impedir IDOR e contas anônimas');
for(const verb of ['select','insert','update','delete'])assert(migration.includes('academy_private_records_'+verb+'_own'));
console.log('PASS V12: sessão verificada, rotas, 2 backups, isolamento de conta simulada, RLS estática e proteção de credenciais');
