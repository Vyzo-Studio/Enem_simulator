'use strict';
// Demonstração pública. Não envia, persiste ou sincroniza respostas.
const $=selector=>document.querySelector(selector);
const bank=Array.isArray(window.QUESTION_BANK)?window.QUESTION_BANK:[];
const areas=['Linguagens','Humanas','Natureza','Matemática'];
const sample=[];
for(let round=0;round<3&&sample.length<10;round++){
  for(const area of areas){
    const q=bank.filter(item=>item.area===area&&!item.visual&&item.options?.length===5)[round];
    if(q&&sample.length<10)sample.push(q);
  }
}
const answers=new Map();
let position=0,finished=false;
function element(tag,text,cls){const el=document.createElement(tag);if(text!==undefined)el.textContent=String(text);if(cls)el.className=cls;return el;}
function action(text,fn,secondary=false){const b=element('button',text,'btn'+(secondary?' secondary':''));b.type='button';b.addEventListener('click',fn);return b;}
function render(){
  const root=$('#demo-root');root.replaceChildren();
  if(sample.length!==10){root.append(element('p','Não foi possível carregar o banco de questões. Atualize a página e tente novamente.','callout error'));return;}
  if(finished){renderResult(root);return;}
  const q=sample[position];
  const meta=element('div',undefined,'demo-meta');meta.append(element('strong',`Questão ${position+1} de ${sample.length}`),element('span',`${answers.size} respondidas`,'pill'));
  root.append(meta);
  const progress=element('div',undefined,'demo-progress');const fill=element('span');fill.style.width=`${Math.round(answers.size/sample.length*100)}%`;progress.append(fill);root.append(progress);
  const card=element('section',undefined,'card');
  card.append(element('p',`${q.area} · ${q.subject} · ${q.topic}`,'small muted'),element('div',q.context,'quest-context'),element('h2',q.stem,'question'));
  const group=element('div',undefined,'alternatives');group.setAttribute('role','radiogroup');group.setAttribute('aria-label',`Respostas da questão ${position+1}`);
  q.options.forEach((text,i)=>{
    const label=element('label',undefined,'demo-answer');const radio=element('input');radio.type='radio';radio.name='demo-option';radio.value=String(i);radio.checked=answers.get(q.id)===i;
    radio.addEventListener('change',()=>{answers.set(q.id,i);render();});
    label.append(radio,element('span',`${'ABCDE'[i]}) ${text}`));group.append(label);
  });
  card.append(group);root.append(card);
  const nav=element('div',undefined,'demo-actions');const back=action('← Anterior',()=>{position--;render();},true);back.disabled=position===0;
  const forward=action('Próxima →',()=>{position++;render();},true);forward.disabled=position===sample.length-1;
  nav.append(back,forward,action('Finalizar e corrigir',()=>{
    const blanks=sample.length-answers.size;
    if(blanks&&!window.confirm(`Há ${blanks} questão(ões) em branco. Finalizar mesmo assim?`))return;
    finished=true;render();window.scrollTo(0,0);
  }));root.append(nav);
}
function renderResult(root){
  let correct=0,wrong=0;for(const q of sample){const a=answers.get(q.id);if(a===undefined)continue;if(a===q.answer)correct++;else wrong++;}
  root.append(element('h2','Correção do questionário demonstrativo'));
  root.append(element('p',`${correct} acertos · ${wrong} erros · ${sample.length-answers.size} em branco. Esta prévia não gera nota oficial nem salva histórico.`,'callout'));
  root.append(action('Refazer demonstração',()=>{answers.clear();position=0;finished=false;render();}));
  sample.forEach((q,index)=>{
    const chosen=answers.get(q.id),section=element('section',undefined,'demo-correction');
    const status=chosen===undefined?'Em branco':chosen===q.answer?'Correta':'Incorreta';
    const klass=chosen===undefined?'blank':chosen===q.answer?'correct':'wrong';
    section.append(element('h3',`Questão ${index+1}: ${q.topic}`),element('p',q.stem),element('strong',status,klass));
    section.append(element('p',`Sua resposta: ${chosen===undefined?'—':`${'ABCDE'[chosen]}) ${q.options[chosen]}`}`));
    section.append(element('p',`Resposta correta: ${'ABCDE'[q.answer]}) ${q.options[q.answer]}`));
    section.append(element('p',q.explanation||'Reveja os conceitos deste assunto.'));
    root.append(section);
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
