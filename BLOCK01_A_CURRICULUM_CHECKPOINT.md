# BLOCO 01 — SUBETAPA A: ARQUITETURA CURRICULAR
**Data:** 07/11/2026  
**Ramo isolado:** `feat-block01-a-curriculum-taxonomy`, criado a partir do `main` estável `3efa738a0417910f17afe5a5317993afb88763f6`.  
**Escopo único:** hierarquia curricular e navegação sem publicar aulas, diagnósticos escolares ou provas oficiais interativas.

## Situação anterior verificada
- `main` já possui a estrutura de objetivos V15 para Fundamental I, Fundamental II, Médio e ENEM, com backup local V9 (`vyzo-academy-v9-guest-1`, `schema:9`) e banco de questões ENEM isolado do escolar.
- A Etapa 03 de autenticação permanece no PR #8, **draft e não incorporado ao `main`**. Nenhum código de Auth/Supabase foi modificado nesta subetapa.
- `feat-v15-1-school-pilots` é rascunho com conteúdo em revisão. **Nenhum material da V15.1 foi publicado**.

## Fontes oficiais verificadas
1. Ministério da Educação, BNCC Ensino Fundamental, PDF oficial: https://basenacionalcomum.mec.gov.br/images/BNCC_EI_EF_110518_versaofinal_site.pdf . No documento: organização dos componentes no diagrama da estrutura (p. 27) e Matemática 3º ano, unidade temática Números / problemas de adição e subtração (pp. 284–285). Código `EF03MA06` confirmado na p. 285. **O registro contém uma descrição resumida autoral e a referência; não é uma aula ou questão validada.**
2. Portal oficial BNCC, Ensino Médio (2018): https://basenacionalcomum.mec.gov.br/ .
3. Lei 9.394/1996, artigo 35-D, redação Lei 14.945/2024; áreas e componentes do Ensino Médio: https://legis.senado.gov.br/norma/551270/publicacao/34619663 . **As competências `EM13` são da etapa, não necessariamente de um ano específico.**
4. Inep, Matrizes de Referência do ENEM, publicação de 17/07/2026: https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/matrizes-de-referencia-enem . É uma matriz de avaliação, **não** currículo de uma série escolar.

## O que foi implementado
- `academy/curriculum-taxonomy.mjs`: versão `2026.11-A1`, hierarquia estável **Etapa → Ano/Série → Disciplina/Área → Tópico → Subtópico → Habilidade**.
- 5 anos do Fundamental I, 4 do Fundamental II, 3 séries do Ensino Médio e uma matriz geral de ENEM. IDs determinísticos. Não há "ano" do ENEM.
- Componentes curriculares conforme estágio: Inglês somente a partir do 6º ano no Fundamental, Ensino Religioso listado como matrícula facultativa. Ensino Médio distribuído em áreas/componentes com ressalva de organização por série; Redação é separada como componente da prova ENEM, não área BNCC independente do Médio.
- Metadados por fonte/versionamento/página e status **sem_material_aprovado**. Um único agrupamento representativo foi catalogado: 3º ano do Fundamental I, Matemática, unidade temática Números, problemas de adição/subtração, habilidade `EF03MA06`, **sem questões, microaulas ou diagnósticos publicados**.
- `academy/v15-pathways.mjs`: `schoolSubjects(stage, year)` filtrado conforme série; chamada antiga sem ano permanece compatível com o comportamento prévio.
- `academy/v9.mjs`: no formulário de **Prova escolar**, a seleção em texto livre foi substituída por checkboxes por ano, com revalidação no salvamento. Mudanças de etapa/ano atualizam as opções; dados escolares anteriores não são alterados até salvar explicitamente. Outros tipos (ENEM, concursos, vestibulares) mantêm a entrada anterior.
- `academy/curriculo.html`, `curriculo.mjs`, `curriculo.css`: navegador público de referência com filtros etapa/ano/disciplina, descrição de habilidades verificadas, situação editorial e links oficiais. Links de acesso adicionados ao V9 e ao portal V8.
- Nenhum identificador de questão existente, backup local ou tabela do Supabase foi modificado.

## Garantias de qualidade
- `tests/curriculum_taxonomy.test.mjs`: etapas, séries, disciplinas, IDs, fontes oficiais, skill `EF03MA06`, exclusão de Inglês no Fundamental I, compatibilidade V9 e bloqueio de questões escolares sem conteúdo.
- `tests/curriculum_browser.py`: navegação Chromium em larguras 320/390/1024, status de material não publicado, todas as etapas e filtros de componentes.
- `tests/v9_browser.py` adapta seu fixture para importar o módulo curricular sem colisão com variáveis de testes legados; `tests/v15_browser.py` é atualizado para os controles de disciplinas por série.
- Workflow `.github/workflows/pages.yml` executa os novos testes além de toda a suíte existente.

## Próximo lote (somente após concluir esta subetapa)
**Subetapa B:** iniciar o piloto editorial 3º ano do Fundamental I, Matemática, habilidade EF03MA06. Avaliar rigorosamente o conteúdo já existente *somente como rascunho*, revisar teoria, exemplos, questões, gabaritos, explicações e QA pedagógica antes de publicar qualquer material. Não copiar conteúdo da V15.1 sem revisar e verificar.

**Escopo proibido nesta etapa:** cadastro de menores, alterações no login, sincronização e banco, motor de avaliações, provas oficiais PDF convertidas e geração massiva de exercícios.
