# VYZO ACADEMY V10 — Busca inteligente de provas (etapa segura)

## Escopo implementado nesta entrega

- A primeira etapa do questionário V9 foi renovada: entrada em linguagem natural **“Qual prova ou concurso você deseja estudar?”** e ação **“Pesquisar com IA”**.
- A integração não mostra resultados fictícios. Se o backend não estiver configurado, a interface informa a dependência e permite **configuração manual** como alternativa funcional.
- Contrato de pesquisa com validação de campos, tamanho da consulta e URLs HTTPS de domínios institucionais autorizados.
- Quando futuramente conectado, o frontend suporta várias alternativas/edições, dados incompletos, links de fontes, seleção da prova e preenchimento dos dados existentes sem recriar o questionário, o diagnóstico ou o plano.
- A seleção de provas continua permitindo várias metas; o motor V9 continua exigindo diagnóstico adequado antes de liberar plano personalizado.
- Código de Supabase Edge Function preparado para autenticar estudante, exigir confirmação do e-mail, validar cota por usuário e consultar a **API oficial Responses com web_search** sem expor segredo no navegador.
- Migração SQL preparada (não executada) para registrar a cota com RLS e catálogo público de perfis revisados manualmente.
- Testes de unidade e regressão Chromium para fallback, navegação, responsividade, seleção de resultados simulados, histórico e diagnóstico V9.

## Dependências externas não configuradas

**A pesquisa por IA ainda não está ativa em produção.** Não existe projeto Supabase dedicado à VYZO ACADEMY na conexão disponível, nem configuração de `OPENAI_API_KEY` e `OPENAI_RESEARCH_MODEL` de backend, nem testes com credenciais reais. Projetos Haus Barber/GNG não foram alterados. A Edge Function e a migração estão versionadas, mas **não implantadas**. O cadastro/conta/sincronização em nuvem da V8 continuam pendentes.

**Limitações explícitas desta etapa:** não foi implementado um extrator de PDFs completos/escaneados nem a curadoria automatizada de alterações de editais; o catálogo compartilhado recebe somente registros publicados por curadoria administrativa, e não é preenchido automaticamente. Validação de fontes é de domínio oficial e URL citada pelo mecanismo de busca, não auditoria humana do conteúdo de cada documento. Rate limit adicional no gateway e testes com usuários reais são necessários antes de produção.

## Garantias de compatibilidade

- Arquivos de dados, questões e funções V9 legadas não foram apagados nem renomeados.
- O estado local continua sob a mesma chave `vyzo-academy-v9-guest-1`; nenhum armazenamento de senha foi adicionado.
- As respostas do V9, planos e históricos não dependem de backend para continuar funcionando como antes.
- URLs públicas V9 e simulador clássico preservadas.

## Próximos passos para produção

1. Obter autorização para um Supabase **exclusivo** da VYZO ACADEMY (informar custo antes de criar).
2. Aplicar e auditar as migrations V8/V10 nesse projeto, testar RLS com contas A e B e configurar confirmações de e-mail.
3. Configurar credenciais públicas no `academy/config.js` e segredos `OPENAI_API_KEY` e `OPENAI_RESEARCH_MODEL` somente no servidor.
4. Implantar `academy-exam-research`, verificar retorno real do web_search, status, cota, citações e erros; medir custo real.
5. Revisar a qualidade dos dados extraídos e implementar extração confiável de PDF caso haja uso de documentos escaneados.
6. Habilitar o fluxo de busca para alunos autenticados e avaliar migração opt-in de convidados para a conta.

Não divulgar a pesquisa como IA ativa antes de executar essas etapas.
