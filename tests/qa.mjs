import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script,createContext} from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('index.html'),qs=read('src/questions.js'),extra=read('src/extra_questions.js'),advanced=read('src/advanced_questions.js'),old=read('src/legacy.js'),app=read('src/app.js'),mentor=read('src/mentor.js'),styles=read('src/styles.css');
for(const [file,source] of [['questions.js',qs],['extra_questions.js',extra],['advanced_questions.js',advanced],['legacy.js',old],['app.js',app],['mentor.js',mentor]]){
 new Script(source,{filename:file});
 assert(html.includes('<script data-source="'+file+'">\n'+source+'\n</script>'),'Bundle desatualizado: '+file);
}
assert(html.includes('<style id="bundled-styles">'+styles+'</style>'),'CSS desatualizado');
const ctx=createContext({window:{}});new Script(qs).runInContext(ctx);new Script(extra).runInContext(ctx);new Script(advanced).runInContext(ctx);
const bank=ctx.window.QUESTION_BANK;
assert.equal(bank.length,224);let areas=new Map(),ids=new Set(),visual=0;
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
for(const a of ['Linguagens','Humanas','Natureza'])assert.equal(areas.get(a),52,'Distribuição '+a);assert.equal(areas.get('Matemática'),68);
const oldctx=createContext({window:{}});new Script(old).runInContext(oldctx);assert.equal(oldctx.window.LEGACY_BANK.length,72,'Banco v1 alterado');
for(const token of ['function persist()','function restore()','function finishPrompt()','function finishExam(','function exportBackup()','function recoverLegacy()','function renderResult()','function renderEssay()','function renderPlanner()','window.ENEM_BRIDGE','enem-intelligence-v2','enem-intelligence-v1'])assert(app.includes(token),'Quebra de compatibilidade: '+token);
for(const token of ['function renderProfile()','function renderExplorer()','function renderLearn()','function renderRevisions()','function renderWriting()','function buildPlan(','function decorateResult()','function availableForPlan()','schema']){
 if(token==='schema')continue;
 assert(mentor.includes(token),'Módulo v3 ausente: '+token);
}
assert(app.includes('mentor:{...fromMentor,...myMentor')&&app.includes('mergedEssay')&&app.includes('savedExams')&&app.includes('const byId=new Map('),'Importação deve mesclar e preservar históricos, mentor, provas e rascunhos');
assert(app.includes('enem-intelligence-recovery-'), 'Cópia de recuperação antes da correção ausente');
for(let p of ['profile','explorer','learn','revisions','writing'])assert(html.includes('id="view-'+p+'"'),'Tela ausente '+p);
assert(!/sk-[a-z0-9]{20,}/i.test(html),'Segredo potencial inserido no site público');
assert(app.includes('function unseenFor(')&&app.includes('seenIds')&&app.includes('const COUNTS='),'Controle de questões inéditas ausente');assert(html.includes('class="mobile-nav"'),'Navegação mobile ausente');assert(bank.filter(q=>q.difficulty==='Avançada').length>=16,'Faltam questões avançadas');
assert(app.includes('function validateHistoryRecord(record)')&&app.includes("dialog.classList.add('hidden')")&&app.includes('data-map-filter'),'Proteções V6 ausentes');
assert(!app.includes('.slice(0,150)'),'Histórico com descarte silencioso');
console.log('PASS: banco 224+72, questões inéditas, seletor 10-100 e compatibilidade V3');

assert(app.includes('id="cfg-time-mode"'),'Seleção de modos de tempo ausente');
assert(app.includes("if(ex.timed&&remaining(ex)<=0){finishExam('tempo encerrado');return}"),'Retomada de prova com prazo expirado não tratada');
assert(html.includes('timer-low'),'Alerta visual de tempo ausente');


// Verificações adicionais V5 de layout e segurança.
const v5app=read('src/app.js'),v5css=read('src/styles.css'),v5mentor=read('src/mentor.js'),v5template=read('src/template.html');
for(const token of ['dashboard-hero','setup-layout','exam-map-panel','toggle-map','writing-tabs','function applyImport(x,mode=','function renderRecoveryExtras()','pendingExternal']) assert(v5app.includes(token),'Componente V5 ausente: '+token);
for(const token of ['nav-shade','nav-group','nav-svg','data-nav="essay"']) assert(v5template.includes(token),'Navegação V5 ausente: '+token);
assert(v5mentor.includes('Salvar e sortear'),'Troca de tema de redação sem proteção');
assert(!v5mentor.includes('m.studyMinutes+=25'),'Tempo fictício registrado como estudo');
assert(v5css.includes('body.exam-map-open .q-sidebar'),'Mapa de prova mobile ausente');
console.log('PASS: recursos V5, proteção de rascunhos, estrutura responsiva e compatibilidade com versões anteriores.');
