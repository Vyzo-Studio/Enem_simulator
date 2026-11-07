# VYZO ACADEMY — BLOCO 03, SUBETAPA A · UNIDADE 01
## Navegação inclusiva e responsiva no percurso V9

**Data:** 07/11/2026  
**Base estável examinada:** `main` em `f046d9d70f11a2966c26eb2411064aaf5a5622a4`.  
**Branch:** `feat-block03-a-v9-navigation-a11y`.  
**PR:** https://github.com/Vyzo-Studio/Vyzo_Academy/pull/11

**Esta execução cobre uma unidade coesa da Subetapa A; não equivale à certificação completa de acessibilidade de todas as telas.**

### Situação do produto e limites reais

- A experiência V9 local está na `main`: cadastro de objetivos, navegação, diagnóstico, biblioteca, histórico de erros, revisões e backups no navegador.
- PR #8 (Etapa 03, login e sincronização) e PR #10 (Bloco 02/A, IA) ainda estão **draft, não incorporados**. O endpoint de IA implantado no Supabase não significa professor pronto, acessível ou habilitado.
- Painel administrativo e Professor VYZO **não estão em produção homologada**; não inspecionados aqui como se fossem telas publicadas.
- Subetapas B (QA máximo), C (piloto), D (hosting) e E (lançamento) **não iniciadas**.

### Problemas confirmados no código antes da mudança

1. Em viewport móvel, 11 seções V9 eram exibidas em uma barra horizontal deslocável, sem indicação evidente do conteúdo além da margem visível; descoberta de "Revisões", "Backup" e "Mapa curricular" era dificultada.
2. A aba ativa tinha classe CSS `.active`, mas não o atributo semântico `aria-current="page"`.
3. Trocar uma seção por botão de navegação não movia foco do teclado para o conteúdo novo.
4. No tema escuro, cor herdada do texto dos links da navegação era definida para fundo claro, comprometendo a leitura; faltava estado acessível do controle de tema.

### Mudanças implementadas

- `academy/v9.html`: botão `Ver todas as seções`, com `aria-controls` e `aria-expanded`; dica textual de rolagem no móvel; botão de tema com `aria-pressed`.
- `academy/v9.css`: menu expansível de baixo impacto no layout até 900px, que preserva a barra horizontal prévia quando recolhido. Conjunto completo de seções visível sob demanda; alvos de navegação com altura mínima de 44px; reforço do `:focus-within` em opções; cor de texto no tema escuro e foco visível; respeito a redução de movimento.
- `academy/v9.mjs`: abertura/recolhimento do menu; Escape devolve foco ao botão; troca de seção fecha menu e leva foco ao `h1`; indica a seção ativa com `aria-current="page"`; estado de tema sincronizado com `aria-pressed` e preferência local.
- Sem dependências adicionadas, sem modificação de conteúdo pedagógico, sem mudança de banco, sem API externa, sem alteração de estrutura ou dados guardados, sem mudança de IDs de questões.
- `.github/workflows/pages.yml` e `tests/block03_v9_a11y_browser.py`: teste real no Chromium em **320, 360, 390, 430, 768, 1024, 1440, 1920 px**.

### Verificações e critérios limitados

O novo teste automatizado verifica:
- botão de expandir menu e estado `aria-expanded` em mobile;
- Escape para recolher e retorno do foco;
- navegação para seção, `aria-current` atualizado e foco no primeiro `h1`;
- `aria-pressed` do tema;
- contraste computado ≥4,5:1 para o **texto padrão da navegação no tema escuro** contra seu painel, em cada largura;
- ausência de rolagem horizontal do documento no cenário de testes;
- preservação exata do objeto de progresso local V9 após trocar seção e tema;
- ausência de exceções JavaScript reportadas pelo navegador.

Não são verificados automaticamente contraste de **todos** os componentes, conformidade integral WCAG 2.2 AA, telas com conteúdo avançado/históricos grandes, todos os gestos de dispositivos móveis reais, leitores de tela reais, medições Lighthouse/LCP/CLS/INP, tempo de inicialização, performance de PWA, nem QA de produção com login.
A implementação considera WCAG 2.2 AA 1.4.3, 2.4.7, 2.4.11, 2.5.8 e 4.1.2, **sem alegar certificação**. Referência: https://www.w3.org/TR/WCAG22/

### Escopo pendente dentro da Subetapa A

- Auditar separadamente login/cadastro, onboarding, filtros de matéria, V8, simulador completo, histórico e redações, calendário e dashboard conforme se tornem homologados.
- Auditoria integral com ferramentas e validação humana, teclado e leitor de tela; estados de erro/formulários complexos e zoom de 400%; contraste de todos os campos, tabelas e figuras.
- Avaliação quantitativa de carregamento, imagens, cache, PWA e política de animações; decidir otimização sem comprometer dados.
- Não habilitar novos cadastros de menores, professor de IA ou painel administrativo por efeito destas alterações.

### Próximo checkpoint

Continuar **Subetapa A** com outro lote coeso de revisão das interfaces existentes (por exemplo, formulário e revisão do questionário e dos simuladores), ou aguardar integração segura da Etapa 03 antes de abordar login real. **Não iniciar a Subetapa B automaticamente**.
