# VYZO ACADEMY V12 — Pré-produção

**Estado: ainda NÃO é uma versão funcional com login obrigatório.**
O Supabase conectado contém somente bancos de clientes, sem projeto exclusivo VYZO ACADEMY.
A branch main continua com os fluxos anteriores para não bloquear estudantes nem perder dados.

## Implementação preparada na branch v12-auth-gateway-preproduction

- Núcleo com Supabase Auth para validar sessão real, e-mail confirmado e rejeitar contas anônimas.
- Portal existente de cadastro, login e recuperação de senha preservado e endurecido para a troca de conta e logout.
- Tela de entrada de autenticação em academy/v12-entry.html. Sem backend configurado ela não recebe senha.
- Migração opcional, por usuário, dos históricos clássicos v1/v2 e do V9 local: valida formato, rejeita campos de credenciais, verifica o usuário ativo, usa hash contra duplicatas e nunca apaga o original.
- SQL aditivo com documentos privados e políticas RLS por auth.uid(), separação de usuários e bloqueio de acesso anônimo.
- Testes em Node e Chromium, executados contra simulações, não contra Supabase real.

## Não está concluído

- Projeto Supabase dedicado, Auth configurado e email SMTP validado em produção.
- Contas reais, e-mail de confirmação, recuperação, sessão em outro dispositivo.
- Teste de RLS entre estudantes A e B e testes de banco com IDs trocados.
- Migração dos snapshots antigos para registros ativos do novo workspace (por enquanto são cópias recuperáveis).
- Sincronização cloud da experiência V9/V10/V11 e do simulador clássico.
- Integração total de flashcards, redações, revisões e banco de questões ao workspace autenticado.
- Troca da página inicial e fechamento de TODAS as rotas guest. Elas permanecem na produção até backend validado, para não interromper os estudos.
- Auditoria editorial V11 pendente de publicação.

## Procedimento de ativação seguro

1. Confirmar a organização Supabase, consultar custo e obter aprovação antes de provisionar projeto possivelmente pago.
2. Criar projeto VYZO ACADEMY exclusivo, ativar Email/Password, confirmação de e-mail, política de senhas, SMTP e controles antiabuso. Não permitir anonymous sign-ins.
3. Configurar Site URL e Redirect URLs exatos para https://vyzo-studio.github.io/Vyzo_Academy/academy/ .
4. Aplicar as migrações existentes V8, V10 e V12 SOMENTE no projeto exclusivo; verificar GRANT, RLS, chaves estrangeiras e avisos de segurança.
5. Adicionar somente URL e publishable key ao navegador. Nunca publicar service_role, senha de banco ou segredos de IA.
6. Criar contas reais de teste A e B, confirmar e-mail e testar login, logout, recuperação e acesso de segundo dispositivo.
7. Executar operações SELECT/INSERT/UPDATE/DELETE com IDs trocados para provar isolamento no banco, incluindo relações filhas.
8. Fazer backup e migrar um histórico antigo por consentimento; conferir integridade e titularidade no cloud sem apagar dados do navegador.
9. Adaptar motores V9/V10/V11, clássico e redações ao armazenamento com titularidade, controle de revisão e resolução de conflitos.
10. Substituir a raiz por entrada obrigatória de login, impedir rotas diretas guest e atualizar build e PWA sem expor dados privados.
11. Validar todos os fluxos com QA e só então publicar em main.

## Limitação da hospedagem estática

GitHub Pages distribui HTML/JS públicos. Um redirecionamento ou bloqueio no frontend não torna o código confidencial.
A autorização sobre dados do estudante deve ser feita no Supabase com RLS por auth.uid() e suas restrições de titularidade.

## Critério de conclusão

Somente declarar funcional quando houver Auth real, confirmação por e-mail, recuperação, isolamento de duas contas reais, sincronização entre dispositivos, migração correta, proteção de todas as rotas e publicação testada.
