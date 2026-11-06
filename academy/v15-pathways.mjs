/** V15 — Percursos escolares configuráveis sem alegar conteúdo BNCC validado. */
export const EDUCATION_STAGES=Object.freeze([
  {id:'fundamental1',label:'Ensino Fundamental I',years:[1,2,3,4,5],
   subjects:['Língua Portuguesa','Matemática','Ciências','História','Geografia','Arte','Educação Física']},
  {id:'fundamental2',label:'Ensino Fundamental II',years:[6,7,8,9],
   subjects:['Língua Portuguesa','Matemática','Ciências','História','Geografia','Inglês','Arte','Educação Física']},
  {id:'medio',label:'Ensino Médio',years:[1,2,3],
   subjects:['Língua Portuguesa','Literatura','Matemática','Física','Química','Biologia','História','Geografia','Filosofia','Sociologia','Inglês','Arte','Educação Física','Redação']}
]);
export const LEARNING_PATHS=Object.freeze([
 {id:'school',label:'Estudar para a escola',type:'Prova escolar'},
 {id:'grades',label:'Melhorar minhas notas',type:'Prova escolar'},
 {id:'enem',label:'Preparar para o ENEM',type:'ENEM'},
 {id:'vestibular',label:'Preparar para um vestibular',type:'Vestibular'},
 {id:'public',label:'Preparar para um concurso público',type:'Concurso público'},
 {id:'military',label:'Preparar para um concurso militar',type:'Concurso militar'},
 {id:'certification',label:'Estudar para uma certificação',type:'Certificação profissional'},
 {id:'other',label:'Outro objetivo',type:'Outra prova'}
]);
export const getLearningPath=id=>LEARNING_PATHS.find(x=>x.id===id)||null;
export const getSchoolStage=id=>EDUCATION_STAGES.find(x=>x.id===id)||null;
export const schoolYears=id=>getSchoolStage(id)?.years.slice()||[];
export const schoolSubjects=id=>getSchoolStage(id)?.subjects.slice()||[];
export const validSchoolYear=(stage,year)=>schoolYears(stage).includes(Number(year));
export const schoolGradeLabel=(stage,year)=>validSchoolYear(stage,year)?
  String(year)+'º ano do '+getSchoolStage(stage).label:'Ano escolar não informado';
export const schoolContentReady=()=>false; // Sem questões validadas por série, nunca reaproveitar provas do ENEM como equivalentes.
export const ENEM_OFFICIAL_ARCHIVE=Object.freeze({
 label:'Provas e gabaritos anteriores do ENEM — Inep',
 url:'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos',
 years:Array.from({length:28},(_,i)=>2025-i)
});
// Não transforma links do acervo oficial em provas interativas: a extração e a revisão editorial são separadas.
