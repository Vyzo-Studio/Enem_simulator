/** Instrumentos descritivos. Não calcula TRI nem "domínio" sem evidências suficientes. */
export function evaluateDiagnostic(ids, answers, bank){
 const lookup=new Map(bank.map(q=>[q.id,q]));
 if(!Array.isArray(ids)||!ids.length||new Set(ids).size!==ids.length)throw Error('Lista de questões inválida');
 const counts={total:ids.length,answered:0,correct:0,wrong:0,blank:0};
 const bySubject={},byTopic={};
 const rows=ids.map(id=>{
   const q=lookup.get(id);if(!q)throw Error('Questão indisponível: '+id);
   const response=answers?.[id], valid=Number.isInteger(response)&&response>=0&&response<=4;
   const status=valid?(q.answer===response?'correct':'wrong'):'blank';
   if(status==='blank')counts.blank++;
   else {counts.answered++;if(status==='correct')counts.correct++;else counts.wrong++;}
   for(const [collection,key] of [[bySubject,q.subject||q.area],[byTopic,q.topic||'Geral']]){
     const b=collection[key]??={total:0,answered:0,correct:0,wrong:0,blank:0};
     b.total++;b[status]++;if(status!=='blank')b.answered++;
   }
   return {id,subject:q.subject,topic:q.topic,chosen:valid?response:null,status};
 });
 const confidence=n=>n<3?'dados insuficientes':n<5?'baixa':'moderada';
 const needs={};
 for(const [topic,stats] of Object.entries(byTopic)){
   const acc=stats.answered?stats.correct/stats.answered:0;
   needs[topic]={priority:stats.answered<3?'Dados insuficientes':acc<0.5?'Alta':acc<0.8?'Média':'Manutenção',confidence:confidence(stats.answered)};
 }
 return {...counts,accuracy:counts.answered?Math.round(counts.correct/counts.answered*100):0,coverage:Math.round(counts.answered/counts.total*100),bySubject,byTopic,needs,rows};
}
export function selectDiagnosticQuestions(bank,goal,count,usedIds=[]){
 if(!Array.isArray(bank))return [];
 const wanted=Math.max(1,Math.min(50,Number(count)||10));
 const used=new Set(usedIds);
 let pool=bank.filter(q=>q.id&&!used.has(q.id)&&q.options?.length===5&&Number.isInteger(q.answer));
 const isEnem=(goal.exam_type||'').toLowerCase()==='enem';
 if(!isEnem&&!goal.allow_provisional) return [];
 if(Array.isArray(goal.subjects)&&goal.subjects.length){
   const filters=goal.subjects.map(x=>String(x).toLowerCase());
   const matching=pool.filter(q=>filters.some(s=>String(q.subject).toLowerCase().includes(s)||String(q.area).toLowerCase().includes(s)));
   if(matching.length>=wanted)pool=matching;
 }
 // Determinístico por goal (rodízio por assunto), sem depender de sorteio repetitivo.
 const topics=new Map();for(const q of pool){const list=topics.get(q.topic)||[];list.push(q);topics.set(q.topic,list);}
 const groups=[...topics.values()].sort((a,b)=>a.length-b.length);const selected=[];
 while(selected.length<wanted&&groups.some(x=>x.length))for(const group of groups)if(group.length&&selected.length<wanted)selected.push(group.shift());
 return selected;
}
