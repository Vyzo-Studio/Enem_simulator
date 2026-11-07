# VYZO ACADEMY — RESTAURAÇÃO DO SUPABASE NA NOVA CONTA (07/11/2026)

## Estado confirmado

O banco dedicado da Academy foi **recriado no projeto existente** da nova conexão Supabase chamada `Vyzo_academy`, sem interagir com o antigo projeto Santomen nem outros bancos de clientes.

- Organização: `Vyzo_Academy`, ID `cktkylrzmsgvwmtwjawk`.
- Projeto atual: `vyzoacademy@gmail.com's Project` (nome de exibição inicial fornecido pelo Supabase).
- Project ref: `cfrlqinzsysoqcduqftd`.
- URL pública da API: `https://cfrlqinzsysoqcduqftd.supabase.co`.
- Região: `sa-east-1` (São Paulo); PostgreSQL 17; estado `ACTIVE_HEALTHY`.
- O novo projeto já existia na conta antes da restauração. Nenhum projeto pago foi provisionado por esta operação.

## Migrações restauradas

As cinco migrações SQL **exatamente como estão na main do GitHub** foram aplicadas com sucesso, em ordem, com os nomes:

1. `vyzo_academy_v8_base`, versão remota `20261107051826`.
2. `vyzo_academy_exam_research`, versão remota `20261107051830`.
3. `vyzo_academy_v12_storage`, versão remota `20261107051834`.
4. `stage02_normalized_backend_rls`, versão remota `20261107051839`.
5. `stage02_security_hardening`, versão remota `20261107051844`.

Fontes: `supabase/migrations/202611050001_vyzo_academy_v8.sql`,
`202611050002_vyzo_academy_research.sql`, `202611050003_vyzo_academy_v12.sql`,
`202611070001_stage02_normalized_backend.sql`,
`202611070002_stage02_security_hardening.sql`.

## Validação remota

- **20 tabelas da Academy**, todas com RLS habilitada.
- **63 políticas**, nenhuma permissão SELECT atribuída a `anon` sobre tabelas da Academy.
- Estruturas preparatórias para currículo, IA e responsáveis sem permissão para `authenticated`.
- SQL `tests/stage02_rls_live.sql` executado no novo projeto: **PASS** (estudante A/B, titularidade, FKs, solicitações anônimas).
- SQL `tests/stage02_nested_integrity_live.sql`: **PASS** (CRUD próprio, DELETE cruzado, coerência sessão/objetivo).
- Ambas as transações de teste foram revertidas; consulta pós-testes retornou **0** usuários Auth, **0** objetivos, **0** sessões e **0** respostas.
- Security Advisor: somente três avisos informativos `rls_enabled_no_policy`, **intencionais** nas tabelas fechadas de currículo, IA e responsáveis. Referência: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy .
- Performance Advisor: avisos informativos `unused_index` esperados em banco ainda vazio. Referência: https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index .

## Importante: o que NÃO foi ativado

- Nenhum login, cadastro ou confirmação de e-mail foi implementado/ativado neste procedimento.
- `academy/config.js` **permanece com URL e publishableKey vazias**; frontend não está conectado ao novo projeto.
- Nenhuma credencial secreta de Supabase foi copiada ou versionada no GitHub.
- Nenhum conteúdo pedagógico em revisão, contas infantis ou serviço de IA foi ativado.
- A restauração transfere **estrutura**, não dados privados da conta antiga. A última auditoria antiga apontava banco vazio; se houver dados posteriores, eles exigem exportação/importação independente.
- O título padrão do projeto pode ser renomeado no painel do Supabase sem recriar o banco. A organização já tem o nome correto.

**Próxima etapa dependente:** configurar autenticação real, projeto/frontend e testes end-to-end de JWT, email e privacidade, quando expressamente solicitado. Não executar nesta restauração.
