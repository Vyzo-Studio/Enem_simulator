/** VYZO ACADEMY — Catálogo curricular de referência (não é um banco de aulas).
 * BNCC: Ensino Fundamental, habilidades por ano ou bloco; Ensino Médio, EM13 não fixa série.
 * Fonte da matriz ENEM: Inep; não equiparar suas habilidades à BNCC escolar.
 * Disponibilidade de conteúdo é separada da validação documental.
 */
export const CURRICULUM_VERSION='2026.11-A1';
export const CURRICULUM_SOURCES=Object.freeze({
 bncc_ef:Object.freeze({id:'bncc_ef',publisher:'Ministério da Educação',version:'BNCC Educação Infantil e Ensino Fundamental, 2017/2018',label:'BNCC — Ensino Fundamental',url:'https://basenacionalcomum.mec.gov.br/images/BNCC_EI_EF_110518_versaofinal_site.pdf',referenceType:'documento_normativo'}),
 bncc_em:Object.freeze({id:'bncc_em',publisher:'Ministério da Educação',version:'BNCC Ensino Médio, 2018',label:'Portal da BNCC — Ensino Médio',url:'https://basenacionalcomum.mec.gov.br/',referenceType:'portal_oficial'}),
 ldb_2024:Object.freeze({id:'ldb_2024',publisher:'Congresso Nacional',version:'Lei 9.394/1996, artigo 35-D com redação da Lei 14.945/2024',label:'LDB — áreas do Ensino Médio',url:'https://legis.senado.gov.br/norma/551270/publicacao/34619663',referenceType:'legislacao'}),
 enem_2026:Object.freeze({id:'enem_2026',publisher:'Inep',version:'Matrizes de Referência do ENEM — publicação 2026',label:'Matrizes de Referência do ENEM',url:'https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/matrizes-de-referencia-enem',referenceType:'matriz_exame'})
});
const FREEZE=val=>{if(val&&typeof val==='object'&&!Object.isFrozen(val)){Object.values(val).forEach(FREEZE);Object.freeze(val);}return val;};
const define=(id,label,area,sourceId,optional=false)=>({id,label,area,sourceId,optional});
const EF=[
 define('portugues','Língua Portuguesa','Linguagens','bncc_ef'),
 define('arte','Arte','Linguagens','bncc_ef'),
 define('educacao_fisica','Educação Física','Linguagens','bncc_ef'),
 define('matematica','Matemática','Matemática','bncc_ef'),
 define('ciencias','Ciências','Ciências da Natureza','bncc_ef'),
 define('geografia','Geografia','Ciências Humanas','bncc_ef'),
 define('historia','História','Ciências Humanas','bncc_ef'),
 define('ensino_religioso','Ensino Religioso','Ensino Religioso','bncc_ef',true)
];
const INGLES=define('lingua_inglesa','Língua Inglesa','Linguagens','bncc_ef');
const EM=[
 define('portugues','Língua Portuguesa','Linguagens e suas Tecnologias','ldb_2024'),
 define('ingles','Língua Inglesa','Linguagens e suas Tecnologias','ldb_2024'),
 define('arte','Arte','Linguagens e suas Tecnologias','ldb_2024'),
 define('educacao_fisica','Educação Física','Linguagens e suas Tecnologias','ldb_2024'),
 define('matematica','Matemática','Matemática e suas Tecnologias','ldb_2024'),
 define('biologia','Biologia','Ciências da Natureza e suas Tecnologias','ldb_2024'),
 define('fisica','Física','Ciências da Natureza e suas Tecnologias','ldb_2024'),
 define('quimica','Química','Ciências da Natureza e suas Tecnologias','ldb_2024'),
 define('geografia','Geografia','Ciências Humanas e Sociais Aplicadas','ldb_2024'),
 define('historia','História','Ciências Humanas e Sociais Aplicadas','ldb_2024'),
 define('filosofia','Filosofia','Ciências Humanas e Sociais Aplicadas','ldb_2024'),
 define('sociologia','Sociologia','Ciências Humanas e Sociais Aplicadas','ldb_2024')
];
// Literatura integra Língua Portuguesa e redação é atividade transversal; não são disciplinas BNCC independentes.
const ENEM=[
 define('linguagens','Linguagens, Códigos e suas Tecnologias','Linguagens','enem_2026'),
 define('humanas','Ciências Humanas e suas Tecnologias','Ciências Humanas','enem_2026'),
 define('natureza','Ciências da Natureza e suas Tecnologias','Ciências da Natureza','enem_2026'),
 define('matematica','Matemática e suas Tecnologias','Matemática','enem_2026'),
 define('redacao','Redação','Produção textual','enem_2026')
];
const STAGES=[
 {id:'fundamental1',label:'Ensino Fundamental I',grades:[1,2,3,4,5],sourceIds:['bncc_ef'],gradeScope:'ano_escolar'},
 {id:'fundamental2',label:'Ensino Fundamental II',grades:[6,7,8,9],sourceIds:['bncc_ef'],gradeScope:'ano_escolar'},
 {id:'medio',label:'Ensino Médio',grades:[1,2,3],sourceIds:['bncc_em','ldb_2024'],gradeScope:'organizacao_pedagogica'},
 {id:'enem',label:'ENEM',grades:[null],sourceIds:['enem_2026'],gradeScope:'matriz_de_avaliacao'}
];
const seedTopics=[
 {stageId:'fundamental1',grade:3,subjectId:'matematica',id:'ef03-mat-numeros',
  label:'Números',sourceId:'bncc_ef',sourcePage:284,kind:'unidade_tematica',
  subtopics:[{id:'ef03-mat-numeros-adicao-subtracao',
    label:'Problemas de adição e subtração: juntar, acrescentar, separar, retirar, comparar e completar',
    sourceId:'bncc_ef',sourcePage:284,
    skills:[{id:'EF03MA06',code:'EF03MA06',
      description:'Resolver e elaborar problemas de adição e subtração com diferentes significados e estratégias, inclusive cálculo mental.',
      sourceId:'bncc_ef',sourcePage:285,referenceVerified:true,
      editorialStatus:'sem_material_aprovado',materials:[],questionIds:[]}]}]}
];
export const CURRICULUM_TREE=FREEZE(STAGES.map(stage=>({
 ...stage,
 grades:stage.grades.map(year=>{
  const gradeId=stage.id==='enem'?'enem':''
   +(stage.id==='medio'?'em-':'ef-')
   +String(year).padStart(2,'0');
  const components=stage.id==='fundamental1'?EF:stage.id==='fundamental2'?[...EF,INGLES]:stage.id==='medio'?EM:ENEM;
  const subjects=components.map(subject=>({
   ...subject,id:stage.id+'-'+(year===null?'geral':String(year).padStart(2,'0'))+'-'+subject.id,
   subjectId:subject.id,gradeId,stageId:stage.id,grade:year,
   curriculumStatus:'referencia_geral_conferida',
   editorialStatus:'sem_material_aprovado',
   topics:seedTopics.filter(t=>t.stageId===stage.id&&t.grade===year&&t.subjectId===subject.id).map(t=>({
    ...t,subtopics:t.subtopics.map(sub=>({...sub,skills:sub.skills.map(skill=>({...skill}))}))
   }))
  }));
  return {id:gradeId,label:year===null?'Matriz geral do ENEM':String(year)+'º ano',year,
   stageId:stage.id,subjects,
   gradeMapping:stage.gradeScope,
   hasApprovedMaterials:false};
 })
})));
export function getStages(){return CURRICULUM_TREE.map(({id,label,sourceIds,gradeScope})=>({id,label,sourceIds,gradeScope}));}
export function getGrades(stageId){return CURRICULUM_TREE.find(s=>s.id===stageId)?.grades||[];}
export function getGrade(stageId,grade){return getGrades(stageId).find(x=>x.year===(grade===null?null:Number(grade)))||null;}
export function getGradeSubjects(stageId,grade){
 return getGrade(stageId,grade)?.subjects||[];
}
export function getSubjects(stageId,grade){return getGradeSubjects(stageId,grade);}
export function getTopics(stageId,grade,subjectId){
 const subjects=getGradeSubjects(stageId,grade);
 return subjects.find(s=>s.subjectId===subjectId||s.id===subjectId)?.topics||[];
}
export function getSubtopics(stageId,grade,subjectId,topicId){
 return getTopics(stageId,grade,subjectId).find(t=>t.id===topicId)?.subtopics||[];
}
export function getSkills(stageId,grade,subjectId,topicId,subtopicId){
 return getSubtopics(stageId,grade,subjectId,topicId).find(t=>t.id===subtopicId)?.skills||[];
}
const ALIASES=Object.freeze({'português':'Língua Portuguesa','ingles':'Língua Inglesa',
 'inglês':'Língua Inglesa','educacao fisica':'Educação Física'});
function normalized(label){return String(label||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
export function validateSchoolSubjects(stageId,grade,selected){
 const allowed=getGradeSubjects(stageId,grade);
 if(!allowed.length||!Array.isArray(selected))return {valid:false,accepted:[],rejected:selected||[]};
 const index=new Map(allowed.map(s=>[normalized(s.label),s.label]));
 const accepted=[],rejected=[];
 for(const original of selected){
  const alias=ALIASES[String(original||'').trim().toLowerCase()];
  const label=index.get(normalized(alias||original));
  if(!label){rejected.push(original);continue;}
  if(!accepted.includes(label))accepted.push(label);
 }
 return {valid:accepted.length>0&&rejected.length===0,accepted,rejected};
}
export function getCoverage(stageId,grade,subjectId){
 const subjects=subjectId?getGradeSubjects(stageId,grade).filter(s=>s.subjectId===subjectId):getGradeSubjects(stageId,grade);
 const topics=subjects.flatMap(s=>s.topics),subtopics=topics.flatMap(t=>t.subtopics),skills=subtopics.flatMap(t=>t.skills);
 const ready=skills.filter(s=>s.editorialStatus==='aprovado'&&s.materials.length>0);
 return {subjects:subjects.length,topics:topics.length,subtopics:subtopics.length,skillsReferenced:skills.length,
  skillsWithApprovedContent:ready.length,materialReady:ready.length>0,
  availability:ready.length?'parcial_validado':'sem_material_aprovado'};
}
export function resolveSkill(stageId,grade,code){
 return getGradeSubjects(stageId,grade).flatMap(s=>s.topics).flatMap(t=>t.subtopics)
  .flatMap(t=>t.skills).find(s=>s.code===code)||null;
}
