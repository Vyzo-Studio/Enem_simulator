# ENEM INTELLIGENCE — Universal Exam Mentor v3 (incremental)

Plataforma educativa independente, executada no navegador, hospedável no GitHub Pages. A evolução v3 **não reconstrói o sistema v2**: mantém o banco atual, o motor de simulados, os dados já salvos, a correção, a redação e o recurso de recuperar respostas antigas.

> **IMPORTANTE:** questões do banco são autorais, não questões oficiais do Inep. Não existe nota TRI oficial, avaliação automática por IA nem pesquisa de editais em tempo real nesta versão. Resultados são indicadores pedagógicos locais.

## O que foi acrescentado na v3

- **Meu objetivo:** cadastro de tipo de prova, prova/órgão, cargo ou curso, edição, banca opcional, data, horas, dias, nível, dificuldades e preferência de estudo, com salvamento automático.
- **Explorador de provas:** diretório de fontes oficiais e um campo para colar o conteúdo programático de um edital. A identificação de matérias é apenas uma busca local por palavras: não valida edital, vagas, regras ou banca.
- **Professor guiado:** revisão de tópicos do banco autoral, explicações e exemplos contextualizados, registro de anotações e prática sobre o mesmo assunto. **Não é um chatbot de IA.**
- **Revisões e flashcards:** 16 cartões didáticos com resposta revelada quando solicitada, autoavaliação e agenda 1/3/7/14/30 dias. Revisão das questões erradas e tentativa de reteste com questões ainda não respondidas do mesmo assunto, apenas quando existirem.
- **Plano de estudo individual:** depende do perfil e de ao menos um diagnóstico ENEM. Gera blocos por data e minutos com base no histórico, horários e dias disponíveis. Um assunto só pode ser considerado dominado após evidência suficiente; não existe certeza automática.
- **Oficina de redação:** temas inéditos para treino, editor, salvamento de versões, sorteio sem repetição imediata e checklist das cinco competências. **Sem nota gerada por IA**, que dependeria de serviço autorizado.
- **Correção:** acesso direto ao conteúdo correspondente em cada questão corrigida, além das explicações anteriores.
- **Integridade:** backup pré-finalização adicional na chave `enem-intelligence-recovery-<id>`, sem apagar o histórico; dados novos armazenados junto do mesmo objeto v2.
- **Mobile:** menu com rolagem independente para acomodar novas seções.

## Funcionalidades anteriores mantidas

- 64 questões novas contextualizadas (16 por área), 72 questões legadas utilizadas exclusivamente em possíveis recuperações.
- Simulados por área, disciplina, assunto e amostras dos dois dias do ENEM, língua estrangeira única; 5 alternativas.
- Simulado em andamento com autosalvamento, cronômetro opcional, progresso, navegação, marcador para revisão e confirmação de finalização no próprio site.
- Correção comentada, respostas em branco identificadas separadamente, indicadores de desempenho, histórico, modo claro e escuro, backup e importação JSON, redação e plano básico.

## Segurança e compatibilidade

A chave principal **permanece `enem-intelligence-v2`**, sem criar um novo armazenamento incompatível. O estado v3 usa o campo opcional `mentor` com versão independente. O código continua lendo a chave `enem-intelligence-v1` para possíveis resgates. A exportação JSON inclui questões, provas, histórico, redação e os dados v3; a importação preserva `mentor` quando presente. O sistema não envia respostas ou documentos para servidores.

A privacidade depende também das configurações do navegador/dispositivo; não há contas nem sincronização em nuvem. É recomendável baixar backup JSON durante uma prova longa. A versão antiga fica preservada na branch `backup-enem-v2-nov2026`.

## Requisitos que ainda dependem de infraestrutura ou curadoria

- Professor IA com linguagem livre, geração e correção automática confiável: requer backend, provedor autorizado, gestão de custos e proteção de credenciais.
- Avaliar redações e gerar nota por competência com IA: ainda não implementado; só há guia de autocorreção.
- Pesquisa viva de concursos e leitura automática de PDF: demanda serviço de pesquisa/documentos; atualmente o estudante consulta fontes oficiais e pode colar trechos do edital.
- Recomendações de vídeos com título, canal, duração, curtidas e visualizações verificados: a aplicação abre **busca do YouTube**, sem inventar métricas. Integração com YouTube Data API exigiria autorização e backend.
- Provas de concurso com CERTO/ERRADO, redação técnica e regras por banca: exigem edital validado e banco próprio. O banco ENEM **não** é exibido como avaliação específica de outro concurso.
- 180 itens oficiais, TRI, pesquisa longitudinal oficial 2021–2025 e análise psicométrica: não implementados nem simulados.

## Desenvolvimento

Arquivos editáveis: `src/template.html`, `src/styles.css`, `src/questions.js`, `src/legacy.js`, `src/app.js` e `src/mentor.js`. `scripts/build.py` gera a distribuição autossuficiente `index.html`.

```bash
python3 scripts/build.py
node tests/qa.mjs
python3 scripts/build.py --check
```

Há testes de navegação com Chromium automatizado durante o desenvolvimento; ver `QA_REPORT.md` para escopo e resultados. O site é publicado pelo GitHub Pages do repositório a partir da branch `main`; o workflow `.github/workflows/pages.yml` contém apenas a verificação de qualidade.

- Repositório: https://github.com/Vyzo-Studio/Enem_simulator
- Site previsto: https://vyzo-studio.github.io/Enem_simulator/
- Provas oficiais do Inep: https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos

**ENEM INTELLIGENCE:** mais do que simulados, um acompanhamento didático verificável — com limitações identificadas.


## V4 — Simulados de 10 a 100 questões inéditas (04/11/2026)

- Banco autoral: **208 questões** (64 existentes + 144 novas), com situações contextualizadas, cálculos e alguns recursos visuais originais. Os 72 itens antigos continuam exclusivamente na recuperação.
- Escolha **10, 20, 30, 40, 50, 60, 70, 80, 90 ou 100**; o número é permitido apenas quando há questões inéditas suficientes para os filtros escolhidos.
- O histórico persistente `seenIds` reserva as questões ao iniciar uma prova; o sorteio exclui as já iniciadas, concluídas e importadas. Backups antigos não reiniciam a relação de perguntas já vistas.
- Quando o saldo for insuficiente, a prova não começa: o banco é finito e a plataforma não inventa questões para completar uma quantidade pedida. Em assuntos muito específicos pode haver menos de 10 itens inéditos.
- A navegação foi aprimorada com barra rápida no celular, localização da página, salto por número de questão e botão para próxima questão pendente.
- Compatibilidade preservada com o armazenamento `enem-intelligence-v2`, resultados antigos, redações e recuperação V1/V2/V3.
- A prevenção de repetição vale enquanto os dados locais ou um backup importado forem mantidos. Limpar o navegador ou trocar de aparelho sem backup pode apagar a relação de questões usadas.

O conteúdo adicional é mantido em `src/extra_questions.js`, integrado pelo `scripts/build.py`. Todas as questões são autorais e não são itens oficiais do Inep.


## Modos de tempo do simulado

Na configuração, escolha **Cronômetro crescente** (começa em zero, mede o tempo decorrido e não finaliza a prova automaticamente) ou **Contagem regressiva** (prazo de 1 a 360 minutos com correção automática ao chegar a zero). Quando o prazo termina, as alternativas já marcadas são preservadas e as não respondidas permanecem em branco. Se a prova for retomada depois do término do prazo, a finalização ocorre imediatamente. Dados antigos com o campo `timed` continuam compatíveis.
