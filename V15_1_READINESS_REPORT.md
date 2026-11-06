# VYZO ACADEMY — V15.1: matriz de implementação e prontidão

**Data de revisão:** 06/11/2026. **Repositório:** Vyzo-Studio/Vyzo_Academy.

**Produção:** `main`, commit `7eb55813060a5fad6fce6ac9e5a96dcccc45bafa` (V14), com Quality checks e GitHub Pages aprovados.  
**V15:** branch `feat-v15-universal-pathways` / PR #3 em rascunho, commit-base `f4d41b38ed3796c1f82b1968a7f03905b5c4c443` com Quality checks aprovados.  
**V15.1:** branch `feat-v15-1-school-pilots`; ponto de recuperação `backup-before-v15-1-pilot-curriculum`. Desenvolvido sobre a V15, **não publicado na produção**.  
**V12:** código pré-produção preservado e copiado para a V15.1, ainda desativado.

## Matriz de requisitos versus estado real

| Requisito | Categoria | Evidência / limite |
|---|---|---|
| Manter V8/V9/V10/V13/V14/V15 e dados anteriores | Implementado e testado com regressões locais | Suíte GitHub Actions; novos campos opcionais no JSON V9, sem alterar schema 9, IDs originais nem migração de históricos |
| Escolarização Fundamental I/II/Médio por série | Implementado e testado na V15 | `v15-pathways.mjs`, `tests/v15_browser.py` |
| Três tópicos-piloto de Matemática | Implementado, matematicamente testado; **ainda não homologado editorialmente** | `v15-school-content.mjs`, `v15-school-engine.mjs`, 18 exercícios, duas explicações resolvidas por piloto |
| Diagnóstico de toda uma série escolar | Bloqueado por validação de conteúdo | Microatividades por tópico **não equivalem** a currículo completo |
| Gabaritos matemáticos dos pilotos | Implementado e testado automaticamente | 18 resultados recalculados, unicidade e opções distintas; ainda depende de revisão humana |
| Códigos BNCC e matriz oficial completa | Parcialmente implementado | EF03MA06, EF07MA08, EM13MAT302 ligados a fontes públicas; **não há espelhamento integral da BNCC nem homologação pedagógica** |
| Conteúdo adaptado à idade | Parcialmente implementado | Microaulas curtas e controle legível; sem pesquisa de compreensão com usuários menores |
| Salvamento, retomada e histórico escolar | Implementado e testado **apenas localmente** | `schoolActivityDrafts`, `schoolActivityHistory` opcionais no backup V9 |
| Resultados sem erros para itens em branco | Implementado e testado | `gradeSchoolPilot` contabiliza `blank` separado; sem declarar domínio |
| Recomendação escolar no painel | Implementado e testado com dados simulados no navegador | Atividade real do piloto, last report, passos sugeridos; não substitui plano amplo |
| Questões originais ENEM e provas clássicas | Preservadas | 224 originais e 72 legadas descritos na auditoria V13; 144 itens / 22 grupos demandam curadoria |
| Provas anteriores oficiais | Parcialmente implementado | Dois cadernos ENEM 2024 e seus gabaritos, links no índice do Inep; PDFs não foram extraídos |
| Provas oficiais convertidas em simulados | Não implementado; bloqueado por validação de extração e direitos | Nenhum PDF tratado como questão interativa |
| Pesquisa instantânea por nome | Parcialmente implementado | Catálogo local apenas do ENEM; sem busca atualizada de editais |
| Pesquisa por IA, extração de edital e PDFs | Bloqueado por infraestrutura | V10 Edge Function preparada, serviço não ativo nem credenciado |
| Professor VYZO com IA | Bloqueado por infraestrutura, custos e segurança de menores | Sem backend autenticado e provedor configurado |
| Autenticação de conta V12 | Código preparado; bloqueado por infraestrutura | Núcleo, gateway fail-closed, SQL e testes simulados preservados; **não ativado** |
| Email de confirmação e recuperação em produção | Bloqueado por infraestrutura | Não há Supabase exclusivo ou SMTP operacional |
| Isolamento de duas contas reais por RLS | Não verificado; bloqueado por infraestrutura | SQL revisável e testes estáticos apenas; sem testes de BD A/B |
| Nuvem, offline sync e recuperação em outro aparelho | Não implementado; bloqueado por infraestrutura | Somente armazenamento local e backup JSON |
| Cadastro de crianças, idade e responsáveis | Bloqueado por revisão jurídica/privacidade | Série escolar **não comprova idade**; sem coleta de documentos de identidade |
| Exclusão de conta e retenção | Bloqueado por infraestrutura e revisão legal | Não anunciar até implementar backend e processo apropriado |
| Base relacional curricular versionada | Proposta técnica não aplicada | `supabase/proposals/v15_1_curriculum_model.sql`; RLS condicional, owner, status editorial; não é migração executada |
| Acessibilidade WCAG 2.2 AA | Parcialmente implementada | Controles, foco, campo semântico, largura mobile; falta homologação com leitores de tela e usuários reais |
| QA em produção | Não verificado | Chromium em fixtures locais; CI não é navegação manual no domínio de produção |

## Conteúdo escolar produzido para revisão editorial

| Etapa | Série selecionada no produto | Tema único disponível | Referência | Itens autorais |
|---|---|---|---|---|
| Fundamental I | 3º ano | Adição e subtração em problemas | EF03MA06 | 6 |
| Fundamental II | 7º ano | Comparação de frações | EF07MA08 | 6 |
| Médio | 2º ano | Modelagem com função afim | EM13MAT302 | 6 |

**Limite pedagógico:** códigos alinhados com referências públicas, mas o corpus autoral está `em_revisao`. Nenhum conjunto de 6 itens serve para inferir domínio pleno da habilidade ou anunciar a série como suportada. A BNCC atribui EM13MAT302 ao Ensino Médio como etapa, não especificamente ao segundo ano.

Cada microaula possui: tópico, subtema, objetivo, referência, explicação, dois exemplos resolvidos, resumo, seis exercícios, resolução de cada item, registro de rascunho, relatório e história de tentativas. A interface avisa sobre o estado editorial.

**Fontes curriculares de referência:**
- EF03MA06: https://www.referencialcurriculardoparana.pr.gov.br/Matematica-3o-Ano
- EF07MA08: https://www.referencialcurriculardoparana.pr.gov.br/Matematica-7o-Ano
- EM13MAT302: https://site.seduc.se.gov.br/redeEstadual/escolaDisciplinaDetalhes.asp?cdComponente=1258&cdTurma=114359
- Portal nacional da BNCC: https://basenacionalcomum.mec.gov.br/

## Catálogo de provas históricas

Fonte do índice Inep: https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem/provas-e-gabaritos/2024

Duas provas regulares 2024 com link individual para caderno e gabarito correspondente (1º dia Azul 1, 2º dia Azul 7); metadados marcados como `vinculado_no_indice_oficial`, e `contentsReviewed:false` e `interactiveReady:false`. A tentativa de acessar os PDFs retornou erro 502 no ambiente de verificação. Isso **não prova** erro nos links externos, apenas impede afirmar que os arquivos foram lidos.

## Auth, infraestrutura, segurança e custos

A conexão Supabase principal exibe exclusivamente dois projetos de clientes: `Haus_Barber` e `GNG Barbearia`. O usuário também tem uma conexão `santomen` separada, que **não** pode ser reaproveitada. Organização principal no plano Free e sem projeto dedicado Academy. O plano Free possui limite de projetos ativos; Pro começa em US$ 25/mês, mais uso e recursos variáveis. Não criar serviço cobrado sem aprovação, nem usar um banco de clientes.

Arquivos da V12 trazidos sem ativação:
- `academy/v12-auth-core.mjs`, `academy/v12-entry.mjs`, `academy/v12-entry.html`
- `supabase/migrations/202611050003_vyzo_academy_v12.sql`
- `tests/v12_auth.test.mjs`, `tests/v12_browser.py`
- `V12_PREPRODUCTION_REPORT.md`

O SQL de currículo V15.1 é **proposta, não migração aplicada**. Contém esquema normalizado, versões imutáveis, RLS para dados de aluno, leitura de conteúdo somente após validação/publicação editorial. A verificação estática de strings **não testa execução do PostgreSQL nem isolamento real**.

**Obrigatório antes de produção para menores:** revisar LGPD, ECA e ECA Digital, orientação da ANPD sobre aferição de idade, controles de responsáveis quando exigidos, tratamento mínimo, segurança de links, política de retenção/eliminação e revisão de experiências educacionais. Não inferir idade da série.

Fontes:
- https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15211.htm
- https://www.gov.br/anpd/pt-br/assuntos/eca-digital/
- https://supabase.com/pricing

## Testes automatizados criados ou ampliados

- `tests/v15_1_school_core.test.mjs`: 18 cálculos e distratores, habilidades, versão, proteção ENEM, nenhuma classificação de domínio, relatórios e catálogo 2024.
- `tests/v15_1_schema.test.mjs`: **inspeção estática** de constraints de versionamento e RLS; não executa PostgreSQL.
- `tests/v15_browser.py`: Chromium 320, 390 e 768 px, onboarding de três séries, 6 questões por tema, autosave, 1 acerto/1 erro/4 em branco, retomada, relatório, dashboard com dados, alteração de série, histórico preservado, séries sem conteúdo bloqueadas e documentos Inep.
- `tests/v12_auth.test.mjs` e `tests/v12_browser.py`: antigas verificações V12 restauradas e habilitadas na CI; autenticação simulada e fail-closed sem backend.
- Suíte histórica mantida: QA do banco, build, browser clássico, V8, V9, V10, V13, V14 e V15. O resultado válido é o do **último commit**, não o de uma execução anterior.

## Critérios para promover a V15.1

1. Última workflow completa aprovada, com commit final registrado.
2. Auditoria pedagógica humana dos 18 exercícios e fontes; checagem de idade, linguagem, escopo e direitos.
3. Revisão jurídica e de segurança apropriada aos segmentos escolares; manter o login V12 desativado.
4. Conferência do site com navegador real após merge e deploy, com acessibilidade e backup/restauração.
5. Nenhuma alegação de IA real, nuvem, edição oficial de provas ou série inteira validada.

**Recomendação técnica:** manter PR V15.1 em rascunho sobre a branch V15 até o item 2 e item 3 serem aprovados. Fazer a integração de Supabase dedicado em PR posterior, só com consentimento/autorizações e teste RLS entre contas A/B reais.
