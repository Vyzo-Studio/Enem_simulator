# VYZO ACADEMY — BLOCO 02, SUBETAPA A: GATEWAY SEGURO DE IA

**Data:** 07/11/2026  
**Escopo único:** pesquisa de exames/concursos pela infraestrutura V10 existente, sem Professor VYZO, painel admin nem alterações no planejador.  
**Projeto Supabase exclusivo:** `Vyzo_academy`, ref `cfrlqinzsysoqcduqftd`, região `sa-east-1`.

## Estado precedente auditado

- `main`: Bloco 01/A integrado, commit `f046d9d70f11a2966c26eb2411064aaf5a5622a4`. Catálogo BNCC e filtro por série preservados.
- Etapa 03: PR #8 **draft**, não integrado ao `main`; nova inscrição ainda bloqueada no servidor. Não afirmar que cadastro, e-mail real e sincronização foram homologados.
- V10: frontend `academy/v10-research.mjs`, Edge Function originalmente não implantada e tabela `academy_research_requests` com RLS.
- No início: 0 usuários `auth.users`, 0 Edge Functions e 0 requisições reais na tabela. A cota V10 anterior era verificada por COUNT seguido de INSERT, sem atomicidade.

## Implementação

1. `supabase/migrations/202611070004_block02_ai_research_quota.sql` cria metadados de uso (status, modelo, entrada/saída/total de tokens, web search calls, estimativa opcional USD, conclusão) sem registrar texto original nem conteúdo dos prompts.
2. RPC `academy_reserve_research(p_query_length)`: reserva por transação com **advisory lock por UID**; 6 pesquisas por dia UTC e 2 por 60 s, evitando corrida de leitura e escrita. A permissão depende de JWT identificado por `auth.uid()`, e-mail confirmado, conta não anônima e `auth.users.raw_app_meta_data.academy_ai_research_allowed='true'`. Acesso direto INSERT/UPDATE/DELETE à tabela de cota removido de `authenticated`; leitura continua por RLS própria.
3. `supabase/functions/academy-exam-research/index.ts`, `gateway.mjs` e `research-policy.mjs`: entrada Deno com **verify_jwt=true**, validação adicional de usuário pela API Auth, CORS por origem, POST JSON ≤2 KB, texto 3–150 chars, timeout de rede, no máximo 2 chamadas de ferramenta web e 1.700 tokens de saída, erros seguros, contabilização de reservas mesmo quando provedor falha, telemetria atualizada somente em ambiente servidor por secret.
4. Pesquisa OpenAI via Responses API com `store:false` e `web_search`. Saída JSON estrita por validação local. Somente URLs https de órgãos/domínios institucionais permitidos e presentes nas anotações do provedor são aceitas; datas inválidas são anuladas. Campos sem URL associada são retornados como desconhecidos. **Citação na resposta do provedor não prova verificação humana do edital nem garante o conteúdo da fonte**.
5. Custos estimados em USD **somente** quando valores de preço unitário são definidos e verificados pelo operador em `ACADEMY_INPUT_USD_PER_M`, `ACADEMY_OUTPUT_USD_PER_M` e `ACADEMY_SEARCH_USD_PER_CALL`; caso contrário, custo `null`. Não declarar preço sem tabela configurada.
6. Nenhuma credencial secreta de provedor ou `service_role` no frontend, em código fonte ou em logs da aplicação. A função retorna 503 se `ACADEMY_AI_ENABLED` não for explicitamente `true`, e também se faltarem `OPENAI_API_KEY`, `OPENAI_RESEARCH_MODEL` ou `SUPABASE_SERVICE_ROLE_KEY`.

## Mudanças efetivamente aplicadas no Supabase

- Migração `block02_ai_research_quota`: **APLICADA** no projeto exclusivo (7ª migração).
- Endpoint `academy-exam-research`: **IMPLANTADO**, versão 1, status `ACTIVE`, `verify_jwt=true`, arquivos `index.ts`, `gateway.mjs` e `research-policy.mjs`. A implantação de endpoint NÃO prova integração paga, funcionamento do login ou sucesso de pesquisa externa.
- Não foi instalada/configurada chave OpenAI nem habilitado `ACADEMY_AI_ENABLED=true`. Nenhuma chamada paga foi feita.

## Verificações

- Banco real: transação isolada de teste validou (PASS) reservas A/B, bloqueio INSERT direto, autorização por `app_metadata`, cota 2/min e restauração ROLLBACK. Não foi executado teste de concorrência simultânea multi-conexão; a atomicidade é obtida por advisory lock PostgreSQL e depende de testes de carga futuros.
- Pós-teste real: `auth.users=0`, `academy_research_requests=0`, `registration_gate.enabled=false`, nenhuma policy INSERT direta, RPC executável por `authenticated` e não por `anon`.
- Unit tests `tests/block02_ai_gateway.test.mjs`: mock HTTP de auth, quotas e provedor, input inválido, host spoofing/caminhos codificados, conteúdo sem citação, custo quando configurado, erros e segredo apenas servidor. **Simulações não substituem teste de e-mail/JWT real**.
- Regressões V8–V15, Browser Chromium, contrato V10 no GitHub Actions.
- Supabase Security Advisor: 3 `rls_enabled_no_policy` informativos (tabelas editoriais fechadas) e 1 `authenticated_security_definer_function_executable` WARNING. Esta última é uma **exceção intencional que exige revisão de segurança independente**: o RPC executa com privilégios elevados apenas para reservar cota após checagem explícita do `auth.uid()`, confirmação e flag `app_metadata`, utiliza `search_path` fechado e não aceita UID como entrada. Referência: https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable . Não considerar esse aviso resolvido automaticamente. 
- Performance Advisor: índices ainda não usados no banco vazio.

## Bloqueadores para IA realmente operacional

1. Concluir homologação da Etapa 03: duas contas reais de adultos com emails confirmados, sessões JWT e isolamento real testados. O gate de cadastro permanece fechado e as contas de menores não podem ser ativadas.
2. Revisar risco do RPC `security definer` apontado pelo Advisor e fazer testes HTTP reais contra Edge Functions, incluindo JWT inválido, token expirado, contas distintas e corridas simultâneas.
3. Cadastrar `OPENAI_API_KEY` e `OPENAI_RESEARCH_MODEL` **somente como secrets no Supabase**, nunca em chat/repositório/frontend. Confirmar limites, orçamento e tabela de preço da OpenAI; preencher preços por milhão de tokens e preço por web_search caso se pretenda estimar custo.
4. Autorização explícita do operador para conceder `raw_app_meta_data.academy_ai_research_allowed=true` somente a adultos homologados e habilitar `ACADEMY_AI_ENABLED=true` no ambiente da função. Não fazer antes de testes e orçamento.
5. Efetuar pesquisa REAL via provedor, validar correlação de citações e conteúdo dos editais, tratamento de redirecionamentos e revisão humana antes de afirmar equivalência à fonte oficial.
6. Interface de pesquisa V10 na `main` mantém seu comportamento original sem chave pública (pesquisa indisponível). Não alterar o frontend nem permitir chamadas de IA até a homologação da Etapa 03.

## Limites e próximo passo

**Resultado:** infraestrutura DB + endpoint autenticado implantados e documentados; **pesquisa real bloqueada até provedor e Auth homologados**. Não iniciar Professor VYZO (B), planejador (C) ou administração (D) nesta execução.

**Arquivos:** `supabase/functions/academy-exam-research/index.ts`, `gateway.mjs`, `research-policy.mjs`, `supabase/migrations/202611070004_block02_ai_research_quota.sql`, `tests/block02_ai_gateway.test.mjs`, `tests/block02_ai_quota_live.sql`, `tests/v10_research.test.mjs`, `.github/workflows/pages.yml` e este checkpoint.
