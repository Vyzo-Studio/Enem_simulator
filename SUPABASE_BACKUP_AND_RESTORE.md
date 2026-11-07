# VYZO ACADEMY — BACKUP E RESTAURAÇÃO EM OUTRA CONTA SUPABASE

**Preparado em:** 07/11/2026  
**Escopo:** infraestrutura e código da Etapa 02, sem ativação de login, IA ou conteúdo infantil.  
**Repositório que NÃO depende da conta Supabase:** https://github.com/Vyzo-Studio/Vyzo_Academy  
**Commit de referência (Etapa 02):** `77e5801a4a80d9ee4a38f49f2c5cf7ec0a58bf74`  
**Relatório original:** [STAGE02_SUPABASE_BACKEND_REPORT.md](STAGE02_SUPABASE_BACKEND_REPORT.md)

## IMPORTANTE — o que está e o que não está salvo

- **PRESERVADO NO GITHUB:** código completo do projeto, estrutura SQL, índices, chaves estrangeiras, 63 políticas RLS, testes de isolamento A/B, documentação e histórico de commits.
- **NÃO É UM DUMP COMPLETO DO POSTGRES:** este arquivo e o repositório **não** fazem backup de dados que tenham sido inseridos em produção após a criação das migrações, de registros de `auth.users`, senhas, políticas de autenticação configuradas no dashboard, configurações de SMTP, Storage nem secrets.
- **Última auditoria positiva da Etapa 02:** 20 tabelas Academy, 20 com RLS habilitada, 63 policies, 0 usuários em `auth.users`, 0 metas e avaliações de teste persistidas. Os testes criaram identidades temporárias dentro de transações revertidas.
- **Limite atual:** a conexão antiga Supabase passou a falhar ao consultar banco/projetos durante a preparação deste guia. Portanto, **não há confirmação em tempo real de que o banco ainda esteja sem dados**. Se houve uso depois da auditoria, faça um dump de esquema e dados pelo painel/CLI antes de apagar a conta.
- **Cuidado:** eliminar a conta/organização antiga pode eliminar ou impedir acesso aos projetos `Vyzo_Academy` e `Santomen_Barbearia`. Os dados da Santomen **não** estão incluídos neste pacote.

## Projeto antigo — apenas referência histórica

- Supabase project: `Vyzo_Academy`
- Project ref (NÃO reutilizar no novo projeto): `iaxujxdqeymvxfvmioum`
- URL antiga (NÃO reutilizar): `https://iaxujxdqeymvxfvmioum.supabase.co`
- Organização original: `Santomen Barbearia`, ID `znujzsbmejliyucgvfin`
- Região: `sa-east-1` (São Paulo); PostgreSQL 17.
- **Nova implantação deve usar outra organização própria da Academy.** Não usar projetos de clientes.

## Arquivos necessários — versão verificada na branch main

Aplicar **uma única vez, nesta ordem**, em um Supabase NOVO, VAZIO e EXCLUSIVO:

| Ordem | SQL no GitHub | Migração aplicada originalmente |
| --- | --- | --- |
| 1 | `supabase/migrations/202611050001_vyzo_academy_v8.sql` | `vyzo_academy_v8_base` |
| 2 | `supabase/migrations/202611050002_vyzo_academy_research.sql` | `vyzo_academy_exam_research` |
| 3 | `supabase/migrations/202611050003_vyzo_academy_v12.sql` | `vyzo_academy_v12_storage` |
| 4 | `supabase/migrations/202611070001_stage02_normalized_backend.sql` | `stage02_normalized_backend_rls` |
| 5 | `supabase/migrations/202611070002_stage02_security_hardening.sql` | `stage02_security_hardening` |

**Confirmação de integridade pelo GitHub (blob SHA-1, não checksum do dump):**

- V8: `6ac2c419877c17dd34fccd45ca5e6f47b5c020b6`
- Pesquisa: `2588252242e010c97f47456bab2120bdeb9d5de2`
- V12: `fc7c63860e7bd8e50ec095ad8e0caa12e338040b`
- Modelo: `2972b4def1a3ce63cabd893e215affc305bacf87`
- Hardening: `4a3743dadd982f48556ff9b71f34f7b35bbe4cc8`

Os nomes de arquivos são mantidos no GitHub. O mecanismo remoto `apply_migration` gerou sua **própria numeração temporal** no banco antigo; não presumir que `supabase db push` identificará automaticamente a história antiga. Antes de usar a CLI, reconcilie o histórico de migrações do novo projeto sem reaplicar SQL já executado.

## Arquivos de QA obrigatórios

- `tests/stage02_rls_live.sql`: RLS A/B, UPDATE contra outro usuário, transferência de titularidade bloqueada, FK cruzada negada, acesso sem autenticação e token anônimo rejeitados.
- `tests/stage02_nested_integrity_live.sql`: CRUD de dados próprios, DELETE cruzado negado, coerência `goal_id` / `session_id` no histórico e nas revisões.
- Ambos são **testes transacionais**: verificam casos em dois perfis simulando claims de JWT e executam `ROLLBACK` ao final. Executar apenas no projeto exclusivo e depois conferir que não permaneceram registros de teste.
- CI geral da Etapa 02 aprovada no commit `77e5801a`: https://github.com/Vyzo-Studio/Vyzo_Academy/actions/runs/42340662872

## Como restaurar no futuro — sequência operacional

1. **Antes de apagar a conta antiga:** garanta que mantém acesso à organização `Vyzo-Studio` no GitHub. Baixe uma cópia do repositório em `https://github.com/Vyzo-Studio/Vyzo_Academy/archive/refs/heads/main.zip` para ter um segundo backup externo.
2. Se houver contas reais, registros, arquivos Storage ou configurações criadas após o último teste, **exporte-os separadamente antes da exclusão**. As migrações restauram estrutura, **não** dados.
3. Crie/conecte uma nova conta e organização Supabase sob titularidade própria da VYZO ACADEMY. Consulte plano, cotas e preço **antes** de criar o projeto. Dê preferência à região `sa-east-1` se continuar apropriada.
4. Confirme que o projeto novo está saudável, com schema `public` sem tabelas Academy existentes e com Supabase Auth instalado.
5. Aplique, via ferramenta Supabase de migrações, os **cinco arquivos SQL acima na ordem 1→5**, de preferência em fluxo versionado e rastreável. **Não execute** essas migrações sobre GNG, Haus, Santomen ou qualquer outro projeto de cliente.
6. Confira `list_migrations`, `list_tables` e os índices/constraints. Esperado: **20 tabelas Academy com RLS**, inicialmente **63 policies**. As reservas `academy_curriculum_catalog`, `academy_ai_audit_queue` e `academy_guardian_permissions` têm RLS e **NENHUMA permissão** para clientes: isso é intencional.
7. Reexecute os dois testes SQL e consulte os Supabase Security/Performance Advisors. Não desative a RLS nem torne visíveis tabelas de alunos para corrigir erros.
8. Reconecte o **novo projeto exclusivo** ao ChatGPT pelo plugin Supabase e informe somente a conexão / nome do novo projeto. O assistente deverá localizar a nova referência no plugin; **não compartilhe senha, service-role, `sb_secret_...` ou token privado**.
9. **Somente na futura etapa de autenticação**, configurar no Dashboard Auth (provedores, confirmação de email, redirecionamentos, limitações, SMTP) e a URL + **publishable key** em `academy/config.js`. **Não fazer isso agora**. O arquivo do frontend permanece sem credenciais, e o sistema local V9 e simulador existente continuam independentes.
10. Validar autenticação assinada de verdade, e-mail e isolamento A/B com usuários reais de teste **antes** de permitir inscrições.

## O que foi preservado para retomada do projeto

A plataforma V14/V15 e o simulador ENEM continuam no repositório GitHub. A migração de backend é aditiva; não altera IDs do banco de questões nem chaves de backup local. O esquema suporta perfis, objetivos, assuntos, avaliações, respostas, planos, tarefas, histórico, revisões, redações, importações de legado, catálogo editorial, auditoria futura de IA e consentimento de responsáveis (as três últimas estruturas continuam fechadas). O projeto antigo pode ser substituído por um novo **sem reescrever do zero** o sistema; os testes de restauração e a nova configuração de conexão continuam necessários.

**Status deste documento:** backup versionado **do código/esquema e plano de restauração**, não um backup do banco ao vivo. Nenhuma conta foi apagada por este processo.
