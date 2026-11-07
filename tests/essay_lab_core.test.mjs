import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 WRITING_CATEGORIES,WRITING_CATALOG_VERSION,WRITING_PROPOSALS,OFFICIAL_WRITING_GUIDE,
 getWritingProposals,getWritingProposal,newEssayRecord,essayMetrics,proposalSnapshot,
 essayVersionSnapshot,formatWritingTimer
} from '../academy/essay-lab.mjs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
assert.equal(WRITING_CATEGORIES.length,4);
assert.deepEqual(WRITING_CATEGORIES.map(c=>c.id),['enem','vestibular','concurso','escolar']);
assert.equal(getWritingProposals('enem').length,1,'Somente proposta validada aparece');
for(const category of ['vestibular','concurso','escolar'])assert.deepEqual(getWritingProposals(category),[],'Sem conteúdo inventado: '+category);
const p=WRITING_PROPOSALS[0];
assert.equal(p.officialTheme,false);assert.equal(p.provenance,'TEMA AUTORAL DE TREINO');
assert.equal(p.version,1);assert.equal(p.publishedAt,'2026-11-07');
assert.equal(p.rubricId,'enem-cartilha-2026');
assert.equal(p.criteria.length,5);
assert.equal(p.supports.length,3);
assert.equal(p.sources.length,3);
assert(Object.isFrozen(p)&&Object.isFrozen(p.supports[0]));
assert.deepEqual(p.supports.find(x=>x.kind==='tabela').rows.map(x=>x[1]),['93,6%','94,7%','84,8%']);
for(const s of p.supports)for(const id of s.sourceIds)assert(p.sources.some(source=>source.id===id));
for(const source of p.sources){
 const url=new URL(source.url);
 assert.equal(url.protocol,'https:');
 assert(['agenciadenoticias.ibge.gov.br','legislacao.presidencia.gov.br','www.gov.br'].includes(url.hostname));
 assert(source.locator.length>8&&source.publisher.length>3);
}
assert.equal(OFFICIAL_WRITING_GUIDE.physicalLines,30);
assert.match(OFFICIAL_WRITING_GUIDE.note,/NÃO equivale/);
assert.equal(getWritingProposal(p.id,1),p);
assert.equal(getWritingProposal(p.id,2),null);
assert.equal(getWritingProposal('tema_ausente'),null);
const record=newEssayRecord(p,'simulado','c48e9900-8d2b-44ba-a088-1d3d9d7b0001');
assert.equal(record.writing_mode,'simulado');
assert.equal(record.goal_id,'c48e9900-8d2b-44ba-a088-1d3d9d7b0001');
assert.equal(record.proposal_id,p.id);
assert.equal(record.proposal_version,p.version);
assert.equal(record.elapsed_seconds,0);
assert.equal(record.versions.length,0);
assert.match(record.prompt,/93,6%/);
assert.match(record.prompt,/https:\/\/www.gov.br\/inep/);
assert.throws(()=>newEssayRecord(p,'generico'),/inválido/);
assert.throws(()=>newEssayRecord(null),/indisponível/);
assert.deepEqual(essayMetrics(''),{words:0,paragraphs:0,characters:0});
assert.deepEqual(essayMetrics('Uma frase.\n\nOutra frase.\nFim.'),{words:6,paragraphs:3,characters:29});
assert.equal(formatWritingTimer(0),'00:00:00');
assert.equal(formatWritingTimer(3661),'01:01:01');
assert.equal(formatWritingTimer(-20),'00:00:00');
const old={title:'Redação antiga',body:'Texto histórico',prompt:'Proposta do aluno',versions:[{at:'2026-10-01T00:00:00Z',body:'Primeira versão',prompt:'Original'}]};
const version=essayVersionSnapshot(old);
assert.equal(version.body,'Texto histórico');
assert.equal(version.prompt,'Proposta do aluno');
assert.equal(version.proposalId,null);
assert.equal(old.versions.length,1,'Snapshot não altera redações antigas');
const app=read('academy/app.mjs'),ui=read('academy/essay-lab-ui.mjs'),migration=read('supabase/migrations/202611070005_writing_lab_essay_metadata.sql');
assert(app.includes("essay-start-proposal")&&app.includes("essayCacheKey")&&app.includes("eq('updated_at',expected)"));
assert(app.includes("case 'essay-version'")&&app.includes("case 'essay-focus'")&&app.includes('essaySave')===false);
assert(ui.includes('Modo simulado')&&ui.includes('Textos motivadores')&&ui.includes('editor digital')===false);
assert(ui.includes('NÃO equivale')===false); // A frase vem do catálogo, não é copiada incorretamente.
assert(migration.includes('add column if not exists proposal_id'));
assert(migration.includes("writing_mode in ('treino','simulado')"));
assert(!migration.includes('DROP TABLE')&&!migration.includes('TRUNCATE')&&!migration.includes('DELETE FROM'));
assert(!app.includes("OPENAI_API_KEY"));
assert(!app.includes("service_role"));
assert.match(WRITING_CATALOG_VERSION,/^\d{4}\.\d{2}-A1$/);
console.log('PASS Writing Lab A: 4 modalidades, 1 tema verificado, fontes, estatísticas IBGE, rubric não-oficial, métricas, versões legadas e migração aditiva.');
