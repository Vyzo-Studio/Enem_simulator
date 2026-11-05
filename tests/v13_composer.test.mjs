import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {composeExam,computeExamBlueprint,quotaPlan,isSupportedVisual} from '../academy/v11-composer.mjs';
import {renderFigure} from '../academy/v11-visual.mjs';
import {sampleDiagnostic,suitableQuestions,analyzeAnswers} from '../academy/v9-core.mjs';
const ctx=vm.createContext({window:{}});
for(const path of ['questions','extra_questions','advanced_questions'])
 vm.runInContext(readFileSync(new URL('../src/'+path+'.js',import.meta.url),'utf8'),ctx);
const bank=ctx.window.QUESTION_BANK,goal={id:'enem-v13',name:'ENEM',type:'ENEM',subjects:['Linguagens','Humanas','Natureza','Matemática']};
assert.equal(bank.length,224);
const visual=bank.filter(q=>q.visual);
assert.equal(visual.length,22,'Os 22 itens visuais devem ser preservados');
for(const q of visual){
 assert(isSupportedVisual(q.visual),'Visual incompatível '+q.id);
 const html=renderFigure(q.visual);
 assert(html.includes('<figure')&&html.includes('figcaption'),q.id);
 assert(!html.includes('undefined'),q.id);
}
for(const count of [10,20,30,40,50]){
 const expected=quotaPlan(count);
 for(let seed=0;seed<15;seed++){
  const language=seed%2?'Espanhol':'Inglês',opts={mode:'general',language,seed:'v13-'+count+'-'+seed};
  const pool=suitableQuestions(bank,{...goal,foreignLanguage:language});
  const exam=composeExam(pool,goal,count,opts);
  assert.equal(exam.questions.length,count);
  assert.equal(new Set(exam.blueprint.ids).size,count);
  for(const area of Object.keys(expected))assert.equal(exam.blueprint.areas[area],expected[area],area+' n='+count);
  assert.deepEqual(exam.blueprint.areas,computeExamBlueprint(exam.questions).areas);
  assert(exam.questions.some(q=>q.subject===language),'Falta língua '+language);
  assert(exam.questions.every(q=>q.subject!== (language==='Inglês'?'Espanhol':'Inglês')));
  const replay=composeExam(pool,goal,count,opts);
  assert.deepEqual(exam.blueprint.ids,replay.blueprint.ids,'Semente não determinística');
  assert(exam.questions.every(q=>!q.visual||isSupportedVisual(q.visual)));
 }
}
for(const [mode,allowed] of [['day1',['Linguagens','Humanas']],['day2',['Natureza','Matemática']]]){
 const exam=composeExam(suitableQuestions(bank,goal),goal,30,{mode});
 assert(exam.questions.every(q=>allowed.includes(q.area)));
 for(const area of allowed)assert.equal(exam.blueprint.areas[area],15);
}
const math=composeExam(suitableQuestions(bank,goal),goal,20,{mode:'area',area:'Matemática'});
assert(math.questions.every(q=>q.area==='Matemática'));
const portuguese=composeExam(suitableQuestions(bank,goal),goal,10,{mode:'subject',subject:'Português'});
assert(portuguese.questions.every(q=>q.subject==='Português'));
assert.throws(()=>composeExam(bank.filter(q=>q.area==='Linguagens'),goal,30,{mode:'general'}),/equilibrado/);
const all=sampleDiagnostic(bank,{...goal,foreignLanguage:'Espanhol'},30);
assert.equal(all.length,30);
assert.equal(all.filter(q=>q.area==='Linguagens').length,8);
assert(all.some(q=>q.subject==='Espanhol')&&!all.some(q=>q.subject==='Inglês'));
const answers=Object.fromEntries(all.slice(0,12).map((q,i)=>[q.id,i%2?q.answer:(q.answer+1)%5]));
const report=analyzeAnswers(goal,{ids:all.map(q=>q.id),answers,kind:'initial'},bank);
assert.equal(report.total,30);
assert.equal(report.answered,12);
assert.equal(report.blank,18);
assert.equal(Object.values(report.byArea).reduce((n,v)=>n+v.total,0),30);
assert.equal(Object.values(report.byArea).reduce((n,v)=>n+v.blank,0),18);
console.log('PASS V13: 75 composições, quotas por área, 22 visuais, espanhol/inglês, 1º/2º dia, relatório por área.');
