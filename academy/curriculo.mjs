import {CURRICULUM_VERSION,CURRICULUM_SOURCES,getStages,getGrades,getGradeSubjects,getTopics,getCoverage} from './curriculum-taxonomy.mjs';
const $=id=>document.getElementById(id);
const stages=getStages();
const state={stage:'fundamental1',grade:3,subject:'matematica'};
function element(tag,text,className){
 const node=document.createElement(tag);
 if(text!==undefined&&text!==null)node.textContent=String(text);
 if(className)node.className=className;
 return node;
}
function link(url,text){
 const a=element('a',text);
 a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;
}
function renderStages(){
 const select=$('curr-stage');select.replaceChildren();
 for(const stage of stages){
  const option=element('option',stage.label);option.value=stage.id;select.append(option);
 }
 select.value=state.stage;
}
function renderGrades(){
 const grades=getGrades(state.stage),container=$('curr-grade-list');container.replaceChildren();
 for(const grade of grades){
  const button=element('button',grade.label);button.type='button';button.setAttribute('aria-pressed',String(state.grade===grade.year));
  button.addEventListener('click',()=>{state.grade=grade.year;state.subject=getGradeSubjects(state.stage,state.grade)[0]?.subjectId||null;render();});
  container.append(button);
 }
}
function renderSubjects(){
 const list=$('curr-subject-list');list.replaceChildren();
 for(const subject of getGradeSubjects(state.stage,state.grade)){
  const button=element('button',subject.label);button.type='button';
  button.setAttribute('aria-pressed',String(state.subject===subject.subjectId));
  button.addEventListener('click',()=>{state.subject=subject.subjectId;render();});
  list.append(button);
 }
}
function renderContent(){
 const area=$('curr-content');area.replaceChildren();
 const subject=getGradeSubjects(state.stage,state.grade).find(x=>x.subjectId===state.subject);
 if(!subject){area.append(element('p','Selecione uma disciplina disponível.'));return;}
 const title=element('h2',subject.label);area.append(title);
 area.append(element('p',subject.area+' · Catálogo '+CURRICULUM_VERSION,'curr-small'));
 const notice=element('p','Sem aulas ou questões escolares aprovadas nesta disciplina. As referências documentais não autorizam diagnósticos ainda.','curr-status');
 area.append(notice);
 if(subject.optional)area.append(element('p','Ensino Religioso: matrícula facultativa no Ensino Fundamental.','curr-small'));
 if(state.stage==='medio')area.append(element('p','A distribuição das habilidades EM13 entre séries é decisão curricular local. Não é uma exigência de série da BNCC.','curr-small'));
 if(state.stage==='enem')area.append(element('p','A matriz de avaliação do ENEM não equivale a habilidades BNCC de uma série escolar.','curr-small'));
 const coverage=getCoverage(state.stage,state.grade,state.subject);
 area.append(element('p','Tópicos catalogados: '+coverage.topics+' · Habilidades referenciadas: '+coverage.skillsReferenced+' · Conteúdos aprovados: '+coverage.skillsWithApprovedContent,'curr-small'));
 for(const topic of getTopics(state.stage,state.grade,state.subject)){
  const article=element('article',null,'curr-topic');
  article.append(element('h3',topic.label));
  article.append(element('p','Unidade temática BNCC · página '+topic.sourcePage,'curr-small'));
  for(const subtopic of topic.subtopics){
   article.append(element('h4',subtopic.label));
   for(const skill of subtopic.skills){
    article.append(element('p',skill.code,'curr-ids'));
    article.append(element('p',skill.description));
    article.append(element('p','Código conferido na BNCC, página '+skill.sourcePage+' · material didático ainda não aprovado.','curr-small'));
   }
  }
  area.append(article);
 }
 if(!coverage.topics)area.append(element('p','Tópicos, subtópicos e habilidades aguardam catalogação e conferência editorial por lote.','curr-small'));
}
function renderSources(){
 const list=$('curr-sources');list.replaceChildren();
 const stage=stages.find(s=>s.id===state.stage);
 for(const id of stage?.sourceIds||[]){
  const item=CURRICULUM_SOURCES[id];if(!item)continue;
  const group=element('div');
  group.append(link(item.url,item.label));
  group.append(element('p',item.version,'curr-small'));list.append(group);
 }
}
function render(){renderGrades();renderSubjects();renderContent();renderSources();}
$('curr-stage').addEventListener('change',event=>{
 state.stage=event.target.value;state.grade=getGrades(state.stage)[0]?.year??null;
 state.subject=getGradeSubjects(state.stage,state.grade)[0]?.subjectId||null;render();
});
renderStages();render();
