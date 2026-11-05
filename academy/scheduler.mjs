/** VYZO ACADEMY V8 — alocação determinística, sem ultrapassar a disponibilidade. */
export const WEEKDAYS = ['dom','seg','ter','qua','qui','sex','sab'];
export const toISODate = d => new Date(d).toISOString().slice(0,10);
export function validMinutes(value) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 && n <= 720 ? n : 0;
}
export function urgency(goal, reference = new Date()) {
  let u = 1;
  if (goal.exam_date && !goal.date_tbd) {
    const date = new Date(goal.exam_date+'T12:00:00');
    const days = Math.ceil((date - reference) / 86400000);
    if (days < 0) return 0.5;
    if (days <= 7) u = 2.6;
    else if (days <= 30) u = 2.1;
    else if (days <= 90) u = 1.5;
  }
  return u;
}
export function activeGoals(goals) {
  return goals.filter(g => ['active','preparing'].includes(g.status) && g.diagnostic_status === 'completed');
}
/** Distribui os minutos em blocos de 5, com garantia de teto diário.
 * Quando o orçamento for insuficiente, alguns objetivos receberão 0 em um dia,
 * e a rotação diária prioriza a alternância — não inventa tempo disponível.
 */
export function allocateDaily(goals, availableMinutes, referenceDate = new Date(), rotation = 0) {
  const available = Math.floor(validMinutes(availableMinutes) / 5) * 5;
  const eligible = activeGoals(goals);
  if (!available || !eligible.length) return [];
  const weight = g => {
    const priority = {high:3,medium:2,low:1}[g.priority] ?? 2;
    const weakness = Math.max(0.5, Math.min(2,Number(g.weakness_weight ?? 1)));
    return priority * urgency(g,referenceDate) * weakness;
  };
  const stable = [...eligible].sort((a,b)=>String(a.id).localeCompare(String(b.id)));
  const rotated = stable.map((_,i)=>stable[(i+(rotation%stable.length))%stable.length]);
  const allocations = rotated.map(g=>({goal_id:g.id,minutes:0,weight:weight(g)}));
  let chunks = available/5;
  if (chunks >= allocations.length * 2) {
    for (const entry of allocations) {entry.minutes=10;chunks-=2;}
  }
  const total = allocations.reduce((a,b)=>a+b.weight,0);
  const wanted=allocations.map(x=>total?chunks*x.weight/total:chunks/allocations.length);
  const base=wanted.map(x=>Math.floor(x));
  base.forEach((n,i)=>allocations[i].minutes+=n*5);
  let left=chunks-base.reduce((a,b)=>a+b,0);
  const order=wanted.map((x,i)=>({i,fraction:x-base[i]}))
    .sort((a,b)=>b.fraction-a.fraction||a.i-b.i);
  for (let i=0;i<left;i++) allocations[order[i].i].minutes+=5;
  return allocations.filter(x=>x.minutes>0).map(({goal_id,minutes})=>({goal_id,minutes}));
}
export function generateSchedule({goals,availability,diagnostics={},start=new Date(),days=7,startAt=1080,existing=[]}) {
  if(!Array.isArray(goals)||!availability||typeof availability!=='object')throw Error('Parâmetros de planejamento inválidos.');
  const completed = new Set(existing.filter(x=>x.status==='completed').map(x=>x.goal_id+'|'+x.day+'|'+x.subject+'|'+x.topic));
  const takenDays = new Set(existing.filter(x=>x.status!=='completed').map(x=>x.goal_id+'|'+x.day));
  const out=[];
  const anchor=new Date(start.getFullYear(),start.getMonth(),start.getDate(),12);
  for(let d=0;d<Math.max(0,Math.min(days,31));d++){
    const date=new Date(anchor);date.setDate(anchor.getDate()+d);
    const day=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    const budget=validMinutes(availability[String(date.getDay())]??0);
    // Não sobrescreve atividades existentes nem ocupa duas vezes o tempo já agendado.
    const already=existing.filter(x=>x.day===day&&x.status!=='cancelled').reduce((n,x)=>n+validMinutes(x.minutes),0);
    const free=Math.max(0,budget-already);
    const alloc=allocateDaily(goals,free,date,d);
    let clock=Math.max(0,Math.min(1440-budget,Number(startAt)||1080));
    const oldEnd=existing.filter(x=>x.day===day&&x.start_minute!=null).reduce((n,x)=>Math.max(n,x.start_minute+validMinutes(x.minutes)),clock);
    clock=Math.max(clock,oldEnd);
    for(const item of alloc){
      const goal=goals.find(g=>g.id===item.goal_id);
      if(takenDays.has(item.goal_id+'|'+day))continue;
      const subjects=Array.isArray(goal.subjects)&&goal.subjects.length?goal.subjects:['Revisão geral'];
      const diagnostic=diagnostics[goal.id]||{};
      const ordered=Object.entries(diagnostic.byTopic||{}).sort((a,b)=>{
        const ar=a[1],br=b[1];return ((ar.correct||0)/Math.max(1,ar.total||0))-((br.correct||0)/Math.max(1,br.total||0));
      });
      const topic=ordered.length?ordered[d%ordered.length][0]:subjects[d%subjects.length];
      const subject=subjects.find(s=>topic.toLowerCase().includes(s.toLowerCase()))||subjects[d%subjects.length];
      const key=item.goal_id+'|'+day+'|'+subject+'|'+topic;
      if(completed.has(key))continue;
      out.push({goal_id:item.goal_id,day,minutes:item.minutes,start_minute:clock,subject,topic,
        objective:`Revisar ${topic} e resolver questões comentadas`,priority:goal.priority||'medium',
        status:'pending',resource_type:'local',notes:'Plano sugerido após diagnóstico. Confirme os tópicos do edital.'});
      clock+=item.minutes;
    }
  }
  return out;
}
export function verifySchedule(tasks,availability){
  const dayTotals={};const conflicts=[];
  for(const item of tasks.filter(t=>t.status!=='cancelled')){
    dayTotals[item.day]=(dayTotals[item.day]||0)+validMinutes(item.minutes);
  }
  for(const [day,total] of Object.entries(dayTotals)){
    const weekday=new Date(day+'T12:00:00').getDay(),cap=validMinutes(availability[String(weekday)]??0);
    if(total>cap)conflicts.push({day,type:'overbooked',total,capacity:cap});
    const entries=tasks.filter(x=>x.day===day&&x.status!=='cancelled'&&Number.isInteger(x.start_minute));
    for(const entry of entries)if(entry.start_minute<0||entry.start_minute+validMinutes(entry.minutes)>1440)conflicts.push({day,type:'outside_day',goal_id:entry.goal_id});
    for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++){
      const a=entries[i],b=entries[j];
      if(a.start_minute<b.start_minute+b.minutes && b.start_minute<a.start_minute+a.minutes)
        conflicts.push({day,type:'overlap',a:a.goal_id,b:b.goal_id});
    }
  }
  return {valid:conflicts.length===0,conflicts,dayTotals};
}
