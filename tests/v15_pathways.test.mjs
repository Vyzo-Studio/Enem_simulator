import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {EDUCATION_STAGES,LEARNING_PATHS,getLearningPath,getSchoolStage,schoolYears,schoolSubjects,validSchoolYear,schoolGradeLabel,ENEM_OFFICIAL_ARCHIVE} from '../academy/v15-pathways.mjs';
import {suitableQuestions,sampleDiagnostic} from '../academy/v9-core.mjs';
assert.equal(EDUCATION_STAGES.length,3);
assert.deepEqual(schoolYears('fundamental1'),[1,2,3,4,5]);
assert.deepEqual(schoolYears('fundamental2'),[6,7,8,9]);
assert.deepEqual(schoolYears('medio'),[1,2,3]);
assert(validSchoolYear('fundamental1',3)&&validSchoolYear('fundamental2',7)&&validSchoolYear('medio',2));
assert(!validSchoolYear('fundamental1',7)&&!validSchoolYear('medio',6)&&!validSchoolYear('invalid',1));
assert.equal(schoolGradeLabel('fundamental2',7),'7º ano do Ensino Fundamental II');
assert.equal(getLearningPath('school').type,'Prova escolar');
assert.equal(getLearningPath('enem').type,'ENEM');
assert.equal(getSchoolStage('medio').label,'Ensino Médio');
assert(schoolSubjects('fundamental1').includes('Matemática'));
assert(schoolSubjects('fundamental2').includes('Inglês'));
assert.equal(ENEM_OFFICIAL_ARCHIVE.years[0],2025);
assert.equal(ENEM_OFFICIAL_ARCHIVE.years.at(-1),1998);
assert(ENEM_OFFICIAL_ARCHIVE.url.startsWith('https://www.gov.br/inep/'));
const ctx=vm.createContext({window:{}});
for(const name of ['questions','extra_questions','advanced_questions']){
 vm.runInContext(readFileSync(new URL('../src/'+name+'.js',import.meta.url),'utf8'),ctx);
}
const bank=ctx.window.QUESTION_BANK;
for(const type of ['fundamental1','fundamental2','medio']){
 const g={type:'Prova escolar',educationStage:type,schoolYear:schoolYears(type)[0],subjects:['Matemática'],provisional:true};
 assert.equal(suitableQuestions(bank,g).length,0,'Não misturar questões ENEM e escolares mesmo se o objetivo legado permitir provisório.');
}
const enem={type:'ENEM',subjects:['Matemática'],foreignLanguage:'Inglês'};
assert(sampleDiagnostic(bank,enem,10).every(q=>q.area==='Matemática'));
console.log('PASS V15: 3 etapas, séries válidas, objetivos e banco ENEM isolado das provas escolares');
