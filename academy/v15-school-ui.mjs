/** V15.1: apresentação das microaulas escolares — dados escapados pelo app anfitrião. */
export function schoolPreviewHtml(goal,pilot,h){
 const grade=goal.educationStage==='medio'?'Ensino Médio':goal.educationStage==='fundamental1'?'Ensino Fundamental I':'Ensino Fundamental II';
 const intro='<div class="v9-card"><h2>'+h(goal.name)+'</h2><p class="v9-lead">'+
  h(grade+' · '+goal.schoolYear+'º ano')+' · '+h((goal.subjects||[]).join(', '))+'</p>'+
  '<p>Disponibilidade definida por tópico, não por série inteira. Questões ENEM não são utilizadas.</p>'+
  '<button type="button" class="btn secondary" data-action="edit-goal" data-id="'+h(goal.id)+'">Editar objetivo</button></div>';
 if(!pilot)return intro+'<div class="v9-card"><div class="v9-warn">Não há microaula revisável para as matérias e a série selecionadas. Nenhuma avaliação ou plano personalizado será inventado.</div></div>';
 return intro+'<section class="v9-card"><h2>Matemática · microaula-piloto</h2>'+
  '<p><strong>'+h(pilot.topic)+'</strong> · Referência curricular '+h(pilot.skillCode)+'</p>'+
  '<p>Explicações, exemplos resolvidos, '+pilot.questions.length+' questões autorais, correção e registro local de tentativas.</p>'+
  '<p class="v9-warn">Material autoral em revisão editorial. A referência curricular foi conferida, mas o conteúdo ainda não representa cobertura de toda a série.</p>'+
  '<button type="button" class="btn" data-action="school-open" data-id="'+h(goal.id)+'">Começar aula e atividade</button></section>';
}
export function schoolLessonHtml(goal,pilot,draft={},last=null,h){
 const score=last?.report,available=pilot.questions.length;
 const questionRows=pilot.questions.map((q,index)=>'<fieldset class="v15-pilot-question"><legend><b>Questão '+(index+1)+':</b> '+h(q.stem)+'</legend>'+
  q.options.map((option,i)=>'<label class="v15-pilot-answer"><input type="radio" name="school-choice:'+h(q.id)+'" value="'+i+'" '+
   (draft[q.id]===i?'checked':'')+'><span>'+String.fromCharCode(65+i)+') '+h(option)+'</span></label>').join('')+
  '</fieldset>').join('');
 const correction=score?'<section class="v9-card" aria-label="Correção da última atividade"><h2>Última atividade corrigida</h2>'+
  '<div class="v9-grid">'+[['Respondidas',score.answered],['Acertos',score.correct],['Erros',score.wrong],['Em branco',score.blank]].map(([label,value])=>
   '<div class="v9-stat"><small>'+h(label)+'</small><strong>'+value+'</strong></div>').join('')+'</div>'+
  '<p class="v9-mini">'+h(score.evidence)+'</p>'+
  score.rows.map((row,index)=>{
   const q=pilot.questions[index],selected=row.chosen;
   return '<details class="v9-detail"><summary>Questão '+(index+1)+' · '+
    h(row.status==='correct'?'Acerto':row.status==='wrong'?'Revisar este erro':'Não respondida')+'</summary>'+
    '<p><b>'+h(q.stem)+'</b></p><p><b>Sua resposta: </b>'+h(selected===null?'Em branco':q.options[selected])+'</p>'+
    '<p><b>Resposta correta: </b>'+h(q.options[q.answer])+'</p><p><b>Resolução: </b>'+h(q.explanation)+'</p></details>';
  }).join('')+
  '<p class="v9-mini">Um único conjunto curto não comprova domínio da série nem da habilidade completa. Todas as tentativas anteriores continuam no backup local.</p></section>':'';
 return '<section class="v9-card v15-school-pilot" data-pilot="'+h(pilot.id)+'">'+
  '<p class="v9-mini">'+h(pilot.skillCode)+' · Versão '+h(pilot.contentVersion)+' · '+h(pilot.availableScope)+'</p>'+
  '<div class="v9-warn">Microaula autoral em revisão pedagógica, sem homologação editorial completa. A relação com a habilidade curricular foi conferida em fonte pública.</div>'+
  (pilot.bnccGradeNote?'<p class="v9-mini">'+h(pilot.bnccGradeNote)+'</p>':'')+
  '<h2>Entenda o assunto</h2><p class="v9-lead">'+h(pilot.intro)+'</p>'+
  pilot.worked.map((example,i)=>'<section class="v15-school-example"><h3>Exemplo '+(i+1)+' · '+h(example.title)+'</h3>'+
   '<p>'+h(example.question)+'</p><ol>'+example.steps.map(step=>'<li>'+h(step)+'</li>').join('')+'</ol></section>').join('')+
  '<h2>Resumo de revisão</h2><ul>'+pilot.review.map(item=>'<li>'+h(item)+'</li>').join('')+'</ul>'+
  '<p class="v9-mini">Consulte a <a href="'+h(pilot.verificationSource)+'" target="_blank" rel="noopener noreferrer">referência curricular pública</a> desta habilidade.</p></section>'+
  '<section class="v9-card"><h2>Pratique o que aprendeu · '+available+' questões</h2>'+
  '<p>Você pode deixar questões em branco, sem que sejam consideradas erros. As escolhas ficam neste navegador e são preservadas se sair antes de concluir.</p>'+
  '<form id="v15-school-pilot-form" class="v9-form">'+questionRows+
  '<div class="v9-actions"><button class="btn" type="submit">Concluir e corrigir atividade</button>'+
  '<button type="button" class="btn secondary" data-page="goals">Continuar depois</button></div></form></section>'+
  correction;
}
