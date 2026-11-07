/** VYZO ACADEMY — Laboratório de redação A1.
 * Propostas AUTORAIS de estudo. Links oficiais documentam fatos e orientações;
 * nenhum tema/título deste catálogo é atribuído a uma prova real do Inep.
 * Nenhuma proposta em revisão pode ser selecionada por estudante.
 */
export const WRITING_CATALOG_VERSION = '2026.11-A1';
export const WRITING_CATEGORIES=Object.freeze([
 {id:'enem',name:'ENEM (treino autoral)',description:'Texto dissertativo-argumentativo com competências da cartilha do Inep.'},
 {id:'vestibular',name:'Vestibulares',description:'Aguardando propostas e critérios verificados para cada instituição.'},
 {id:'concurso',name:'Discursivas de concursos',description:'Aguardando editais e critérios verificados por banca e cargo.'},
 {id:'escolar',name:'Produção escolar',description:'Aguardando materiais apropriados à série e proteção de menores.'}
]);
export const OFFICIAL_WRITING_GUIDE=Object.freeze({
 title:'A redação do Enem 2026 — Cartilha do(a) Participante',
 publisher:'Inep / Ministério da Educação',year:2026,
 url:'https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/a-redacao-do-enem-2026-cartilha-do-a-participante',
 physicalLines:30,
 note:'Na aplicação oficial, a redação é manuscrita em até 30 linhas. A quantidade de linhas exibidas pelo editor digital NÃO equivale a essas 30 linhas.'
});
const IBGE='https://agenciadenoticias.ibge.gov.br/media/com_mediaibge/arquivos/7552c746f69b9cb9b436b44bdce6b60a.pdf';
const LEI='https://legislacao.presidencia.gov.br/atos/?ano=2014&ato=93eUTRE9ENVpWTdb6&data=23%2F04%2F2014&numero=12965&tipo=LEI';
const freezeDeep=obj=>{if(obj&&typeof obj==='object'&&!Object.isFrozen(obj)){Object.values(obj).forEach(freezeDeep);Object.freeze(obj);}return obj};
export const WRITING_PROPOSALS=freezeDeep([{
 id:'enem-inclusao-digital-2026-a1',version:1,status:'validado_editorialmente',
 provenance:'TEMA AUTORAL DE TREINO',officialTheme:false,category:'enem',
 title:'Conectividade e cidadania',theme:'Desafios para reduzir a desigualdade no acesso à internet no Brasil',
 genre:'Texto dissertativo-argumentativo em prosa',
 educationalLevel:'Preparação para o ENEM / Ensino Médio (contas adultas homologadas)',
 timeLimitMinutes:90,timeLimitType:'sugestao_de_treino_nao_oficial',
 rubricId:'enem-cartilha-2026',
 publishedAt:'2026-11-07',versionLabel:'1.0',publisher:'VYZO ACADEMY — proposta original',
 instructions:'Com base na coletânea e nos conhecimentos construídos ao longo de sua formação, redija um texto dissertativo-argumentativo, em modalidade escrita formal da língua portuguesa, sobre o tema. Apresente uma tese, desenvolva argumentos consistentes e proponha uma intervenção social que respeite os direitos humanos. Escreva com autoria própria; não copie a coletânea.',
 criteria:[
  {id:'C1',title:'Competência I',description:'Domínio da modalidade escrita formal da língua portuguesa.'},
  {id:'C2',title:'Competência II',description:'Compreensão do tema e uso pertinente de repertório.'},
  {id:'C3',title:'Competência III',description:'Seleção, organização e desenvolvimento de argumentos.'},
  {id:'C4',title:'Competência IV',description:'Mecanismos de coesão textual.'},
  {id:'C5',title:'Competência V',description:'Proposta de intervenção respeitando os direitos humanos.'}
 ],
 sources:[
  {id:'ibge-pnad-tic-2024',publisher:'IBGE',title:'PNAD Contínua TIC 2024 — domicílios com Internet',
   url:IBGE,year:2025,locator:'Apresentação TIC 2024, página 19 do PDF',access:'link_para_documento_original'},
  {id:'marco-civil-2014',publisher:'Presidência da República',title:'Lei nº 12.965/2014 — Marco Civil da Internet',
   url:LEI,year:2014,locator:'Registro oficial da Lei nº 12.965, de 23 de abril de 2014',access:'link_para_texto_legal'},
  {id:'inep-cartilha-2026',publisher:'Inep',title:OFFICIAL_WRITING_GUIDE.title,
   url:OFFICIAL_WRITING_GUIDE.url,year:2026,locator:'Cartilha oficial publicada em 18/09/2026',access:'link_para_orientacoes'}
 ],
 supports:[
  {id:'motivo-1',kind:'informativo',title:'Texto motivador I — Panorama da conectividade',
   body:'A PNAD Contínua TIC 2024, publicada pelo IBGE em 2025, registrou utilização de Internet em 93,6% dos domicílios brasileiros. O indicador aponta expansão no acesso, mas não demonstra, sozinho, que todas as pessoas tenham as mesmas condições de conexão ou uso.',
   sourceIds:['ibge-pnad-tic-2024'],authorialParaphrase:true},
  {id:'motivo-2',kind:'tabela',title:'Texto motivador II — Diferenças territoriais',
   body:'Percentual de domicílios em que havia utilização da Internet em 2024, por situação do domicílio. A tabela foi elaborada pela VYZO ACADEMY a partir dos números oficiais do IBGE.',
   headers:['Situação','Domicílios com utilização de Internet'],
   rows:[['Brasil — total','93,6%'],['Áreas urbanas','94,7%'],['Áreas rurais','84,8%']],
   sourceIds:['ibge-pnad-tic-2024'],authorialParaphrase:true},
  {id:'motivo-3',kind:'informativo',title:'Texto motivador III — A Internet na vida pública',
   body:'O Marco Civil da Internet, instituído pela Lei nº 12.965/2014, estabelece princípios, direitos, garantias e deveres para o uso da Internet no Brasil. Para argumentar, reflita sobre como conectividade, formação digital, infraestrutura e participação social se relacionam.',
   sourceIds:['marco-civil-2014'],authorialParaphrase:true}
 ]
}]);
const PILOT=WRITING_PROPOSALS[0];
export function getWritingProposals(category=null){
 return WRITING_PROPOSALS.filter(p=>p.status==='validado_editorialmente'&&(!category||p.category===category));
}
export function getWritingProposal(id,version=null){
 return WRITING_PROPOSALS.find(p=>p.id===id&&(version==null||p.version===Number(version)))||null;
}
export function isWritingProposalReady(id){
 return Boolean(getWritingProposals().find(p=>p.id===id));
}
export function essayMetrics(text){
 const clean=String(text||'').replace(/\r\n?/g,'\n').trim();
 return {
  words:clean?clean.split(/\s+/u).length:0,
  paragraphs:clean?clean.split(/\n+/u).map(s=>s.trim()).filter(Boolean).length:0,
  characters:clean.length
 };
}
export function formatWritingTimer(seconds){
 const s=Math.max(0,Math.floor(Number(seconds)||0));
 return [Math.floor(s/3600),Math.floor(s%3600/60),s%60].map(n=>String(n).padStart(2,'0')).join(':');
}
export function proposalSnapshot(p){
 if(!p||!isWritingProposalReady(p.id))throw Error('Proposta em revisão ou inexistente.');
 return [
  'TEMA AUTORAL DE TREINO — '+p.theme,
  'Versão '+p.versionLabel+' · Publicação '+p.publishedAt,
  'Gênero: '+p.genre,
  p.instructions,
  'Textos motivadores (síntese autoral):',
  ...p.supports.map(s=>s.title+': '+s.body+(s.rows?' '+s.rows.map(row=>row.join(': ')).join('; '):'')),
  'Fontes originais:',
  ...p.sources.map(s=>s.publisher+': '+s.url)
 ].join('\n\n');
}
export function newEssayRecord(proposal,mode='treino',goalId=null){
 if(!proposal||!isWritingProposalReady(proposal.id))throw Error('Proposta indisponível.');
 if(!['treino','simulado'].includes(mode))throw Error('Modo de escrita inválido.');
 const record={
  title:'Redação — '+proposal.theme,prompt:proposalSnapshot(proposal),body:'',versions:[],
  proposal_id:proposal.id,proposal_version:proposal.version,writing_mode:mode,
  elapsed_seconds:0
 };
 if(goalId)record.goal_id=goalId;
 return record;
}
/** Novas versões acrescentam snapshots completos, não sobrescrevem o texto original. */
export function essayVersionSnapshot(essay){
 return {
  at:new Date().toISOString(),
  body:String(essay?.body||''),
  prompt:String(essay?.prompt||''),
  title:String(essay?.title||''),
  proposalId:essay?.proposal_id||null,proposalVersion:essay?.proposal_version||null,
  mode:essay?.writing_mode||'treino',elapsedSeconds:Math.max(0,Number(essay?.elapsed_seconds||0))
 };
}
export const ESSAY_PILOT_ID=PILOT.id;
