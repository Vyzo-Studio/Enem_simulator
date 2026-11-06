# VYZO ACADEMY — V15.0: primeira entrega incremental

**Em desenvolvimento:** `feat-v15-universal-pathways` — não equivale a lançamento universal nem a integração de contas.

## Base confirmada
A V14 foi integrada à `main` no commit `7eb55813060a5fad6fce6ac9e5a96dcccc45bafa`, com testes GitHub Actions e implantação GitHub Pages aprovados. A branch `backup-before-v15-universal-education` preserva esse estado.

## Implementações V15
- Catálogo de percursos: escola, melhoria de notas, ENEM, vestibular, concursos, certificações e outros objetivos.
- Seleção de Ensino Fundamental I (1º–5º ano), Fundamental II (6º–9º ano) e Ensino Médio (1º–3º ano) no questionário e na edição de objetivos. O formulário escolar não exige órgão, banca ou cargo.
- Compatibilidade com esquema de backup local `schema:9` e histórico de alterações no conteúdo curricular.
- **Bloqueio de segurança:** a base de questões autorais existente é orientada ao ENEM. Não gerar diagnósticos escolares com ela, nem quando um objetivo legado estiver marcado como provisório. Os dados escolares são de configuração, **não** uma promessa de diagnóstico ou BNCC por série já validado.
- Acervo de provas anteriores: acesso ao índice oficial do Inep com escolha de ano (1998–2025). O vínculo leva ao índice oficial, não a um PDF direto nem a uma prova convertida automaticamente.
- Autocomplete instantâneo local do ENEM a partir de um perfil público conhecido, sem chamada paga a IA, sem inventar datas, editais ou bancas. Outras provas ainda exigem entrada manual ou serviço seguro V10.
- Componentes condicionais para que o estudante escolar não veja campos voltados a concursos.
- Testes por perfis de 3º ano do Fundamental I, 7º do Fundamental II e 2º do Ensino Médio; revisão de série com preservação do histórico; acervo oficial; regressões antigas V9, V10, V13 e V14.

## Cobertura real
| Segmento | Seleção de etapa/ano | Questões específicas validadas | Diagnóstico específico |
|---|---|---|---|
| Fundamental I | Implementada | Não disponíveis | Bloqueado |
| Fundamental II | Implementada | Não disponíveis | Bloqueado |
| Ensino Médio escolar | Implementada | Não disponíveis por série | Bloqueado |
| ENEM | Sim | Banco autoral pré-existente | Disponível na jornada local |
| Vestibulares e concursos | Tipo e campos manuais | Sem banco validado por edital | Apenas modo provisório já existente, explicitamente identificado |

## Serviços pendentes e bloqueios
- Cadastro obrigatório, confirmação de e-mail, recuperação de senha, sincronização em nuvem, isolamento real entre contas: **não operacionais**; dependem de Supabase dedicado e testes completos com duas contas. A branch `v12-auth-gateway-preproduction` não foi implantada.
- Pesquisa real por IA e de edital, comparação de edições, OCR de PDFs, tutor VYZO, correção de redação por IA e notificações: **não operacionais** sem backend e provedores verificados.
- BNCC detalhada por código de habilidade, conteúdos infantis revisados, questões de 1º a 9º anos, sistema de professores e responsáveis, extração de provas históricas: **não implementados**.
- A seleção da etapa escolar **não informa a idade da pessoa** nem comprova consentimento de responsáveis. Antes de oferecer cadastro ou conteúdo destinado a crianças, revisar e implantar mecanismos de proteção, privacidade e autorização legalmente adequados.

## Fontes oficiais consultadas
- Inep — Provas e gabaritos do ENEM: https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos
- ANPD — ECA Digital: https://www.gov.br/anpd/pt-br/assuntos/eca-digital/
- ANPD — Orientações preliminares sobre aferição de idade: https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-publica-orientacoes-preliminares-e-cronograma-para-afericao-de-idade-no-ambiente-digital
- Lei nº 15.211/2025: https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15211.htm

## Regras de promoção
Não publicar a V15 sem passar em todas as regressões e sem avaliar o impacto de uma experiência direcionada a menores, inclusive a incidência do ECA Digital. Não publicar formulários de conta, dados pessoais de crianças, upload de documentos ou tutor com IA sem controles técnicos e organizacionais reais. Nenhuma ação nesta etapa cria serviços pagos ou modifica projetos Supabase de clientes.

O relatório de CI do commit final deve ser consultado antes de considerar a V15 validada.
