import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {Script,createContext} from 'node:vm';
import {allocateDaily,generateSchedule,verifySchedule,urgency} from '../academy/scheduler.mjs';
import {evaluateDiagnostic,selectDiagnosticQuestions} from '../academy/diagnostics.mjs';
const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
const now=new Date('2026-11-05T12:00:00');
const goals=[{id:'enem',status:'active',diagnostic_status:'completed',priority:'high',exam_type:'ENEM',subjects:['Matemática'],exam_date:'2026-11-08'},
{id:'bb',status:'active',diagnostic_status:'completed',priority:'medium',exam_type:'Concurso federal',subjects:['Português'],date_tbd:true},
{id:'pf',status:'active',diagnostic_status:'completed',priority:'low',exam_type:'Concurso federal',subjects:['Raciocínio lógico'],date_tbd:true}];
const a=allocateDaily(goals,120,now);
assert.equal(a.reduce((n,x)=>n+x.minutes,0),120,'Não deve exceder 2 horas no total');
assert.equal(a.length,3);
assert(a.find(x=>x.goal_id==='enem').minutes>a.find(x=>x.goal_id==='pf').minutes,'Urgência deve influenciar');
for(const minutes of [0,5,10,15,30,60,90,120,180,240,360,720]){
 const r=allocateDaily(goals,minutes,now);
 assert(r.reduce((n,x)=>n+x.minutes,0)<=minutes);
}
assert.equal(allocateDaily([{...goals[0],status:'paused'}],120,now).length,0);
const avail={0:0,1:120,2:120,3:120,4:120,5:120,6:0};
const tasks=generateSchedule({goals,availability:avail,start:now,days:7});
const checked=verifySchedule(tasks,avail);assert(checked.valid,JSON.stringify(checked.conflicts));
for(const [day,minutes] of Object.entries(checked.dayTotals)){let d=new Date(day+'T12:00:00');assert(minutes<=avail[d.getDay()]);}
const update=generateSchedule({goals,availability:avail,start:now,days:7,existing:tasks});
assert.equal(update.length,0,'Plano existente não deve duplicar tarefas');
const completed=[{...tasks[0],status:'completed'}];
const regen=generateSchedule({goals,availability:avail,start:now,days:7,existing:completed});
assert(!regen.some(x=>x.goal_id===completed[0].goal_id&&x.day===completed[0].day));
const conflicting=[{goal_id:'enem',day:'2026-11-06',minutes:100,start_minute:1080},{goal_id:'bb',day:'2026-11-06',minutes:50,start_minute:1100}];
assert(!verifySchedule(conflicting,avail).valid,'Detecta sobrecarga e sobreposição');
const vm=createContext({window:{}});
for(const p of ['src/questions.js','src/extra_questions.js','src/advanced_questions.js']) new Script(read(p)).runInContext(vm);
const bank=vm.window.QUESTION_BANK;assert.equal(bank.length,224);
const sample=selectDiagnosticQuestions(bank,{exam_type:'ENEM',subjects:[]},20);
assert.equal(sample.length,20);assert.equal(new Set(sample.map(x=>x.id)).size,20);
const answers={};for(const [i,q] of sample.entries())if(i%3===0)answers[q.id]=q.answer;else if(i%3===1)answers[q.id]=(q.answer+1)%5;
const grade=evaluateDiagnostic(sample.map(q=>q.id),answers,bank);
assert.equal(grade.correct,7);assert.equal(grade.wrong,7);assert.equal(grade.blank,6);assert.equal(grade.answered,14);
assert(Object.values(grade.needs).every(x=>x.confidence));
assert.equal(selectDiagnosticQuestions(bank,{exam_type:'Concurso federal',allow_provisional:false},20).length,0);
assert.equal(selectDiagnosticQuestions(bank,{exam_type:'Concurso federal',allow_provisional:true},10).length,10);
assert.equal(selectDiagnosticQuestions(bank,{exam_type:'ENEM'},20,bank.map(q=>q.id)).length,0);
const schema=read('supabase/migrations/202611050001_vyzo_academy_v8.sql');
for(const name of ['academy_profiles','academy_goals','academy_diagnostics','academy_study_tasks','academy_essays','academy_study_sessions','academy_legacy_imports'])assert(schema.includes(`'${name}'`));
assert(schema.includes('ENABLE ROW LEVEL SECURITY')&&schema.includes('WITH CHECK ((select auth.uid()) = user_id)'));
assert(schema.includes('foreign key(goal_id,user_id)'), 'FK composta contra IDOR');
assert(!/create\s+table[^;]+password\s+(?:text|varchar)/i.test(schema));
const app=read('academy/app.mjs'),config=read('academy/config.js');
assert(app.includes('signUp(')&&app.includes('signInWithPassword(')&&app.includes('resetPasswordForEmail('));
assert(!/sb_secret_|service_role\s*[:=]/.test(config),'Não permitir segredos na configuração pública');
assert(!/localStorage\.setItem\(\s*['"]password/.test(app));
assert(app.includes('email_confirmed_at'));
console.log('PASS V8: alocação global, calendário, conflitos, 224 itens autorais, diagnóstico, RLS, Auth e privacidade');
