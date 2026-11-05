# VYZO ACADEMY V8 — Relatório de implementação e QA

## Escopo efetivamente concluído

- Criado o portal incremental `/academy/`, sem eliminar o simulador clássico da raiz.
- Núcleo determinístico de agendamento por limite diário **global**; múltiplas provas, prioridades, urgência e tempo por dia.
- Telas de autenticação vinculáveis ao Supabase Auth (`signUp`, `signInWithPassword`, confirmação de e-mail, reenvio, recuperação, troca de e-mail, logout). Nenhuma senha salva no banco de perfis ou JSON.
- Onboarding em quatro etapas, com várias provas simultâneas e disponibilidade semanal por dia.
- `Minhas provas` com CRUD, pausa, retomada, arquivamento sem exclusão e painel por objetivo.
- Diagnóstico independente por objetivo, salvamento incremental e relatório que separa respondidas, erros, brancos e evidência insuficiente.
- Para concursos sem banco específico, só existe avaliação **provisória geral** após aceite explícito; não inventamos conteúdo da banca.
- Calendário global com vistas dia/semana/mês, filtros, tarefas concluídas, histórico preservado e geração adicional sem duplicar estudos.
- Redação vinculada à conta, rascunho autosalvo e versões anteriores, sem fingir correção automática por IA.
- Importação opcional do histórico local antigo, mantendo o original intacto e armazenando a cópia separadamente.
- Esquema PostgreSQL com RLS, `WITH CHECK` e FK composta `(goal_id,user_id)` em todas as tabelas relacionadas a metas.
- UI acessível e responsiva com bloqueio explícito se backend não foi configurado.
- Testes estáticos Node e testes em Chromium (API Supabase **simulada**) adicionados ao CI.

## Testes executados em 05/11/2026

| Cenário | Resultado | Limite |
|---|---|---|
| Alocação de 2 h entre 3 objetivos | Passou | Motor puro |
| Disponibilidade 0 a 720 min, prioridades, prova pausada | Passou | Motor puro |
| Conflito de horários e excesso diário | Passou | Motor puro |
| Não duplicar tarefas existentes, preservação de concluídas | Passou | Motor puro |
| Banco 224 questões, gabaritos e diagnóstico com brancos | Passou | Dados autorais |
| Resposta do diagnóstico, salvamento e retomada | Passou | Supabase simulado |
| Cadastro de 2 objetivos no onboarding | Passou | Supabase simulado |
| Calendário a partir de diagnóstico | Passou | Supabase simulado |
| Editor de redação e versionamento | Passou | Supabase simulado |
| Responsividade 320, 390, 768, 1024 e 1440 px | Passou | Chromium local |
| Interface bloqueada sem projeto Supabase | Passou | Chromium local |
| RLS multiusuário real, envio real de e-mail, deploy Auth | **Pendente** | Nenhum projeto exclusivo disponível |

## Não realizado / não afirmar como funcional

1. Criação e migração em banco real (precisa de Supabase exclusivo e autorização da organização).
2. Login e confirmação de e-mail reais (só após infraestrutura Auth e URLs públicas configuradas).
3. Correção inteligente de redações, tutor IA conversacional e Youtube API verificado (precisam de backend/credenciais e custos).
4. Sincronização total da V6 antiga entre dispositivos (a V8 importa uma cópia opt-in, mas não altera o mecanismo local clássico).
5. Correção TRI, bibliotecas de concursos com edital analisado automaticamente, notificações push e rate limiting customizado.
6. Garantia absoluta de disponibilidade/ausência de bugs (não é possível prometer 100% em qualquer aplicação).

## Decisão de publicação

O portal é lançado como **V8 — infraestrutura em preparação**, em endereço separado, sem retirar o funcionamento da V6. Nenhum botão de cadastro fictício é ativado enquanto a configuração cloud não estiver disponível. Depois da configuração e dos testes de RLS/cadastro com duas contas, poderemos decidir como tornar o login obrigatório na rota principal e migrar o histórico existente de forma segura.

## Recursos do legado preservados

- Questões 224 + 72 legadas, simulado 10–100, cronômetro crescente/regressivo, correção, backup e importação.
- A V8 não altera as chaves de armazenamento da V6: `enem-intelligence-v2` e `enem-intelligence-v1`.
- O arquivo `/index.html` do legado permanece como principal até a nova autenticação estar pronta.
