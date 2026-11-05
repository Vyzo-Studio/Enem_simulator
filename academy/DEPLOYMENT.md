# VYZO ACADEMY V8 — implantação responsável

## Estado nesta entrega

**Código pronto para implantação em um projeto Supabase exclusivo; backend real ainda não provisionado.**
Esta implementação é um módulo novo dentro do repositório existente, em `/academy/`. O simulador clássico continua funcionando independentemente e não tem sua chave de armazenamento alterada.

## Como ativar contas sem misturar projetos de clientes

1. Confirmar a organização Supabase de destino e obter o orçamento do projeto, antes de criar. **Não reutilizar Haus Barber, GNG Barbearia ou Santomen.**
2. Criar um projeto Supabase dedicado denominado `Vyzo_Academy` em região apropriada (por exemplo `sa-east-1`, conforme disponibilidade e preço confirmado).
3. Em Auth > Providers, habilitar Email/Password e **Confirm email**, além das políticas de senhas, limitações de taxa e mecanismos antiabuso. O Supabase Auth faz hashing e recuperação; NÃO criar tabela de senha.
4. Em Auth > URL Configuration, configurar `Site URL` como `https://vyzo-studio.github.io/Vyzo_Academy/academy/` e adicionar **exatamente** a URL pública do módulo em Redirect URLs. Se o repositório for renomeado, mudar URLs primeiro e testar confirmação e recuperação.
5. Rever o conteúdo de `supabase/migrations/202611050001_vyzo_academy_v8.sql` e executar **apenas** no novo projeto dedicado. Conceder API Data apenas ao esquema público, com RLS obrigatória. Testar políticas de usuário A x B antes de liberar cadastro público.
6. Buscar `Project URL` e **publishable key** no dashboard do projeto dedicado. Preencher apenas estes dois campos públicos em `academy/config.js`. **Nunca** usar `sb_secret_`, service-role, token de acesso de banco, chave de IA ou senha neste arquivo.
7. Implementar e confirmar envio real de e-mails, domínio de remetente e limites de uso. Provedores de e-mail podem ter limites de produção.
8. Testar cadastro, confirmação, login, logout, recuperação, CRUD de metas e diagnósticos, RLS entre usuários e rotina de backup/retomada em dois dispositivos reais.
9. Atualizar os termos e política com responsável legal, contato e regras de LGPD; o documento incluso é uma minuta.
10. Só depois divulgar a V8 como plataforma de contas em produção e considerar tornar obrigatório o login para novos estudantes; preservar migração opt-in do histórico local.

## O que está implementado no módulo V8

- Supabase Auth: telas de criar conta/entrar/esqueci senha/redefinir senha, reenvio de confirmação, troca de e-mail e logout.
- Onboarding em etapas: nome, disponibilidade semanal, múltiplos tipos de prova, detalhes e preferências.
- Minhas provas: criar, alterar, pausar e retomar; curso, edital, data ainda não anunciada, prioridade e disciplinas.
- Diagnósticos autorais ENEM por objetivo e **provisórios** para outras provas somente mediante aceite explícito. Sem inventar conteúdo específico.
- Relatório por assunto com distinção de dados insuficientes (menos de 3 respondidas).
- Plano global de 7 dias respeitando a disponibilidade diária total; tarefas por prova e calendário em dia/semana/mês.
- Redações em nuvem por conta com rascunhos e histórico de versões.
- Importação opt-in de histórico anterior, mantendo o original no navegador.
- RLS por proprietário, com FKs compostas para impedir associação a objetivos de outros usuários.

## Limites conhecidos

- Nenhum projeto Supabase VYZO ACADEMY foi encontrado na conexão; **não existe autenticação real ativa nesta entrega**.
- Professor IA conversacional, correção automática por cinco competências, seleção automática de videoaulas com métricas verificadas e análise automática de editais ainda requerem **backend adicional**, fornecedores e políticas de custo/privacidade.
- Sem verificação de e-mails de verdade, testes cross-user ou conexão externa, não declarar a plataforma pronta para dados reais de estudantes.
- O sistema de provas do legado ainda é local. O importador V8 faz cópia opt-in de dados legados; não transforma todos os simulados clássicos em exames cloud de forma automática.
- Pacote do Supabase JS é carregado de CDN em versão fixa `2.119.0` no browser apenas quando o backend é configurado. Recomenda-se futuro bundling local com lockfile e CSP restrita.
- Para prova de alto risco, adicionar transação de finalização com RPC SECURITY INVOKER ou bloqueio de versão mais robusto; a gravação condicional já evita sobrescrita casual, mas não substitui testes de carga.

## Fontes técnicas

- Supabase Auth: https://supabase.com/docs/guides/auth/passwords
- Redirect URLs: https://supabase.com/docs/guides/auth/redirect-urls
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase JS: https://supabase.com/docs/reference/javascript/installing


### Descoberta do novo portal

Após o repositório ter sido renomeado para `Vyzo_Academy`, os links públicos passam a estar em `/Vyzo_Academy/`. A página inicial oferece acesso em destaque ao portal `/academy/` e ao questionário público `/academy/demo.html`, que permite experimentar 10 itens sem cadastro e sem persistência. Os formulários pré-configuração ficam **desativados**, nunca recebem senhas nem criam contas fictícias.
