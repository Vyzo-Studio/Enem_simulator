# VYZO ACADEMY — V9.0 · Diagnóstico antes do plano

Atualização incremental do repositório existente. O simulador antigo e o portal V8 foram preservados.

## Fluxo real disponibilizado (modo local, sem conta)

1. Acesse `/academy/v9.html`; responda ao questionário em quatro etapas: prova(s), dados e matérias, tempo/dias disponíveis, nível percebido e dificuldades.
2. Escolha uma prova e complete seu diagnóstico inicial de 10, 20 ou 30 questões (quantidade personalizada de 3 a 50 se houver itens). O gabarito só aparece após finalizar.
3. Veja indicadores de precisão nas respondidas, cobertura, resultados por assunto e correções comentadas.
4. Somente então o plano da prova é desbloqueado. O plano considera dificuldades demonstradas, conhecimentos mantidos e assuntos ainda sem evidência suficiente.
5. Continue estudando, conclua atividades, faça novo teste com questões inéditas e compare resultados sem declarar causalidade ou nota oficial.

## Restrições críticas

- Sem Supabase dedicado: **não existem contas reais nem sincronização** no modo V9 local. Não coletamos senhas nem simulamos login. O portal V8 só ativa Auth quando o cliente público e RLS forem configurados e verificados.
- Questões não compatíveis com a prova escolhida não são declaradas específicas; concursos sem banco verificado exigem aceitar explicitamente um diagnóstico provisório de habilidades gerais.
- Não há correção automática de redação por IA nem recomendações verificadas da API YouTube. O botão de videoaula abre uma busca, claramente identificada.
- Informações de editais e pesos inseridas pelo aluno não são fontes oficiais verificadas. A classificação de domínio exige evidências repetidas.
- Os dados são armazenados **apenas neste navegador**, podem ser apagados ao limpar os dados e não são privados contra outros usuários do mesmo perfil do navegador. Faça backups JSON.

## Garantias de regressão

- `src/app.js`, `src/mentor.js` e os bancos originais não foram removidos. A chave `enem-intelligence-v2` continua intacta.
- Testes: `node tests/v9_core.test.mjs` e `python3 tests/v9_browser.py`. O segundo usa Chromium real com armazenamento simulado por limitação do ambiente de testes; não equivale a testar autenticação real.
- Os scripts V6/V8 anteriores permanecem no CI.


## Primeiro acesso

A raiz encaminha novos navegadores, sem estado V1/V2, para o formulário V9. O modo antigo permanece acessível a quem já possuía dados ou pela URL `index.html?classic=1`. Diagnósticos com evidência insuficiente são salvos, mas não liberam planos personalizados.
