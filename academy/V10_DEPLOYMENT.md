# Instalação segura da pesquisa V10

O frontend está integrado a `academy/v9.html`, mas a operação de pesquisa real fica desabilitada enquanto `academy/config.js` não tiver um projeto Supabase dedicado válido. Modo local V9 permanece funcional.

## Dependências

- Supabase dedicado e Supabase Auth configurado com confirmação de e-mail, Site URL `https://vyzo-studio.github.io/Vyzo_Academy/academy/v9.html` e redirect autorizado.
- Migrar primeiro V8 (`202611050001_vyzo_academy_v8.sql`) e depois a migration V10 (`202611050002_vyzo_academy_research.sql`) no **mesmo projeto exclusivo**.
- Implantar `supabase/functions/academy-exam-research/index.ts` com JWT de usuário habilitado (verificação do JWT não pode ser desativada para esse endpoint).
- Segredos de ambiente do backend: `OPENAI_API_KEY`, `OPENAI_RESEARCH_MODEL`. **Nunca** incluir em GitHub Pages, JSON, URLs, logs ou backups. A função também exige `SUPABASE_URL` e chave pública/anon de sua própria instância.
- Configuração pública `window.VYZO_ACADEMY_CLOUD={url:'https://ID.supabase.co',publishableKey:'sb_publishable_...'}` somente após validação.

## Segurança e validação obrigatória

- API externa `https://api.openai.com/v1/responses` recebe somente a consulta genérica; não recebe texto da redação nem histórico de respostas.
- Edge Function deve recusar JWT inválido, e-mail não confirmado, origem não autorizada e pesquisas acima da cota. Complementar com rate limit transacional/API gateway para requisições concorrentes.
- Não buscar URLs arbitrárias fornecidas pelo estudante no servidor. Serviço externo deve aplicar sua própria segurança contra SSRF e injeções do conteúdo da web.
- As fontes retornadas devem aparecer com links verificáveis. Campos sem fonte ficam como não confirmados.
- Testar caso ENEM, Banco do Brasil, PF com edições ambíguas, edital não divulgado, resposta sem fonte, timeout, cota, PDF indisponível e falha de rede.
- A função atual **não** extrai PDFs completos nem publica automaticamente perfis no catálogo. Não marcar o fluxo como concluído até cobrir as lacunas de produto.

## Custos e privacidade

A pesquisa web via API externa poderá gerar cobrança por modelo, tokens e buscas. Obter autorização do proprietário para o projeto, plano, modelo e limite financeiro. Não reutilizar bancos de outros clientes.

Referências técnicas oficiais:
- https://developers.openai.com/api/docs/guides/tools-web-search
- https://supabase.com/docs/guides/functions/auth
- https://supabase.com/docs/guides/database/postgres/row-level-security
