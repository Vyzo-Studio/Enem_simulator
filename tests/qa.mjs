import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script,createContext} from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('index.html'),questionsSource=read('src/questions.js');
const legacySource=read('src/legacy.js'),appSource=read('src/app.js');
for(const [path,source] of [['questions.js',questionsSource],['legacy.js',legacySource],['app.js',appSource]]){
  new Script(source,{filename:path});
  assert(html.includes('<script data-source="'+path+'">\n'+source+'\n</script>'),'Bundle desatualizado: '+path);
}
assert(html.includes('<style id="bundled-styles">'+read('src/styles.css')+'</style>'),'CSS desatualizado');
const context=createContext({window:{}});
new Script(questionsSource).runInContext(context);
const questions=context.window.QUESTION_BANK;
assert.equal(questions.length,64,'O banco novo precisa ter 64 questões');
const ids=new Set(), areas=new Map();
for(const q of questions){
  assert(!ids.has(q.id),'ID duplicado: '+q.id);ids.add(q.id);
  assert(q.context.length>50,'Texto de apoio curto: '+q.id);
  assert(q.stem.length>17,'Enunciado curto: '+q.id);
  assert.equal(q.options.length,5,'Cada questão precisa ter cinco alternativas: '+q.id);
  assert.equal(new Set(q.options).size,5,'Alternativas duplicadas: '+q.id);
  assert(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<=4,'Gabarito inválido: '+q.id);
  assert(q.explanation.length>25,'Correção ausente: '+q.id);
  areas.set(q.area,(areas.get(q.area)||0)+1);
}
for(const a of ['Linguagens','Humanas','Natureza','Matemática'])assert.equal(areas.get(a),16,'Desequilíbrio na área: '+a);
assert(questions.filter(q=>q.visual).length>=10,'Número insuficiente de questões multimodais');
const legacy=createContext({window:{}});
new Script(legacySource).runInContext(legacy);
assert.equal(legacy.window.LEGACY_BANK.length,72,'Banco histórico para resgate incompleto');
for(const token of ['function persist()','function restore()','function finishPrompt()','function finishExam(','function exportBackup()','function recoverLegacy()','function renderResult()','function renderEssay()','function renderPlanner()']){
  assert(appSource.includes(token),'Módulo essencial ausente: '+token);
}
console.log('OK: JS válido, bundle íntegro, 64 questões contextualizadas, 72 questões antigas para resgate, alternativas/gabaritos/diagramas e módulos essenciais');
