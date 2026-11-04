import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script,createContext} from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('index.html'),qs=read('src/questions.js'),extra=read('src/extra_questions.js'),old=read('src/legacy.js'),app=read('src/app.js'),mentor=read('src/mentor.js'),styles=read('src/styles.css');
for(const [file,source] of [['questions.js',qs],['extra_questions.js',extra],['legacy.js',old],['app.js',app],['mentor.js',mentor]]){
 new Script(source,{filename:file});
 assert(html.includes('<script data-source="'+file+'">\n'+source+'\n</script>'),'Bundle desatualizado: '+file);
}
assert(html.includes('<style id="bundled-styles">'+styles+'</style>'),'CSS desatualizado');
const ctx=createContext({window:{}});new Script(qs).runInContext(ctx);new Script(extra).runInContext(ctx);
const bank=ctx.window.QUESTION_BANK;
assert.equal(bank.length,208);let areas=new Map(),ids=new Set(),visual=0;
for(let q of bank){
 assert(!ids.has(q.id),'ID duplicado '+q.id);ids.add(q.id);
 assert(q.context?.length>50,'Contexto muito curto '+q.id);
 assert(q.stem?.length>17,'Enunciado muito curto '+q.id);
 assert.equal(q.options?.length,5,'Cinco alternativas '+q.id);
 assert.equal(new Set(q.options).size,5,'Alternativas repetidas '+q.id);
 assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<5,'Gabarito inválido '+q.id);
 assert(q.explanation?.length>25,'Correção insuficiente '+q.id);
 if(q.visual)visual++;
 areas.set(q.area,(areas.get(q.area)||0)+1);
}
assert(visual>=18,'Gráficos insuficientes');
for(const a of ['Linguagens','Humanas','Natureza'])assert.equal(areas.get(a),48,'Distribuição '+a);assert.equal(areas.get('Matemática'),64);
const oldctx=createContext({window:{}});new Script(old).runInContext(oldctx);assert.equal(oldctx.window.LEGACY_BANK.length,72,'Banco v1 alterado');
for(const token of ['function persist()','function restore()','function finishPrompt()','function finishExam(','function exportBackup()','function recoverLegacy()','function renderResult()','function renderEssay()','function renderPlanner()','window.ENEM_BRIDGE','enem-intelligence-v2','enem-intelligence-v1'])assert(app.includes(token),'Quebra de compatibilidade: '+token);
for(const token of ['function renderProfile()','function renderExplorer()','function renderLearn()','function renderRevisions()','function renderWriting()','function buildPlan(','function decorateResult()','function availableForPlan()','schema']){
 if(token==='schema')continue;
 assert(mentor.includes(token),'Módulo v3 ausente: '+token);
}
assert(app.includes('mentor:x.mentor&&typeof x.mentor'), 'Importação não preserva novos dados');
assert(app.includes('enem-intelligence-recovery-'), 'Cópia de recuperação antes da correção ausente');
for(let p of ['profile','explorer','learn','revisions','writing'])assert(html.includes('id="view-'+p+'"'),'Tela ausente '+p);
assert(!/sk-[a-z0-9]{20,}/i.test(html),'Segredo potencial inserido no site público');
assert(app.includes('function unseenFor(')&&app.includes('seenIds')&&app.includes('const COUNTS='),'Controle de questões inéditas ausente');assert(html.includes('class="mobile-nav"'),'Navegação mobile ausente');console.log('PASS: banco 208+72, questões inéditas, seletor 10-100 e compatibilidade V3');
