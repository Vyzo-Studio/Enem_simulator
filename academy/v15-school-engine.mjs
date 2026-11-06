/** V15.1 — motor isolado de microatividades escolares. Sem efeitos colaterais. */
export const pilotExpected=(rule)=>{
 if(!rule||typeof rule!=='object')throw Error('Regra de questão ausente.');
 for(const value of Object.values(rule))if(typeof value==='number'&&!Number.isSafeInteger(value))throw Error('Valor não inteiro ou inseguro.');
 switch(rule.kind){
  case 'add':return rule.a+rule.b;
  case 'subtract':return rule.a-rule.b;
  case 'missingAdd':return rule.total-rule.a;
  case 'affine':return rule.a*rule.x+rule.b;
  case 'compare':{
   if(rule.b<=0||rule.d<=0)throw Error('Denominadores positivos obrigatórios.');
   const delta=rule.a*rule.d-rule.c*rule.b;
   return delta>0?'>':delta<0?'<':'=';
  }
  default:throw Error('Tipo de cálculo não permitido.');
 }
};
const normalizeChoice=(value,kind)=>kind==='compare'?String(value).trim():
 Number(String(value).replace(/[^0-9.-]/g,''));
export const checkPilotCatalog=(pilots)=>{
 const ids=new Set(),skills=new Set();
 if(!Array.isArray(pilots)||!pilots.length)throw Error('Banco escolar vazio.');
 let total=0;
 for(const p of pilots){
  if(ids.has(p.id))throw Error('ID repetido: '+p.id);ids.add(p.id);
  const source=new URL(p.verificationSource);
  if(source.protocol!=='https:'||!(source.hostname==='gov.br'||source.hostname.endsWith('.gov.br')))throw Error('Fonte curricular não governamental: '+p.id);
  if(!/^(EF\d{2}MA\d{2}|EM13MAT\d{3})$/.test(p.skillCode))throw Error('Código curricular inesperado: '+p.id);
  if(p.editorialStatus!=='em_revisao'||p.isOfficialExam!==false)throw Error('Escopo editorial inconsistente: '+p.id);
  if(!p.intro||!Array.isArray(p.worked)||p.worked.length<2||!Array.isArray(p.review)||p.review.length<3)throw Error('Aula incompleta: '+p.id);
  if(!Array.isArray(p.questions)||p.questions.length<6)throw Error('Cobertura do piloto insuficiente: '+p.id);
  skills.add(p.skillCode);
  for(const q of p.questions){
   if(ids.has(q.id))throw Error('Questão com ID duplicado: '+q.id);ids.add(q.id);
   if(!q.stem||!q.explanation||!Array.isArray(q.options)||q.options.length<3)throw Error('Questão incompleta: '+q.id);
   if(!Number.isInteger(q.answer)||q.answer<0||q.answer>=q.options.length)throw Error('Gabarito fora de intervalo: '+q.id);
   const choices=q.options.map(o=>normalizeChoice(o,q.rule.kind));
   if(choices.some(v=>typeof v==='number'&&!Number.isSafeInteger(v)))throw Error('Opção numérica inválida: '+q.id);
   if(new Set(choices).size!==choices.length)throw Error('Alternativas duplicadas: '+q.id);
   const expected=pilotExpected(q.rule);
   if(choices[q.answer]!==expected||choices.filter(c=>c===expected).length!==1)throw Error('Gabarito matematicamente incorreto: '+q.id);
   total++;
  }
 }
 return {pilots:pilots.length,questions:total,skills:[...skills]};
};
export const gradeSchoolPilot=(pilot,answers={})=>{
 if(!pilot||!Array.isArray(pilot.questions))throw Error('Microatividade indisponível.');
 const rows=pilot.questions.map(q=>{
  const provided=answers[q.id],choice=Number.isInteger(provided)?provided:null;
  const valid=choice!==null&&choice>=0&&choice<q.options.length;
  return {id:q.id,chosen:valid?choice:null,correctAnswer:q.answer,
    status:!valid?'blank':choice===q.answer?'correct':'wrong'};
 });
 const correct=rows.filter(x=>x.status==='correct').length,
  wrong=rows.filter(x=>x.status==='wrong').length,
  blank=rows.filter(x=>x.status==='blank').length,
  answered=correct+wrong;
 return {pilotId:pilot.id,contentVersion:pilot.contentVersion,total:rows.length,answered,correct,wrong,blank,
  accuracy:answered?Math.round(100*correct/answered):null,
  coverage:Math.round(100*answered/rows.length),
  evidence:answered<4?'Evidência inicial insuficiente':'Amostra curta — não comprova domínio',
  rows};
};
export const selectSchoolNextStep=(pilot,report)=>{
 if(!pilot||!report)return 'Faça uma atividade curta para observar seu ponto de partida.';
 if(report.answered<4)return 'Responda pelo menos quatro questões para obter um primeiro retrato deste tópico.';
 if(report.wrong>0)return 'Revise os exemplos e volte às questões em que teve dificuldade; uma tentativa não revela a causa exata do erro.';
 return 'Experimente outro tipo de exercício e retome o tópico em outro dia para consolidar o aprendizado.';
};
