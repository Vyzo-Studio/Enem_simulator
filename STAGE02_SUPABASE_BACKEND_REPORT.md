# VYZO ACADEMY — Stage 02: backend dedicado (07/11/2026)

## Infraestrutura efetivamente provisionada
- Supabase **Vyzo_Academy**: project ref `iaxujxdqeymvxfvmioum`; organização `Santomen Barbearia` (a identidade da organização é herdada da conta conectada, **não** significa compartilhar banco), região `sa-east-1`, Postgres 17, status `ACTIVE_HEALTHY`.
- Cotação específica da criação: **US$ 0/mês** de custo de novo projeto, aceita antes de provisionar. Demais limites de uso do plano Free continuam aplicáveis.
- Supabase principal (`Vyzo_std`): **Haus_Barber** e **GNG Barbearia** não foram modificados.
- Projeto antigo `Santomen_Barbearia` (`whsitzmpotmhbyqpeimh`) continua **INACTIVE**: o plugin conectado não oferece exclusão de projetos. **Não afirmar exclusão**. Remover pelo Dashboard se desejado, após qualquer backup necessário.
- Nenhuma chave de serviço, senha, token, configuração de login ou URL do projeto foi adicionada ao código frontend. `academy/config.js` continua vazio.

## Migrações aplicadas no projeto dedicado
| Ordem | Migração remota | Código-fonte |
|---|---|---|
| 1 | `vyzo_academy_v8_base` | `supabase/migrations/202611050001_vyzo_academy_v8.sql` |
| 2 | `vyzo_academy_exam_research` | `supabase/migrations/202611050002_vyzo_academy_research.sql` |
| 3 | `vyzo_academy_v12_storage` | `supabase/migrations/202611050003_vyzo_academy_v12.sql` |
| 4 | `stage02_normalized_backend_rls` | `supabase/migrations/202611070001_stage02_normalized_backend.sql` |
| 5 | `stage02_security_hardening` | `supabase/migrations/202611070002_stage02_security_hardening.sql` |

Observação: a ferramenta remota gera timestamps de histórico de migrações próprios; os nomes e arquivos acima correspondem ao conteúdo aplicado, mas a sincronização com CLI `supabase migration list` deverá considerar os timestamps remotos.

## Arquitetura
- Identidade: `auth.users` do Supabase; perfis em `academy_profiles`.
- Objetivos: `academy_goals` e disciplinas normalizadas em `academy_goal_subjects`.
- Avaliações: legado `academy_diagnostics`; novas `academy_assessment_sessions`, `academy_assessment_answers` (IDs de questões como texto, sem alterar banco ENEM).
- Plano: `academy_study_tasks` compatível com legado; novas `academy_study_plans`, `academy_plan_tasks`.
- Histórico e revisão: `academy_study_sessions`, `academy_activity_history`, `academy_revision_items`, `academy_private_records`, `academy_legacy_imports`.
- Redações: `academy_essays`.
- Pesquisa: `academy_research_requests`, `academy_exam_catalog` (somente conteúdo humano verificado pode ser lido por usuário autenticado).
- Reservas de schema fechadas, sem permissão `anon` ou `authenticated`: `academy_curriculum_catalog`, `academy_ai_audit_queue`, `academy_guardian_permissions`. Não foi publicado conteúdo escolar, IA ou gestão de responsáveis.

## Garantias de segurança
- **20/20** tabelas academy têm RLS habilitada. **63** políticas ao todo; tabelas reservadas têm **zero políticas por decisão de negar acesso**.
- **Zero permissões SELECT para `anon`** sobre tabelas academy; zero permissões para `authenticated` nas três reservas fechadas.
- `SELECT`/`INSERT`/`UPDATE`/`DELETE` das tabelas privadas aplicam `auth.uid()=user_id`, rejeitando token `is_anonymous=true`.
- UPDATE valida o proprietário anterior e posterior; chaves estrangeiras compostas impedem apontar registros filhos para dados de outro aluno. Histórico/revisão também exige mesma associação sessão/objetivo.
- Sem tabelas de senha; nenhuma migração é destrutiva; dados existentes do projeto estavam vazios.

## Testes REALMENTE executados no PostgreSQL remoto, em transações revertidas
- `tests/stage02_rls_live.sql`: PASS — login lógico A e B em contextos separados, SELECT isolado de goals/answers/plans, UPDATE e mudança de titularidade proibidos, FKs de sessão/resposta/tarefa bloqueiam referências cruzadas, acesso sem login negado e JWT anônimo autenticado bloqueado.
- `tests/stage02_nested_integrity_live.sql`: PASS — CRUD completo de registros próprios, DELETE de B contra A sem efeito, histórico e revisões não podem apontar para sessão de outro objetivo do mesmo aluno.
- Conferência final: **0** contas de teste no Auth, **0** objetivos, sessões, respostas, conteúdos curriculares e permissões de responsáveis permanentes.
- Análise Supabase: alertas de índices de chaves estrangeiras e de init-plan RLS corrigidos em `202611070002`. Avisos remanescentes informativos: índices não utilizados em banco vazio e três tabelas intencionalmente sem políticas.

## Escopo e próximas dependências
- **Não** foi implementada nem publicada interface de login (Stage 03).
- Não foram feitas verificações de entrega de email, sessões reais assinadas/validação JWT via HTTP, testes de apps em dois dispositivos nem homologação jurídica para menores: dependências antes de contas públicas.
- O banco recém-criado foi testado com contextos de JWT simulados por `SET LOCAL ROLE authenticated`; isso verifica RLS SQL real, **não** constitui teste Auth end-to-end.
- Região/projeto/organização e separação entre clientes estão confirmados; projeto antigo Santomen deve ser excluído manualmente, pois o conector não oferece `delete_project`.
- Revisar limites/cotas do plano Free e controles de Auth antes de produção.

## Fontes de verificação
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Índices de FK: https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys
- Segurança das tabelas bloqueadas: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy
