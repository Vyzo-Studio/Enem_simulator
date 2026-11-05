# VYZO ACADEMY — Auditoria e correções V13

**Data:** 05/11/2026. **Repositório canônico:** Vyzo-Studio/Vyzo_Academy.
**Origem da auditoria:** código da main, branch v12-auth-gateway-preproduction, testes GitHub Actions existentes, execução local anterior da V11 e novas verificações automatizadas da V13.
**Limite:** a navegação ao GitHub Pages pelo navegador de pesquisa não esteve disponível neste ambiente; confirmar implantação pela execução do GitHub Actions não equivale a clicar manualmente no domínio público.

## P0 — segurança e arquitetura
- **Rota de estudos pública:** o código clássico raiz, academy/v9.html e academy/demo.html ainda permite atividades de estudo sem sessão. Reproduzir abrindo a rota diretamente. Causa: frontend estático anterior à arquitetura cloud. **Estado: PENDENTE** até backend exclusivo Supabase, importação de histórico e autenticação real verificados. Não se deve bloquear a produção antes da recuperação de dados antigos.
- **Autenticação inexistente em produção:** academy/config.js não contém projeto exclusivo. Foram encontrados somente bancos de outros clientes em Supabase. **Estado: PENDENTE** de autorização, configuração Auth, SMTP, confirmação de e-mail e testes de duas contas com RLS. Nenhuma senha em texto puro foi criada.
- **Ramo V12:** proteção de sessão e migração consentida estão em v12-auth-gateway-preproduction; QA automatizado passou, mas testes de banco real e sincronização não foram realizados. Não confundir com recurso publicado.

## P1 — defeitos reproduzidos e corrigidos na branch V13
1. **Seleção por vírgulas**, academy/v9.mjs: o usuário precisava escrever a lista inteira. Corrigido com componente único src/subject-picker.js, busca sem acentos, chips removíveis, teclado, sugestões de referência e campo original sincronizado.
2. **Seleção por vírgulas**, academy/app.mjs: onboarding e formulário de prova exigiam texto separado por vírgula. Mesmo componente aplicado a campos novos/antigos, sem alterar o formato salvo no banco.
3. **Disciplina antiga em select longo**, src/app.js + src/template.html: o componente agora converte #cfg-subject em busca individual, preservando o valor esperado pelo motor legado.
4. **Composição enviesada**, academy/v9-core.mjs: rodízio por tópicos, sem cotas. Nova composição por quatro áreas. Para 30 itens, 8/8/7/7; para 20, 5/5/5/5; para 40, 10/10/10/10. Se faltarem itens, bloqueia em vez de trocar silenciosamente de área.
5. **Idioma estrangeiro**, academy/v9.mjs e v9-core.mjs: inglês/espanhol agora têm seleção explícita, filtragem do idioma não escolhido e blueprint por avaliação.
6. **22 itens visuais antes omitidos**, academy/v9-core.mjs: retirada a exclusão geral; verificação do tipo e reaproveitamento de renderFigure do simulador clássico, incluindo tabelas, SVG e descrições.
7. **Prévia da prova**, academy/v9.mjs: número de itens e cotas gerados pelo mesmo algoritmo determinístico antes de iniciar; blueprint de IDs salvo com avaliação.
8. **Relatório por área**, academy/v9-core.mjs / v9.mjs: acertos, respondidas e em branco por área, sem declarar domínio por apenas um acerto.

## P2 — UX e acessibilidade
- O seletor suporta pesquisa por prefixo e texto livre, alias Português/Língua Portuguesa, Matemática e Física, remover chip, selecionar recomendações em um clique, limpar, focar e confirmar.
- Opções usam combobox/listbox, navegação por setas, Enter, Esc e Backspace; sugestões limitadas a oito do catálogo mais opção personalizada.
- Preservação das entradas originais permite compatibilidade de formulários e dados antigos, sem migração destrutiva.
- Layout mobile, foco visível e modo escuro foram incluídos em CSS independente.
- Menus de versão, unificação completa de navegação e revisão dos controles de matérias nos editores de plano ainda exigem implantação de um workspace único autenticado.

## Qualidade educacional
- **224 questões autorais preservadas; 72 legadas preservadas**.
- As quatro áreas contêm respectivamente 52 Linguagens, 52 Humanas, 52 Natureza e 68 Matemática.
- **22 itens com material visual**, todos mantidos e estruturalmente reconhecidos pelo renderizador existente.
- Auditoria anterior sinalizou **22 grupos / 144 questões com enunciados repetidos ou semelhantes**. Isso não equivale a 144 gabaritos errados. Revisão editorial de alternativas, raciocínio e cálculos permanece necessária antes de substituir itens. Nenhum ID de questão foi excluído, reescrito ou inventado.
- Falta calibragem psicométrica TRI e banco suficientemente profundo de idiomas estrangeiros. Não se deve afirmar nota oficial.

## Testes e rastreabilidade
- tests/qa.mjs, scripts/build.py --check, tests/v9_core.test.mjs, tests/v13_composer.test.mjs.
- testes browser V6, V8 (backend simulado), V9, V10 (pesquisa simulada), V13 autocomplete, V13 avaliação 30 questões.
- Cenários de 10/20/30/40/50 itens; modo 1º/2º dia, área/disciplinas, línguas, blueprint, imagens, recuperação, calendário compartilhado.
- Verificar execução específica da branch antes de declarar aprovado. Os testes existentes não são demonstração de Auth real.
- **Arquivos novos:** src/subject-picker.js, src/subject-picker.css, academy/v11-composer.mjs, academy/v11-visual.mjs, testes V13.
- **Alterados:** src/template.html, index.html, academy/index.html, academy/app.mjs, academy/v9.html, academy/v9.css, academy/v9.mjs, academy/v9-core.mjs e regressões.

## Pendências / decisões
1. Integrar Supabase exclusivo, testar políticas RLS com duas identidades, login obrigatório e migração para cloud (P0).
2. Revisar editorialmente 144 itens sinalizados e enriquecer matérias pouco representadas (P1).
3. Integrar listas reais de matérias de editais após pesquisa oficial com backend autenticado (P1).
4. Avaliar seletor no editor manual de tarefas quando existir edição curricular no workspace cloud (P2).
5. Homologar acessibilidade com leitor de tela real, instalação/offline PWA e navegação no domínio de produção após merge (P2).

**Não declarar V13 plenamente implantada enquanto testes e publicação da main não forem confirmados.**
