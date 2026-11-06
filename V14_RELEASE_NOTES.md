# VYZO ACADEMY — Entrega incremental V14.0 (06/11/2026)

## Estado
Esta entrega aprimora a **jornada local V9** e o sistema de avaliação, mantendo a versão clássica e a V13. A aplicação **ainda não é uma plataforma totalmente unificada, autenticada ou sincronizada**. A branch V12 permanece separada, aguardando projeto exclusivo Supabase e testes reais de contas e RLS.

## Implementado nesta entrega

1. **Dados e segurança de edição:** editar nome, instituição, cargo, banca, edição, data, matérias, tópicos, idioma, prioridade e estado da prova; duplicar somente a configuração; pausar, restaurar e arquivar sem excluir diagnósticos. Alterações curriculares guardam uma versão do conteúdo anterior, preservam provas históricas, substituem somente tarefas futuras pendentes da prova e exigem novo diagnóstico antes de considerar o novo currículo avaliado.
2. **Taxonomia de matérias:** normalização Unicode e aliases explícitos, sem comparação por `includes()` para aceitar matérias não equivalentes. Seleção por área inclui questões da área; uma disciplina específica não corresponde automaticamente a outra com nome parcialmente semelhante.
3. **Diagnóstico focalizado:** objetivo com uma área ou matéria selecionada sugere a avaliação concentrada; prova geral continua exigindo quotas das quatro áreas, sem preenchimento silencioso. Mantém a prévia determinística.
4. **Evidência pedagógica:** uma única avaliação não produz classificação definitiva de domínio. Indicadores novos: Não avaliado, Evidência insuficiente, Precisa de revisão, Em desenvolvimento, Consolidando. Históricos antigos e IDs permanecem preservados.
5. **Tempo de prova:** cronômetro ativo com pausa explícita; contagem regressiva com prazo contínuo; prática sem limite. O cronômetro preserva o tempo ativo na suspensão e após recarregamento. O relógio contínuo só finaliza automaticamente quando a aplicação voltar a executar; o GitHub Pages não possui processo de finalização em segundo plano.
6. **Disponibilidade por dia:** minutos configuráveis para cada dia da semana no onboarding, com compatibilidade de perfis antigos. Planejamento mantém o orçamento global compartilhado entre objetivos.
7. **Agenda:** filtros hoje/semana/mês/todas; formulário para remarcar atividades pendentes com conferência de capacidade e sobreposição, mantendo tarefas concluídas e histórico.
8. **Dashboard:** sugestão da próxima tarefa pendente a partir de atividades existentes; não inventa dados de desempenho.
9. **Biblioteca e centro de erros:** busca em assuntos do banco autoral organizada por prova, área e disciplina; revisão de respostas incorretas com alternativas e explicações reais; questões em branco ficam separadas. Não se apresenta como inteligência artificial.
10. **Documentação:** privacidade, termos de uso e notas de release alinhados à operação local efetivamente publicada.

## Arquivos principais
- `academy/v9-core.mjs`
- `academy/v9.mjs`, `academy/v9.css`, `academy/v9.html`
- `privacidade.html`, `academy/termos.html`
- `tests/v14_core.test.mjs`, `tests/v14_browser.py`
- `.github/workflows/pages.yml`

## Validações
- `node tests/v14_core.test.mjs`: correspondência de matérias, seleção focalizada, ENEM geral e rótulos de evidência.
- `python3 tests/v14_browser.py`: edição, duplicação, arquivamento, preservação de histórico, disponibilidade, remarcação, suspensão/retomada de relógio, expiração de contagem regressiva, biblioteca e erros, em tamanhos de tela distintos.
- Workflow Quality checks: testes antigos V6, V8, V9, V10, V13 mais os testes V14. Consultar resultados do commit final antes de afirmar aprovação da entrega.
- Backend de autenticação real, migração cloud e isolamento entre duas contas: **NÃO testados / NÃO ativados**.

## Não implementado nesta etapa
- Supabase exclusivo, cadastro obrigatório e sincronização entre dispositivos; política RLS testada com estudantes A/B; unificação completa das interfaces clássica/V8/V9/V10/V12.
- Pesquisa viva de editais V10, tutor IA, correção por IA e notificações: exigem backend autenticado, gestão de custos e integrações reais.
- Curadoria editorial dos 144 itens apontados em 22 grupos; banco existente preservado.
- Biblioteca extensiva por subtopicos, pré-requisitos, flashcards e trilhas de conhecimento completamente validadas.
- Calendário de exceções, férias, janelas de horas, redistribuição automática de faltas, relatórios semanais automatizados.
- Teste manual integral do endereço público, leitores de tela físicos, múltiplas abas em dispositivos distintos, sincronização offline/cloud.

## Critério de publicação
Publicar somente se a branch V14 passar na workflow e a revisão confirmar que não houve alteração destrutiva de dados. Nunca ativar login obrigatório antes de banco dedicado, confirmação de e-mail, recuperação, testes RLS de contas A/B e restauração de históricos.
