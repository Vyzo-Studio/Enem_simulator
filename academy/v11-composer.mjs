/** VYZO ACADEMY V13 — composição estratificada verificável de diagnósticos. */
export const EXAM_AREAS=Object.freeze(['Linguagens','Humanas','Natureza','Matemática']);
export const VISUAL_TYPES=Object.freeze(['bar','grouped','line','table','poster','rectangle','triangle','chain','punnett','circuit']);
const normal=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
export function isSupportedVisual(v){
 if(!v)return true;
 if(!VISUAL_TYPES.includes(v.type))return false;
 if(v.type==='table')return Array.isArray(v.headers)&&v.headers.length>0&&Array.isArray(v.rows)&&v.rows.every(r=>Array.isArray(r)&&r.length===v.headers.length);
 if(['bar','line'].includes(v.type))return Array.isArray(v.labels)&&Array.isArray(v.values)&&v.labels.length===v.values.length&&v.values.every(Number.isFinite);
 if(v.type==='grouped')return Array.isArray(v.labels)&&Array.isArray(v.series)&&v.series.length===2&&v.series.every(s=>Array.isArray(s.values)&&s.values.length===v.labels.length&&s.values.every(Number.isFinite));
 if(v.type==='chain')return Array.isArray(v.labels)&&v.labels.length>=2&&v.labels.length<=4;
 if(v.type==='punnett')return v.top?.length===2&&v.side?.length===2;
 if(v.type==='circuit')return Boolean(v.voltage&&v.resistance);
 if(v.type==='rectangle')return Boolean(v.w&&v.h);
 if(v.type==='triangle')return Boolean(v.a&&v.c);
 if(v.type==='poster')return v.kind==='ewaste';
 return false;
}
export function quotaPlan(quantity,areas=EXAM_AREAS){
 if(!Number.isInteger(quantity)||quantity<1||!areas.length||new Set(areas).size!==areas.length)throw Error('Quantidade ou distribuição inválida.');
 const each=Math.floor(quantity/areas.length),remainder=quantity%areas.length;
 return Object.fromEntries(areas.map((a,i)=>[a,each+(i<remainder?1:0)]));
}
const hash=s=>{let n=2166136261;for(const c of String(s))n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;};
const fingerprint=q=>normal(q.stem).replace(/\d+(?:[.,]\d+)?/g,'#');
function validateQuestion(q){
 return q&&typeof q.id==='string'&&q.id&&EXAM_AREAS.includes(q.area)&&q.subject&&q.topic&&
 Array.isArray(q.options)&&q.options.length===5&&new Set(q.options).size===5&&
 Number.isInteger(q.answer)&&q.answer>=0&&q.answer<=4&&String(q.context||'').trim()&&
 String(q.stem||'').trim()&&String(q.explanation||'').trim()&&isSupportedVisual(q.visual);
}
export function computeExamBlueprint(questions,opts={}){
 const counts=(field)=>questions.reduce((o,q)=>(o[q[field]]=(o[q[field]]||0)+1,o),{});
 return {total:questions.length,areas:counts('area'),subjects:counts('subject'),topics:counts('topic'),
   levels:counts('difficulty'),visualCount:questions.filter(q=>q.visual).length,
   ids:questions.map(q=>q.id),language:opts.language||null,mode:opts.mode||'general'};
}
function choose(pool,count,seed,already=[]){
 const used=new Set(already.map(q=>q.id)),result=[],subjects={},topics={},stems={},levels={};
 for(let k=0;k<count;k++){
   let best=null,bestScore=Infinity;
   for(const q of pool){
     if(used.has(q.id))continue;
     const subj=subjects[q.subject]||0,topic=topics[q.topic]||0,stem=stems[fingerprint(q)]||0;
     const difficulty=levels[q.difficulty]||0;
     const jitter=hash(seed+'|'+q.id)/4294967295;
     const score=subj*7+topic*13+stem*10+difficulty*1.8+(q.visual?-0.6:0)+jitter;
     if(score<bestScore){best=q;bestScore=score;}
   }
   if(!best)throw Error('Não há questões suficientes para essa composição. Ajuste a quantidade.');
   result.push(best);used.add(best.id);subjects[best.subject]=(subjects[best.subject]||0)+1;
   topics[best.topic]=(topics[best.topic]||0)+1;stems[fingerprint(best)]=(stems[fingerprint(best)]||0)+1;
   levels[best.difficulty]=(levels[best.difficulty]||0)+1;
 }
 return result;
}
export function composeExam(bank,goal,quantity,opts={}){
 const count=Number(quantity);
 if(!Number.isInteger(count)||count<3||count>100)throw Error('Escolha de 3 a 100 questões.');
 const mode=opts.mode||'general',enem=goal?.type==='ENEM'||goal?.exam_type==='ENEM';
 const language=opts.language==='Espanhol'?'Espanhol':'Inglês',seed=String(opts.seed||'vyzo-2026');
 const exclude=new Set(opts.excludeIds||[]);
 const valid=[...new Map((Array.isArray(bank)?bank:[]).filter(q=>validateQuestion(q)&&!exclude.has(q.id)).map(q=>[q.id,q])).values()]
   .filter(q=>!enem||(!['Inglês','Espanhol'].includes(q.subject)||q.subject===language));
 let areas=null,filtered=valid;
 if(enem&&mode==='general')areas=EXAM_AREAS;
 else if(enem&&mode==='day1')areas=['Linguagens','Humanas'];
 else if(enem&&mode==='day2')areas=['Natureza','Matemática'];
 else if(mode==='area'){if(!EXAM_AREAS.includes(opts.area))throw Error('Escolha uma área válida.');areas=[opts.area];}
 else if(mode==='subject'){filtered=valid.filter(q=>normal(q.subject)===normal(opts.subject));}
 else if(mode==='topic'){filtered=valid.filter(q=>normal(q.topic)===normal(opts.topic));}
 else if(!['general','targeted','adaptive','day1','day2'].includes(mode))throw Error('Modo de prova inválido.');
 let selected=[];
 if(areas){
   const quotas=quotaPlan(count,areas);
   for(const area of areas){
     const eligible=filtered.filter(q=>q.area===area);
     if(eligible.length<quotas[area])
       throw Error('Não é possível montar um diagnóstico equilibrado: '+area+' possui '+eligible.length+' questões para '+quotas[area]+' vagas. Escolha uma quantidade menor ou ajuste as matérias.');
     let pool=eligible;
     // Incluir ao menos um item da língua escolhida quando o modo contemplar Linguagens.
     if(enem&&area==='Linguagens'&&quotas[area]>0){
       const languageItems=pool.filter(q=>q.subject===language);
       if(!languageItems.length)throw Error('A língua '+language+' não está disponível neste conjunto. Escolha outra configuração.');
       const lang=choose(languageItems,1,seed+'-lingua')[0];
       selected.push(lang);pool=pool.filter(q=>q.id!==lang.id);
       selected.push(...choose(pool,quotas[area]-1,seed+'-'+area,[lang]));
     }else selected.push(...choose(pool,quotas[area],seed+'-'+area));
   }
 }else{
   if(filtered.length<count)throw Error('Há somente '+filtered.length+' questões compatíveis; escolha uma quantidade menor.');
   selected=choose(filtered,count,seed);
 }
 // Embaralhar ordem sem alterar a composição, com semente estável.
 selected.sort((a,b)=>hash(seed+'-ordem-'+a.id)-hash(seed+'-ordem-'+b.id));
 const blueprint=computeExamBlueprint(selected,{mode,language:enem?language:null});
 if(selected.length!==count||new Set(blueprint.ids).size!==count)throw Error('O simulado não passou na validação de integridade.');
 if(areas)for(const [area,number] of Object.entries(quotaPlan(count,areas)))
   if(blueprint.areas[area]!==number)throw Error('A distribuição não corresponde ao planejamento da prova.');
 return {questions:selected,blueprint};
}
