# ENEM INTELLIGENCE — Simulador Digital (v2)

Uma plataforma educacional estática e responsiva para praticar questões autorais em formato de simulado, com **textos de apoio, gráficos, tabelas, diagramas, cinco alternativas, gabarito somente ao finalizar e correção comentada**.

> **Importante:** este site é um projeto independente. Não é produzido nem homologado pelo Inep. As 64 questões novas são autorais e contextualizadas; não se apresentam como questões oficiais. O percentual de acertos **não** corresponde a uma nota TRI.

## Funcionalidades implementadas

- Diagnóstico com questões das quatro áreas do ENEM.
- Prova de Linguagens + Humanas ou de Natureza + Matemática **em amostra**.
- Filtros por área, disciplina, assunto e língua estrangeira (Inglês/Espanhol).
- Navegação por número, avanço e retrocesso, itens pendentes e marcação para revisão.
- Contador de tempo decorrido; limite opcional com encerramento automático.
- Alternativas editáveis até a finalização, inclusive opção de deixar em branco.
- **Salvamento automático a cada resposta** no armazenamento local do navegador, com fallback para armazenamento da sessão.
- **Backup JSON durante a prova**; importação de arquivos para retomar o gabarito.
- Recuperação de uma prova antiga da chave `enem-intelligence-v1` quando ainda existir no mesmo navegador, utilizando o banco arquivado de 72 itens originais.
- Finalização por confirmação **dentro da própria página** (sem depender de `window.confirm`).
- Correção com gabarito, sua resposta, explicação, percentual de acertos sobre respondidas e cobertura.
- Histórico, acompanhamento por área, sugestões de revisão, rascunho de redação e modo escuro.
- Compatibilidade com desktop, celular e navegação por teclado.

## Site no GitHub Pages

O projeto é publicado automaticamente pelo workflow `.github/workflows/pages.yml`, **desde que o GitHub Pages esteja habilitado** no repositório.

Caso a página ainda não esteja disponível, abra **Settings → Pages → Build and deployment → Source → GitHub Actions**. Depois verifique a aba **Actions** e o resultado do fluxo “Quality checks and GitHub Pages”.

Endereço esperado quando o GitHub Pages estiver habilitado e a implantação terminar com sucesso:

`https://vyzo-studio.github.io/Enem_simulator/`

O endereço acima é um caminho previsto, não uma confirmação independente de que o serviço já está ativo.

## Segurança e recuperação de respostas

A aplicação não utiliza servidor ou conta. O histórico fica **apenas no navegador e dispositivo utilizados**. Fechar uma aba não apaga obrigatoriamente os dados armazenados, mas janela anônima, limpeza dos dados do site, bloqueio de armazenamento ou troca de dispositivo podem impedir a recuperação.

1. Durante a prova, use **Baixar backup (.json)** para obter uma cópia do seu progresso.
2. Ao reabrir a página no mesmo navegador, o sistema procura uma prova em andamento e a retoma com as respostas salvas.
3. Para outro dispositivo, use **Backup e dados → Importar backup**.
4. Provas antigas da v1 só poderão ser recuperadas se os dados da v1 ainda existirem no mesmo contexto de armazenamento. O aplicativo não inventa respostas perdidas.

## Estrutura do repositório

- `index.html` — **distribuição independente**: HTML, CSS e JavaScript em um único arquivo.
- `src/template.html` — estrutura HTML editável.
- `src/styles.css` — estilos.
- `src/questions.js` — banco novo de 64 questões autorais.
- `src/legacy.js` — banco anterior, preservado para resgate de provas antigas.
- `src/app.js` — navegação, simulado, persistência, correção, histórico e backup.
- `scripts/build.py` — reconstrói o `index.html` independente a partir de `src/`.
- `tests/qa.mjs` — valida sintaxe, integridade do bundle, banco de questões e módulos.
- `.github/workflows/pages.yml` — validação e deploy.

Para desenvolver:

```bash
python3 scripts/build.py
node tests/qa.mjs
python3 scripts/build.py --check
```

Os testes locais de fluxo com navegador também foram realizados antes da publicação: início, respostas, navegação, backup, recarregamento simulado, cancelamento da finalização, correção, histórico, plano, redação, temas, importação, layout mobile e recuperação legada.

## Limitações atuais

- O banco novo validado contém **64 questões**, com 16 por área (uma das questões de Linguagens é de Inglês e outra de Espanhol; a prova seleciona somente uma língua). Consequentemente, o modo por dia é uma **amostra**, não uma aplicação de 90 itens.
- Ainda não foi concluída uma classificação estatística questão a questão das cinco provas oficiais de 2021–2025.
- A redação oferece editor e orientações, mas não avaliação real por IA nem nota oficial.
- Não há sincronização em nuvem.
- Os dados de desempenho não são usados para calcular nota TRI oficial ou estimativas sem fundamento.
- As figuras são diagramas e gráficos originais gerados pela própria interface, não fotografias de provas anteriores.

Referências oficiais para estudo: [Provas e gabaritos do Inep](https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos).

---
**ENEM INTELLIGENCE** · Estude com estratégia. Evolua com inteligência.
