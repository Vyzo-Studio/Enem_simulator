# Auditoria e testes — ENEM Intelligence v3

**Data:** 04/11/2026  
**Base preservada:** v2, commit `35ea3878e973c50d48941fee767a4e67150195fa`, branch de segurança `backup-enem-v2-nov2026`.

## Testes estáticos executados

Comandos:

- `node tests/qa.mjs`
- `python3 scripts/build.py --check`
- `node --check src/app.js`
- `node --check src/mentor.js`

**Resultado local:** passaram. O QA verifica a sintaxe dos módulos e a integridade do HTML compilado, 64 itens autorais, 72 itens legados, diversidade visual, integridade básica dos gabaritos e estruturas de persistência e migração.

## Testes reais de navegador

**Ambiente:** Chromium disponível no container, Playwright Python, DOM real usando `page.set_content`. Como as rotas locais/externas estão bloqueadas nesse ambiente, o armazenamento `localStorage` foi simulado através de uma implementação JavaScript em memória, preservada entre duas páginas para testar retomada. Isso **não comprova** funcionamento do armazenamento real em todos os navegadores ou origens.

**Fluxos com resultado satisfatório:**

1. Abertura da interface, console sem erros.
2. Cadastro inicial em quatro etapas, salvamento de campos, conclusão.
3. Explorador com colagem de trecho e reconhecimento indicativo de matérias.
4. Aula de um assunto, conclusão e criação de agenda de revisão.
5. Flashcard: revelar resposta, marcar lembrança e agendar revisão.
6. Oficina de redação: digitar, salvar versão e sortear outro tema.
7. Configuração de simulado com quatro questões, início e registro de respostas.
8. Navegação entre questões preservando as alternativas.
9. Exportação de backup JSON com prova em andamento.
10. Reinicialização em outra página a partir do estado salvo, com questões e respostas intactas.
11. Confirmação de finalização, cancelamento sem perda de respostas.
12. Finalização definitiva, correção e histórico.
13. Verificação de que os novos dados do mentor sobreviveram à retomada.
14. Criação de backup de recuperação pré-finalização.
15. Geração de plano de 7 dias após diagnóstico e abertura da aula correspondente.
16. Navegação mobile a 390 px sem rolagem horizontal indevida.

**Não foram testados** em todos os navegadores/dispositivos físicos, nem o funcionamento de uma API de IA ou pesquisa online — tais serviços ainda não existem na aplicação.

## Decisões de preservação

- `STORE = 'enem-intelligence-v2'`: mantido.
- Compatibilidade de `enem-intelligence-v1` e banco legado preservada.
- `schema: 2` mantém formato v2 e inclui campo independente `mentor.version=1`.
- Importação JSON importa também `mentor`, sem apagar esse campo ao ler backups antigos que não o contêm.
- Prova em andamento não é descartada ao navegar para outra seção.
- Antes de corrigir, é gravado um snapshot adicional, caso o browser permita.

## Limitações abertas

Pesquisa dinâmica de editais, extração PDF no navegador, API do YouTube, IA conversacional, correção automática de redação, banco de concursos por banca, backup na nuvem, execução em 100% dos navegadores e classificação das provas oficiais ainda dependem de trabalho e infraestrutura adicionais. Nenhuma dessas integrações foi apresentada como concluída.

**Implantação:** status final deve ser confirmado pelas execuções reais de GitHub Actions após o commit v3; testes locais não equivalem a publicação pública.


## V4 — Testes de não repetição e navegação (04/11/2026)

- Banco ampliado: 208 questões autorais e 72 legadas para recuperação; checagens de sintaxe, alternativas distintas, IDs e gabaritos válidos, recursos visuais e consistência do HTML com os fontes.
- Teste local em Chromium/Playwright: seleção 10–100 por dez; primeiro simulado de 100 itens; marcação, navegação, salto para pendente e para número; exportação de backup; recuperação em nova sessão com respostas e posição intactas; confirmação/cancelamento da finalização; correção e histórico.
- Segundo simulado de 100 itens realizado sem qualquer ID repetido do primeiro. Com 7 restantes, novas provas de 10+ são bloqueadas, sem preenchimento por repetições. Importar um backup antigo não diminuiu o conjunto de IDs já vistos.
- Verificação de barra mobile e ausência de rolagem horizontal indevida em 390 px. Testes no Chromium não equivalem à garantia de funcionamento em todos os dispositivos; não há sincronização automática entre navegadores e o banco permanece finito.


## Testes de cronômetro e contagem regressiva — 04/11/2026

- Alternância de modos na configuração, com duração exibida só no modo regressivo.
- Cronômetro crescente continua ativo após 4 horas simuladas; duração real armazenada após finalizar.
- Regressivo encerra automaticamente após prazo; a resposta marcada é preservada, as demais ficam em branco.
- Prova com prazo expirado e recuperada em nova sessão é automaticamente corrigida.
- Testes executados no Chromium/Playwright, mais verificação do HTML gerado e análise estática.
- Persistência continua no navegador; backups JSON são recomendados.


## V5 — relatório de testes locais e atualização UX (04/11/2026)

- Código modular validado com Node.js; bundle reconstruído idêntico à distribuição HTML.
- Responsividade reproduzida em Chromium em 320, 390, 768, 1024 e 1440 px: sem rolagem horizontal nas telas Home e Configuração.
- Prova mobile em 390 px: pergunta antes do mapa; gaveta do mapa abre e fecha; respostas salvas; retomada da prova ao remontar a página; finalização e correção exibidas.
- Navegação principal e secundária preservada, com menu mobile e indicador de seção.
- Redação: rascunho do editor antigo mantido; conteúdo da oficina arquivado como versão antes do sorteio de outro tema.
- Backup importado em modo mesclagem: prova atual, gabarito, histórico, rascunho e prova importada preservados.
- Conflito de armazenamento entre abas: bloqueio de escrita na cópia antiga, sem sobrescrita do estado persistido.
- Testes Chromium executados com documento `page.set_content` e armazenamento local emulado; não são validação em dispositivo físico.
- Limitações ainda existentes: sem backend de IA/redação, sincronização remota ou auditoria WCAG conclusiva.


## V6 — Resultados da regressão

PASSARAM em Chromium: simulado, restauração de respostas com armazenamento simulado, expiração do prazo com modal aberto, JSON inválido rejeitado, histórico acima de 150 itens, filtro no mapa, atalhos, fonte persistente, timer de estudo e responsividade de 320–1440 px. Node e build QA passaram localmente. O sandbox bloqueou localhost, portanto a persistência foi simulada; não houve teste em Safari ou PWA no endereço público.
