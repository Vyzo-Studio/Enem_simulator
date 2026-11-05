/* VYZO ACADEMY V13 — seletor único de matérias, sem dependências e compatível com formulários existentes. */
(function(){
'use strict';
const CATALOG=[
['Matemática','Matemática','mat matematica raciocinio quantitativo'],
['Matemática Básica','Matemática Básica','aritmetica numeros'],
['Matemática Financeira','Matemática Financeira','juros porcentagem'],
['Língua Portuguesa','Português','port portugues gramática linguagens'],
['Interpretação de Textos','Interpretação de Textos','interpretacao leitura textos'],
['Literatura','Literatura','livros linguagens'],
['Redação','Redação','texto dissertativo escrita'],
['Inglês','Inglês','ingles língua estrangeira'],
['Espanhol','Espanhol','espanhol língua estrangeira'],
['Artes','Artes','arte'],
['Educação Física','Educação Física','educacao fisica'],
['História','História','historia humanas'],
['Geografia','Geografia','geo humanas'],
['Filosofia','Filosofia','filosofia humanas'],
['Sociologia','Sociologia','sociologia humanas'],
['Biologia','Biologia','bio ciências natureza'],
['Física','Física','fis fisica ciências natureza'],
['Química','Química','qui quimica ciências natureza'],
['Linguagens','Linguagens','linguagens códigos'],
['Humanas','Humanas','ciências humanas historia geografia'],
['Natureza','Natureza','ciências da natureza física biologia química'],
['Probabilidade','Probabilidade','estatistica probabilidade'],
['Estatística','Estatística','estatistica médias'],
['Geometria','Geometria','geometria'],
['Raciocínio Lógico','Raciocínio Lógico','logica raciocinio'],
['Informática','Informática','computação computadores'],
['Tecnologia da Informação','Tecnologia da Informação','ti informatica'],
['Direito Constitucional','Direito Constitucional','const constitucional'],
['Direito Administrativo','Direito Administrativo','administrativo'],
['Direito Penal','Direito Penal','penal'],
['Processo Penal','Processo Penal','processual'],
['Direito Civil','Direito Civil','civil'],
['Legislação','Legislação','leis lei normas'],
['Administração Pública','Administração Pública','administração'],
['Administração Geral','Administração Geral','gestão'],
['Contabilidade Geral','Contabilidade Geral','contabil'],
['Contabilidade Pública','Contabilidade Pública','contas'],
['Economia','Economia','econômica'],
['Atualidades','Atualidades','conhecimentos gerais'],
['Conhecimentos Bancários','Conhecimentos Bancários','bancos banco'],
['Sistema Financeiro Nacional','Sistema Financeiro Nacional','financeiro sfn'],
['Atendimento ao Público','Atendimento ao Público','atendimento'],
['Vendas e Negociação','Vendas e Negociação','vendas'],
['Ética no Serviço Público','Ética no Serviço Público','etica'],
['Arquivologia','Arquivologia','arquivo'],
['Direitos Humanos','Direitos Humanos','humanos'],
['Segurança da Informação','Segurança da Informação','cibersegurança'],
['Noções de Administração','Noções de Administração','admin'],
['Pedagogia','Pedagogia','educação'],
['Conhecimentos Específicos','Conhecimentos Específicos','especificos']
];
const ENEM=['Linguagens','Humanas','Natureza','Matemática'];
const normalize=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const key=v=>normalize(v).replace(/[\s\p{P}]+/gu,'');
const DATA=CATALOG.map(([label,value,aliases])=>({label,value,search:normalize(label+' '+value+' '+aliases)}));
const safe=v=>String(v||'').replace(/[<>"'&]/g,'').trim().slice(0,90);
const escapeHTML=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function findByText(v){return DATA.find(o=>key(o.value)===key(v)||key(o.label)===key(v));}
function dedupe(list){
 const selected=[],seen=new Set();
 for(const s of list){const canonical=findByText(s)?.value||safe(s);if(!canonical||seen.has(key(canonical)))continue;seen.add(key(canonical));selected.push(canonical);}
 return selected;
}
function examType(original){
 const form=original.closest('form'),scope=original.closest('.card')||original.closest('section')||form;
 const fromSelect=form?.querySelector('select[name="exam_type"]');
 const cardTitle=scope?.querySelector('h3')?.textContent||'';
 const fromInput=scope?.querySelector('input[name^="name_"]')?.value||form?.querySelector('input[name="exam_name"]')?.value||'';
 const text=[fromSelect?.value||'',cardTitle,fromInput].join(' ');
 return /\benem\b/i.test(normalize(text))?'ENEM':null;
}
function records(original){
 const official=String(original.dataset.officialSubjects||'').split(',').map(s=>s.trim()).filter(Boolean);
 const explicit=String(original.dataset.recommendedSubjects||'').split(',').map(s=>s.trim()).filter(Boolean);
 if(official.length)return {list:dedupe(official),label:'Matérias identificadas na fonte informada — confira o edital',kind:'official'};
 if(explicit.length)return {list:dedupe(explicit),label:'Matérias sugeridas pela configuração da prova',kind:'suggested'};
 if(examType(original)==='ENEM')return {list:ENEM,label:'Áreas de referência do ENEM — não substitui a matriz oficial',kind:'suggested'};
 return {list:[],label:'Informe a prova ou escolha matérias na pesquisa. Dados de edital só são oficiais após verificação.',kind:'none'};
}
function enhance(original){
 if(original.dataset.v13Ready==='yes')return;
 const single=original.tagName==='SELECT';
 if(!(single||original.matches('input[name="subjects"],input[name^="subjects_"]')))return;
 original.dataset.v13Ready='yes';
 const form=original.closest('form');
 if(!form&&!single)return;
 const existing=single?(original.value==='Todas'?[]:[original.value]):String(original.value||'').split(',');
 let selected=dedupe(existing),open=false,active=0,shown=[];
 if(single&&selected.length>1)selected=selected.slice(0,1);
 const oldId=original.id||'v13-'+Math.random().toString(36).slice(2);
 const uid='v13-'+Math.random().toString(36).slice(2);
 const label=document.querySelector('label[for="'+CSS.escape(oldId)+'"]');
 if(label){label.htmlFor=uid+'-search';label.textContent=single?'Qual matéria deseja estudar?':'Quais matérias você deseja estudar?';}
 const wrap=document.createElement('div');wrap.className='v13-subjects';wrap.dataset.source=original.name||original.id;
 const chips=document.createElement('div');chips.className='v13-chips';chips.setAttribute('aria-label','Matérias selecionadas');
 const row=document.createElement('div');row.className='v13-entry';
 const input=document.createElement('input');input.type='search';input.id=uid+'-search';input.className='v13-search';
 input.placeholder='Digite para pesquisar uma matéria...';input.autocomplete='off';input.maxLength=80;
 input.setAttribute('role','combobox');input.setAttribute('aria-autocomplete','list');input.setAttribute('aria-expanded','false');input.setAttribute('aria-controls',uid+'-results');
 input.setAttribute('aria-label',single?'Pesquisar matéria':'Pesquisar e adicionar matérias');
 const list=document.createElement('div');list.className='v13-list';list.id=uid+'-results';list.setAttribute('role','listbox');list.setAttribute('aria-label','Sugestões de matérias');list.hidden=true;
 const info=document.createElement('p');info.className='v13-help';info.setAttribute('aria-live','polite');
 const tools=document.createElement('div');tools.className='v13-tools';
 const selectRecommended=document.createElement('button');selectRecommended.type='button';selectRecommended.className='v13-action';selectRecommended.textContent='Selecionar matérias recomendadas';
 const personalize=document.createElement('button');personalize.type='button';personalize.className='v13-action';personalize.textContent='Personalizar seleção';
 const clear=document.createElement('button');clear.type='button';clear.className='v13-action';clear.textContent='Limpar seleção';
 const confirm=document.createElement('button');confirm.type='button';confirm.className='v13-action v13-confirm';confirm.textContent='Confirmar matérias';
 tools.append(selectRecommended,personalize,clear,confirm);
 original.before(wrap);wrap.append(chips,row,list,tools,info,original);row.append(input);
 original.classList.add('v13-native');original.setAttribute('aria-hidden','true');original.tabIndex=-1;
 const source=records(original);
 function sync(){
   if(single){
     const choice=selected[0];
     if(choice){
       const opt=[...original.options].find(o=>key(o.value)===key(choice)||key(o.textContent)===key(choice));
       if(opt)original.value=opt.value;
       else{const next=document.createElement('option');next.value=choice;next.textContent=choice;original.append(next);original.value=choice;}
     }else original.value='Todas';
   }else original.value=selected.join(', ');
   original.dispatchEvent(new Event('change',{bubbles:true}));
   drawChips();
 }
 function drawChips(){
   chips.replaceChildren();
   for(const name of selected){
     const tag=document.createElement('span');tag.className='v13-chip';tag.textContent=(DATA.find(o=>o.value===name)?.label||name)+' ';
     const remove=document.createElement('button');remove.type='button';remove.className='v13-remove';remove.textContent='×';remove.setAttribute('aria-label','Remover '+name);
     remove.addEventListener('click',()=>{selected=selected.filter(s=>key(s)!==key(name));sync();input.focus();});
     tag.append(remove);chips.append(tag);
   }
   const chosen=selected.length;
   info.textContent=chosen?chosen+' matéria(s) selecionada(s). '+source.label:source.label;
   clear.disabled=!chosen;
   selectRecommended.hidden=!source.list.length;
 }
 function close(){open=false;list.hidden=true;input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');}
 function renderSuggestions(){
   const q=normalize(input.value);shown=[];
   if(single&&selected.length&&input.value===''){close();return;}
   for(const subject of DATA){
     if(q&&!subject.search.includes(q))continue;
     if(selected.some(s=>key(s)===key(subject.value)))continue;
     shown.push(subject);if(shown.length>=8)break;
   }
   if(q.length>=2&&!shown.some(s=>key(s.value)===key(q))&&!selected.some(s=>key(s)===key(q)))
     shown.push({label:'Adicionar matéria personalizada: '+safe(input.value),value:safe(input.value),custom:true});
   if(!shown.length){close();return;}
   active=Math.min(Math.max(0,active),shown.length-1);
   list.replaceChildren();
   shown.forEach((s,i)=>{
     const option=document.createElement('button');option.type='button';option.className='v13-option'+(active===i?' is-active':'');option.id=uid+'-option-'+i;option.setAttribute('role','option');option.setAttribute('aria-selected',String(active===i));option.textContent=s.label;
     option.addEventListener('mousedown',ev=>ev.preventDefault());
     option.addEventListener('click',()=>add(s.value));list.append(option);
   });
   open=true;list.hidden=false;input.setAttribute('aria-expanded','true');input.setAttribute('aria-activedescendant',uid+'-option-'+active);
 }
 function add(name){
   if(!name)return;
   if(single)selected=[name];
   else if(selected.length<24&&!selected.some(s=>key(s)===key(name)))selected.push(name);
   else if(selected.length>=24)info.textContent='Limite de 24 matérias por prova.';
   sync();input.value='';close();input.focus();
 }
 input.addEventListener('input',()=>{active=0;renderSuggestions();});
 input.addEventListener('focus',renderSuggestions);
 input.addEventListener('keydown',ev=>{
   if(ev.key==='Escape'){ev.preventDefault();close();return;}
   if(ev.key==='Backspace'&&!input.value&&selected.length){ev.preventDefault();selected.pop();sync();return;}
   if(ev.key==='ArrowDown'||ev.key==='ArrowUp'){
     ev.preventDefault();if(!open)renderSuggestions();
     if(shown.length){active=(active+(ev.key==='ArrowDown'?1:-1)+shown.length)%shown.length;renderSuggestions();}
   }
   if(ev.key==='Enter'){
     if(open&&shown[active]){ev.preventDefault();add(shown[active].value);}
     else if(input.value.trim()){ev.preventDefault();add(input.value.trim());}
   }
 });
 document.addEventListener('pointerdown',e=>{if(!wrap.isConnected)return;if(!wrap.contains(e.target))close();});
 selectRecommended.addEventListener('click',()=>{selected=dedupe(single?source.list.slice(0,1):[...selected,...source.list]);sync();close();});
 personalize.addEventListener('click',()=>{input.focus();renderSuggestions();});
 clear.addEventListener('click',()=>{selected=[];sync();close();input.focus();});
 confirm.addEventListener('click',()=>{close();info.textContent='Matérias selecionadas. Salve o formulário para confirmar as alterações.';});
 drawChips();
}
let queued=false;
function scan(){queued=false;document.querySelectorAll('input[name="subjects"],input[name^="subjects_"],select#cfg-subject,select#v13-subject').forEach(enhance);}
function schedule(){if(queued)return;queued=true;queueMicrotask(scan);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{
 scan();new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
});else{scan();new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});}
window.VYZO_SUBJECTS={normalize,enhance,scan};
})();
