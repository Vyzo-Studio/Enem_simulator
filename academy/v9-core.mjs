/** VYZO ACADEMY V9 — avaliação inicial, cobertura curricular e agenda multi-provas. */
import {allocateDaily,validMinutes} from './scheduler.mjs';
import {evaluateDiagnostic} from './diagnostics.mjs';
import {composeExam,isSupportedVisual} from './v11-composer.mjs';
export const EXAM_TYPES=['ENEM','Vestibular','Concurso público','Concurso militar','Certificação profissional','Prova escolar','Outra prova'];
export const AREAS=['Linguagens','Humanas','Natureza','Matemática'];
export const WEEKDAYS=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
export const canonical=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const contain=(hay,needle)=>canonical(hay).includes(canonical(needle))||canonical(needle).includes(canonical(hay));
export const isEnem=goal=>goal.type==='ENEM';
export const hasEnoughEvidence=a=>a?.status==='completed'&&a.report?.answered>=Math.max(3,Math.ceil(a.ids.length*.3));
export const isGoalEvaluated=(goal,assessments)=>assessments.some(a=>a.goalId===goal.id&&a.kind==='initial'&&hasEnoughEvidence(a));
export function suitableQuestions(bank,goal,exclude=[]){
 if(!Array.isArray(bank)||!goal)return [];
 if(!isEnem(goal)&&!goal.provisional)return [];
 const seen=new Set(exclude),language=goal.foreignLanguage==='Espanhol'?'Espanhol':'Inglês';
 const valid=bank.filter(q=>q&&typeof q.id==='string'&&!seen.has(q.id)&&
  q.options?.length===5&&new Set(q.options).size===5&&
  Number.isInteger(q.answer)&&q.answer>=0&&q.answer<=4&&
  q.context&&q.stem&&q.explanation&&isSupportedVisual(q.visual)&&
  (!isEnem(goal)||!['Inglês','Espanhol'].includes(q.subject)||q.subject===language));
 const subjects=(goal.subjects||[]).map(s=>String(s).trim()).filter(Boolean);
 if(isEnem(goal)){
   if(!subjects.length||subjects.some(s=>canonical(s)==='todas'))return valid;
   return valid.filter(q=>subjects.some(s=>contain(q.area,s)||contain(q.subject,s)));
 }
 if(!subjects.length)return valid;
 const matches=valid.filter(q=>subjects.some(s=>contain(q.area,s)||contain(q.subject,s)));
 return matches.length?matches:valid;
}
export function sampleDiagnostic(bank,goal,quantity,excluded=[],options={}){
 const n=Number(quantity);
 if(!Number.isInteger(n)||n<3||n>50)throw Error('Escolha uma quantidade de 3 a 50 questões.');
 const pool=suitableQuestions(bank,goal,excluded);
 const opts={...options,language:options.language||goal.foreignLanguage||'Inglês'};
 return composeExam(pool,goal,n,opts).questions;
}
export function analyzeAnswers(goal,assessment,bank){
 const results=evaluateDiagnostic(assessment.ids,assessment.answers,bank);
 const bySkill={},byArea={};const index=new Map(bank.map(q=>[q.id,q]));
 for(const row of results.rows){const q=index.get(row.id),skill=q.skill||q.competence;const area=byArea[q.area]??={total:0,answered:0,correct:0,wrong:0,blank:0};area.total++;area[row.status]++;if(row.status!=='blank')area.answered++;if(!skill)continue;
 const obj=bySkill[skill]??={total:0,answered:0,correct:0,wrong:0,blank:0};obj.total++;obj[row.status]++;if(row.status!=='blank')obj.answered++;
 }
 const topics={};
 for(const [name,s] of Object.entries(results.byTopic)){
   const rate=s.answered?s.correct/s.answered:null;
   const label=s.answered<3?'Não avaliado suficientemente':rate<.5?'Precisa de revisão':rate<.8?'Em desenvolvimento':s.answered>=5?'Domínio demonstrado':'Em desenvolvimento';
   topics[name]={...s,accuracy:s.answered?Math.round(rate*100):null,label,evidence:s.answered<3?'Amostra insuficiente':s.answered<5?'Evidência limitada':'Evidência moderada'};
 }
 return {...results,bySkill,byArea,topics,examName:goal.name,kind:assessment.kind,measuredAt:Date.now()};
}
export function topicRecommendations(goal,report,bank){
 if(!report) return [];
 const tested=report.topics||{};
 const rows=[];
 const qBank=suitableQuestions(bank,goal);
 const all=new Map();for(const q of qBank){if(!all.has(q.topic))all.set(q.topic,{topic:q.topic,subject:q.subject||q.area,questionId:q.id});}
 for(const [topic,s] of Object.entries(tested)){
   const known=all.get(topic);
   rows.push({topic,subject:known?.subject||topic,questionId:known?.questionId||null,
    priority:s.label==='Precisa de revisão'?'high':s.label==='Em desenvolvimento'?'medium':s.label==='Domínio demonstrado'?'maintenance':'coverage',
    reason:s.label,confidence:s.evidence,score:s.accuracy});
 }
 // Um diagnóstico curto não cobre o edital todo. Sempre manter cobertura não avaliada.
 const untested=[...all.values()].filter(x=>!tested[x.topic]);
 for(const r of untested.slice(0,28))rows.push({...r,priority:'coverage',reason:'Não avaliado no diagnóstico',confidence:'Sem evidências',score:null});
 for(const subject of goal.subjects||[]){
   if(!rows.some(x=>contain(x.subject,subject)||contain(x.topic,subject)))rows.push({topic:subject,subject,questionId:null,priority:'coverage',reason:'Matéria declarada, ainda sem avaliação adequada',confidence:'Sem evidências',score:null});
 }
 const rank={high:0,medium:1,coverage:2,maintenance:3};
 return rows.sort((a,b)=>rank[a.priority]-rank[b.priority]||a.topic.localeCompare(b.topic));
}
function dateString(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
export function latestInitial(goalId,assessments){return [...assessments].filter(a=>a.goalId===goalId&&a.kind==='initial'&&a.status==='completed'&&a.report).sort((a,b)=>(b.completedAt||0)-(a.completedAt||0))[0]||null;}
export function latestReport(goalId,assessments){return [...assessments].filter(a=>a.goalId===goalId&&hasEnoughEvidence(a)).sort((a,b)=>(b.completedAt||0)-(a.completedAt||0))[0]?.report||null;}
export function buildAdaptiveSchedule({goals,assessments,availability,bank,existing=[],start=new Date(),days=14,version=1}){
 const eligible=goals.filter(g=>g.status!=='paused'&&g.status!=='archived'&&isGoalEvaluated(g,assessments));
 const priorities=new Map();for(const g of eligible){const rec=topicRecommendations(g,latestReport(g.id,assessments),bank);priorities.set(g.id,rec);}
 const generated=[];
 for(let d=0;d<Math.min(Math.max(days,0),35);d++){
  const dt=new Date(start.getFullYear(),start.getMonth(),start.getDate(),12);dt.setDate(dt.getDate()+d);
  const day=dateString(dt),cap=validMinutes(availability[String(dt.getDay())]??0);
  const dayTasks=[...existing,...generated].filter(t=>t.day===day&&!['cancelled','superseded'].includes(t.status));
  const consumed=dayTasks.reduce((n,t)=>n+validMinutes(t.minutes),0);
  const free=Math.max(0,cap-consumed);
  const enriched=eligible.map(g=>{const r=latestReport(g.id,assessments);const entries=Object.values(r?.byTopic||{});const acc=entries.length?entries.reduce((n,x)=>n+(x.answered?x.correct/x.answered:0.5),0)/entries.length:.5;return {...g,exam_date:g.examDate||null,date_tbd:!g.examDate,diagnostic_status:'completed',weakness_weight:Math.min(1.9,1+1-acc)};});
  const chunks=allocateDaily(enriched,free,dt,d);
  const baseClock=Math.max(0,Math.min(1080,1440-cap));
  const oldEnd=dayTasks.reduce((n,t)=>Math.max(n,(t.startMinute??baseClock)+t.minutes),baseClock);
  let clock=oldEnd;
  for(const {goal_id,minutes} of chunks){
    if(clock+minutes>1440)continue;
    const goal=eligible.find(g=>g.id===goal_id),list=priorities.get(goal_id)||[];
    const previously=[...existing,...generated].filter(t=>t.goalId===goal_id&&!['superseded','cancelled'].includes(t.status)).map(t=>t.topic);
    const item=list.length?list.find(x=>!previously.includes(x.topic))||list[(d+generated.length)%list.length]:{topic:'Cobertura geral',subject:goal.subjects?.[0]||'Estudo',priority:'coverage',reason:'Conteúdo ainda sem avaliação',confidence:'Sem evidências'};
    const parts=minutes>=30?{theory:Math.floor(minutes*.35/5)*5,example:Math.floor(minutes*.20/5)*5,practice:Math.floor(minutes*.30/5)*5}:{theory:Math.floor(minutes*.5/5)*5,example:0,practice:0};
    parts.review=minutes-parts.theory-parts.example-parts.practice;
    generated.push({id:`task-${goal_id}-${day}-${version}-${generated.length}`,goalId:goal_id,day,minutes,startMinute:clock,subject:item.subject,topic:item.topic,priority:item.priority,reason:item.reason,confidence:item.confidence,objective:`Estudar ${item.topic}, praticar e revisar o que foi aprendido`,status:'pending',parts,questionId:item.questionId||null,version});
    clock+=minutes;
  }
 }
 return generated;
}
export function verifyPlan(tasks,availability){
 const totals={};const problems=[];
 for(const t of tasks.filter(t=>!['cancelled','superseded'].includes(t.status))){totals[t.day]=(totals[t.day]||0)+validMinutes(t.minutes);}
 for(const [day,total] of Object.entries(totals)){
   const weekday=new Date(day+'T12:00:00').getDay(),allowed=validMinutes(availability[String(weekday)]??0);
   if(total>allowed)problems.push({day,type:'sobrecarga',total,allowed});
   const rows=tasks.filter(x=>x.day===day&&!['cancelled','superseded'].includes(x.status));
   for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++){
     const x=rows[i],y=rows[j];if(x.startMinute<y.startMinute+y.minutes&&y.startMinute<x.startMinute+x.minutes)problems.push({day,type:'sobreposição',a:x.id,b:y.id});
   }
 }
 return {valid:problems.length===0,problems,totals};
}
