/**
 * V15.1 — microcatálogo curricular autoral.
 * Referências curriculares conferidas em órgãos públicos; o material educacional
 * ainda exige revisão editorial humana antes de ser vendido como BNCC validada.
 * Nunca usar para declarar suporte integral a uma série.
 */
const common={curriculumVersion:'BNCC (referência MEC, edição 2018)',contentVersion:'1.0.0',
 editorialStatus:'em_revisao',authorship:'VYZO Studio — conteúdo autoral para revisão',
 subject:'Matemática',area:'Matemática',availableScope:'Apenas este tópico-piloto',
 isOfficialExam:false};
const question=(id,stem,options,answer,rule,explanation)=>({id,stem,options,answer,rule,explanation,
 difficulty:'introdutoria',status:'em_revisao'});
export const SCHOOL_PILOTS=Object.freeze([
 {...common,id:'v15-pilot-ef03ma06-1',stage:'fundamental1',grade:3,
  topic:'Problemas de adição e subtração',subtopic:'Juntar, retirar, comparar e completar',
  skillCode:'EF03MA06',learningObjective:'Resolver situações de adição e subtração com diferentes significados.',
  verificationSource:'https://www.referencialcurriculardoparana.pr.gov.br/Matematica-3o-Ano',
  originalReference:'https://basenacionalcomum.mec.gov.br/',
  ageNote:'Atividade curta, leitura simples e cálculo com números naturais.',
  intro:'Somar é juntar quantidades. Subtrair pode significar retirar, descobrir a diferença ou calcular quanto falta. Leia o problema antes de escolher a operação.',
  worked:[{title:'Juntar quantidades',question:'Uma caixa tem 24 lápis e recebeu mais 18. Quantos lápis há agora?',
    steps:['Primeiro, some as dezenas: 20 + 10 = 30.','Depois, some as unidades: 4 + 8 = 12.','Junte: 30 + 12 = 42 lápis.']},
   {title:'Descobrir quanto falta',question:'Lia tem 58 figurinhas e quer chegar a 100. Quantas faltam?',
    steps:['Queremos descobrir o número que completa 58 até 100.','Calcule 100 − 58 = 42.','Verificação: 58 + 42 = 100.']}],
  review:['Somar pode juntar ou acrescentar.','Subtrair pode retirar, comparar ou completar.','Confira a resposta usando a operação inversa.'],
  questions:[
   question('ef03-01','Havia 24 lápis e chegaram mais 18. Quantos lápis há agora?',['32','42','44','52'],1,{kind:'add',a:24,b:18},'24 + 18 = 42: junte dezenas e unidades.'),
   question('ef03-02','Uma estante tinha 63 livros. Foram retirados 27. Quantos restaram?',['36','40','46','90'],0,{kind:'subtract',a:63,b:27},'63 − 27 = 36. Confira: 36 + 27 = 63.'),
   question('ef03-03','No grupo A há 85 crianças; no B, 47. Quantas a mais há no A?',['28','38','42','132'],1,{kind:'subtract',a:85,b:47},'85 − 47 = 38; a diferença responde “quantas a mais”.'),
   question('ef03-04','Um pote tinha 38 peças e recebeu mais 16. Quantas há no pote?',['44','46','54','56'],2,{kind:'add',a:38,b:16},'38 + 16 = 54. Some 30 + 10 e depois 8 + 6.'),
   question('ef03-05','Joana tinha 90 adesivos e deu 44. Com quantos ficou?',['36','44','46','54'],2,{kind:'subtract',a:90,b:44},'90 − 44 = 46. Confira: 44 + 46 = 90.'),
   question('ef03-06','Faltam quantas figurinhas para 58 chegar a 100?',['32','40','42','48'],2,{kind:'missingAdd',total:100,a:58},'100 − 58 = 42. Verifique: 58 + 42 = 100.')
  ]},
 {...common,id:'v15-pilot-ef07ma08-1',stage:'fundamental2',grade:7,topic:'Comparação de frações',
  subtopic:'Frações equivalentes e denominadores diferentes',skillCode:'EF07MA08',
  learningObjective:'Comparar e ordenar frações como partes do todo, razão e resultado da divisão.',
  verificationSource:'https://www.referencialcurriculardoparana.pr.gov.br/Matematica-7o-Ano',
  originalReference:'https://basenacionalcomum.mec.gov.br/',
  ageNote:'Comparações de frações positivas com interpretação numérica.',
  intro:'Duas frações podem ter denominadores diferentes. Para comparar a/b com c/d (denominadores positivos), compare a × d com c × b. Produtos iguais indicam frações equivalentes.',
  worked:[{title:'Comparando denominadores diferentes',question:'Qual é maior: 1/2 ou 3/8?',
    steps:['Faça a multiplicação cruzada: 1 × 8 = 8.','Faça o outro produto: 3 × 2 = 6.','Como 8 é maior que 6, 1/2 > 3/8.']},
   {title:'Frações equivalentes',question:'2/3 e 4/6 representam a mesma quantidade?',
    steps:['Multiplique em cruz: 2 × 6 = 12 e 4 × 3 = 12.','Os produtos são iguais.','Portanto, 2/3 = 4/6.']}],
  review:['Em frações de mesmo denominador, compare os numeradores.','Em denominadores diferentes positivos, compare produtos cruzados.','Uma fração equivalente pode ter números diferentes e o mesmo valor.'],
  questions:[
   question('ef07-01','Complete com <, = ou >: 1/2 __ 3/8',['<','=','>'],2,{kind:'compare',a:1,b:2,c:3,d:8},'1 × 8 = 8 e 3 × 2 = 6. Logo, 1/2 > 3/8.'),
   question('ef07-02','Complete: 2/3 __ 4/6',['<','=','>'],1,{kind:'compare',a:2,b:3,c:4,d:6},'2 × 6 = 12 e 4 × 3 = 12. As frações são equivalentes.'),
   question('ef07-03','Complete: 3/10 __ 1/2',['<','=','>'],0,{kind:'compare',a:3,b:10,c:1,d:2},'3 × 2 = 6 e 1 × 10 = 10. Como 6 < 10, 3/10 < 1/2.'),
   question('ef07-04','Complete: 5/8 __ 2/3',['<','=','>'],0,{kind:'compare',a:5,b:8,c:2,d:3},'5 × 3 = 15 e 2 × 8 = 16. Logo, 5/8 < 2/3.'),
   question('ef07-05','Complete: 7/12 __ 1/2',['<','=','>'],2,{kind:'compare',a:7,b:12,c:1,d:2},'7 × 2 = 14 e 1 × 12 = 12. Logo, 7/12 > 1/2.'),
   question('ef07-06','Complete: 9/15 __ 3/5',['<','=','>'],1,{kind:'compare',a:9,b:15,c:3,d:5},'9 × 5 = 45 e 3 × 15 = 45. Os valores são iguais.')
  ]},
 {...common,id:'v15-pilot-em13mat302-1',stage:'medio',grade:2,
  topic:'Modelagem com funções afins',subtopic:'Taxa de variação e valor inicial',
  skillCode:'EM13MAT302',learningObjective:'Construir e interpretar modelos com funções polinomiais do 1º grau em problemas cotidianos.',
  bnccGradeNote:'A BNCC identifica esta habilidade para todo o Ensino Médio (1ª a 3ª série). A associação ao 2º ano é escolha de organização da VYZO.',
  verificationSource:'https://site.seduc.se.gov.br/redeEstadual/escolaDisciplinaDetalhes.asp?cdComponente=1258&cdTurma=114359',
  originalReference:'https://basenacionalcomum.mec.gov.br/',
  ageNote:'Problemas contextualizados com função afim f(x)=ax+b.',
  intro:'Uma função afim é escrita como f(x) = ax + b. O valor b representa uma quantidade inicial; a indica quanto o total varia a cada unidade de x. Identifique as duas partes antes de substituir x.',
  worked:[{title:'Montando a expressão',question:'Uma entrega custa R$ 6 de taxa fixa e R$ 4 por quilômetro. Quanto custa percorrer 3 km?',
    steps:['A taxa fixa é b = 6. O custo por quilômetro é a = 4.','Modelo: f(x) = 4x + 6.','Para x = 3: f(3) = 4 × 3 + 6 = 18 reais.']},
   {title:'Interpretando o modelo',question:'Um serviço cobra R$ 12 fixos e R$ 3 por hora. Qual o total de 5 horas?',
    steps:['Modelo: f(h) = 3h + 12.','Para h = 5, substitua: 3 × 5 + 12.','Resultado: R$ 27.']}],
  review:['Identifique o valor inicial b antes de começar.','A taxa a multiplica a quantidade x.','Substitua x e calcule a × x + b.','Uma sequência de acertos em um único tópico não demonstra domínio de toda a série.'],
  questions:[
   question('em-01','Uma entrega cobra R$ 6 fixos e R$ 4 por km. Qual o total de 3 km?',['R$ 12','R$ 18','R$ 22','R$ 24'],1,{kind:'affine',a:4,b:6,x:3},'f(x) = 4x + 6; f(3) = 4 × 3 + 6 = 18.'),
   question('em-02','Um serviço cobra R$ 12 fixos e R$ 3 por hora. Total de 5 horas?',['R$ 15','R$ 25','R$ 27','R$ 30'],2,{kind:'affine',a:3,b:12,x:5},'f(h) = 3h + 12; f(5) = 3 × 5 + 12 = 27.'),
   question('em-03','Um aplicativo cobra R$ 8 fixos e R$ 2 por uso. Qual o total em 7 usos?',['R$ 14','R$ 18','R$ 22','R$ 24'],2,{kind:'affine',a:2,b:8,x:7},'f(x) = 2x + 8; f(7) = 2 × 7 + 8 = 22.'),
   question('em-04','Um aluguel tem taxa de R$ 15 e R$ 5 por dia. Total de 4 dias?',['R$ 20','R$ 30','R$ 35','R$ 40'],2,{kind:'affine',a:5,b:15,x:4},'f(d) = 5d + 15; f(4) = 5 × 4 + 15 = 35.'),
   question('em-05','Uma inscrição custa R$ 9 e cada atividade acrescenta R$ 6. Total com 2 atividades?',['R$ 12','R$ 15','R$ 21','R$ 27'],2,{kind:'affine',a:6,b:9,x:2},'f(x) = 6x + 9; f(2) = 6 × 2 + 9 = 21.'),
   question('em-06','Uma assinatura tem R$ 10 fixos e R$ 7 por recurso. Total com 4 recursos?',['R$ 28','R$ 34','R$ 38','R$ 42'],2,{kind:'affine',a:7,b:10,x:4},'f(x) = 7x + 10; f(4) = 7 × 4 + 10 = 38.')
  ]}
]);
export const findSchoolPilot=(goal)=>goal?.type==='Prova escolar'&&Array.isArray(goal.subjects)&&
 goal.subjects.some(s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()==='matematica')?
 SCHOOL_PILOTS.find(p=>p.stage===goal.educationStage&&p.grade===Number(goal.schoolYear))||null:null;
export const schoolPilotAvailability=(goal)=>findSchoolPilot(goal)?
 'piloto_em_revisao':'sem_conteudo_validado';
