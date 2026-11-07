import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 CURRICULUM_VERSION,CURRICULUM_SOURCES,CURRICULUM_TREE,getStages,getGrades,getGrade,
 getGradeSubjects,getTopics,getSubtopics,getSkills,getCoverage,validateSchoolSubjects,resolveSkill
} from '../academy/curriculum-taxonomy.mjs';
import {schoolSubjects,validateSchoolSubjectSelection} from '../academy/v15-pathways.mjs';
import {suitableQuestions} from '../academy/v9-core.mjs';
const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
assert.match(CURRICULUM_VERSION,/^\d{4}\.\d{2}-A1$/);
assert.deepEqual(getStages().map(s=>s.id),['fundamental1','fundamental2','medio','enem']);
assert.deepEqual(getGrades('fundamental1').map(g=>g.year),[1,2,3,4,5]);
assert.deepEqual(getGrades('fundamental2').map(g=>g.year),[6,7,8,9]);
assert.deepEqual(getGrades('medio').map(g=>g.year),[1,2,3]);
assert.deepEqual(getGrades('enem').map(g=>g.year),[null]);
assert.equal(getGrade('fundamental1',6),null);
assert.equal(getGrade('medio',4),null);
assert.equal(getGradeSubjects('invalid',3).length,0);
assert.equal(getGrade('enem',null)?.label,'Matriz geral do ENEM');

const allIds=new Set();
for(const stage of CURRICULUM_TREE){
 for(const grade of stage.grades){
  assert(!allIds.has(grade.id),'Grade ID repetido');
  allIds.add(grade.id);
  assert(grade.subjects.length>0,'Série sem disciplinas');
  for(const subject of grade.subjects){
   assert(!allIds.has(subject.id),'Subject ID repetido: '+subject.id);
   allIds.add(subject.id);
   assert(CURRICULUM_SOURCES[subject.sourceId],'Componente sem referência institucional');
   assert.equal(subject.editorialStatus,'sem_material_aprovado');
   for(const topic of subject.topics){
    assert(!allIds.has(topic.id),'Tópico repetido');allIds.add(topic.id);
    for(const sub of topic.subtopics){
     assert(!allIds.has(sub.id),'Subtópico repetido');allIds.add(sub.id);
     for(const skill of sub.skills){
      assert(!allIds.has(skill.id),'Habilidade repetida');allIds.add(skill.id);
      assert(CURRICULUM_SOURCES[skill.sourceId],'Habilidade sem fonte');
      assert(skill.referenceVerified,'Habilidade sem validação declarada');
      assert.equal(skill.materials.length,0,'Material em revisão não pode ser publicado');
      assert.equal(skill.questionIds.length,0);
     }
    }
   }
  }
 }
}
for(let year=1;year<=5;year++){
 const labels=schoolSubjects('fundamental1',year);
 assert(!labels.includes('Língua Inglesa'),'Inglês indevido antes do 6º ano');
 assert(labels.includes('Matemática')&&labels.includes('Língua Portuguesa'));
 assert(labels.includes('Ensino Religioso'),'Componente optativo deve constar');
}
for(let year=6;year<=9;year++)assert(schoolSubjects('fundamental2',year).includes('Língua Inglesa'));
for(let year=1;year<=3;year++){
 const labels=schoolSubjects('medio',year);
 for(const name of ['Matemática','Física','Química','Biologia','Filosofia','Sociologia','Língua Inglesa'])
  assert(labels.includes(name),'Áreas EM sem componente: '+name);
 assert.equal(getGrade('medio',year).gradeMapping,'organizacao_pedagogica');
}
assert.equal(schoolSubjects('fundamental2').includes('Inglês'),true,'API legada inalterada');
const valid=validateSchoolSubjects('fundamental1',3,['Português','Matemática','Matemática']);
assert.equal(valid.valid,true);assert.deepEqual(valid.accepted,['Língua Portuguesa','Matemática']);
assert(!validateSchoolSubjectSelection('fundamental1',3,['Língua Inglesa']).valid);
assert.deepEqual(validateSchoolSubjects('fundamental1',3,['Matemática','Língua Inglesa']).rejected,['Língua Inglesa']);
assert.equal(validateSchoolSubjects('medio',2,['Matemática']).valid,true);
const topics=getTopics('fundamental1',3,'matematica');
assert.equal(topics.length,1);
assert.equal(topics[0].label,'Números');
const sub=getSubtopics('fundamental1',3,'matematica',topics[0].id);
assert.equal(sub.length,1);
const skills=getSkills('fundamental1',3,'matematica',topics[0].id,sub[0].id);
assert.equal(skills.length,1);
assert.equal(skills[0].code,'EF03MA06');
assert.equal(skills[0].sourcePage,285);
assert.equal(resolveSkill('fundamental1',3,'EF03MA06')?.id,'EF03MA06');
assert.equal(resolveSkill('fundamental1',4,'EF03MA06'),null);
assert.equal(getCoverage('fundamental1',3,'matematica').skillsReferenced,1);
assert.equal(getCoverage('fundamental1',3,'matematica').skillsWithApprovedContent,0);
assert.equal(getCoverage('fundamental1',4,'matematica').availability,'sem_material_aprovado');
assert.equal(getCoverage('medio',2,'matematica').skillsReferenced,0);
assert(getGradeSubjects('enem',null).some(s=>s.subjectId==='redacao'));
assert.equal(getCoverage('enem',null).materialReady,false);
for(const source of Object.values(CURRICULUM_SOURCES)){
 const url=new URL(source.url);
 assert.equal(url.protocol,'https:');
 assert(['basenacionalcomum.mec.gov.br','legis.senado.gov.br','www.gov.br'].includes(url.hostname),'Fonte fora do órgão oficial');
 assert(source.version&&source.publisher);
}
assert(Object.isFrozen(CURRICULUM_TREE)&&Object.isFrozen(topics[0]));
assert(!read('academy/curriculo.mjs').includes('localStorage'),'Mapa não deve acessar dados privados');
assert(!read('academy/curriculo.mjs').includes('signUp('));
assert.match(read('academy/v9.mjs'),/const KEY='vyzo-academy-v9-guest-1'/);
assert.match(read('academy/v9.mjs'),/schema:9/);
assert(read('academy/v9.mjs').includes("schoolSubjectFields")&&read('academy/v9.mjs').includes('validateSchoolSubjectSelection'));
const core=read('academy/v9-core.mjs');
assert(core.includes("if(goal.type==='Prova escolar'||goal.educationStage)return [];"));
assert.equal(suitableQuestions([], {type:'Prova escolar',educationStage:'fundamental1',schoolYear:3}).length,0);
console.log('PASS BLOCO 01/A: 13 séries + ENEM, disciplinas por ano, referência EF03MA06, fontes, IDs, zero aulas indevidas, V9 intacto.');
