# Relatório de verificação — ENEM Intelligence v2
Data: 04/11/2026

## Escopo efetivamente testado
Testes locais automatizados com Chromium e Playwright, utilizando DOM real e armazenamento local simulado para validar fluxos do navegador. O ambiente de testes bloqueava navegação de rede/localhost; por isso, os testes foram feitos com a interface carregada por `page.set_content` e os mesmos módulos JavaScript/CSS distribuídos no arquivo publicado.

### Casos com resultado satisfatório
1. Renderização da interface e carregamento das 64 questões.
2. Seleção do diagnóstico e início da prova.
3. Registro da alternativa marcada.
4. Navegação entre questões sem perder as alternativas anteriores.
5. Download de backup durante a prova.
6. Reabertura do aplicativo com mesmas questões, respostas e posição.
7. Exibição da confirmação para finalizar (sem `window.confirm`).
8. Cancelamento da finalização e retorno ao gabarito.
9. Finalização e exibição da correção comentada.
10. Cálculo de acertos, erros e questões não respondidas.
11. Histórico preservado após reabertura.
12. Plano de estudos gerado a partir do histórico disponível.
13. Texto de redação salvo e recuperado.
14. Filtro específico por área.
15. Troca entre tema claro e escuro.
16. Importação de backup JSON.
17. Abertura do menu em tela pequena.
18. Detecção e recuperação de prova antiga simulada com IDs A001/A002.
19. Alteração de alternativa e marcação para revisar.
20. Remoção de resposta e contagem da questão como não respondida.
21. Seleção exclusiva de espanhol sem misturar questões de inglês.
22. Renderização de gráfico SVG.
23. Encerramento automático quando acaba o tempo definido.
24. Verificação de ausência de rolagem horizontal indevida em 390 px.
25. Revisão sintática com Node.js dos módulos JavaScript.
26. Integridade do bundle, 5 alternativas, gabaritos válidos, IDs únicos, equilíbrio 16/área e pelo menos 10 figuras — por testes estáticos.

## Confirmação no GitHub Actions
O job `quality` passou integralmente nas execuções verificadas de 04/11/2026.

## Limitações honestas
- A implantação pública no GitHub Pages **ainda exige ativação do Pages pelo proprietário**. O job de implantação falhou na etapa `configure-pages` com `Resource not accessible by integration`; não é falha dos testes nem do site.
- Os testes no navegador foram automatizados em Chromium; não foram executados em todos os navegadores e dispositivos físicos.
- O site tem 64 questões novas, não 180 questões oficiais; modos de ENEM por dia são amostras.
- Não foi realizado estudo estatístico exaustivo dos itens oficiais 2021–2025.
- Não há servidor de contas, sincronização de dados ou nota TRI oficial.
- Nenhum software pode garantir resgate de respostas se o próprio navegador não as armazenou, se dados do site forem apagados ou se houver troca de origem sem backup.

## Próximo passo de publicação
Em **Settings → Pages**, escolher **GitHub Actions** como fonte de implantação e reexecutar o fluxo **Quality checks and GitHub Pages** na aba Actions.
