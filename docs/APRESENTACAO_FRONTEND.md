# FoodBridge — roteiro de apresentação do frontend React

> **FB-WEB-PORTFOLIO-001 · 13/11/2026.** Material de entrevista, demonstração de estudo e banca. Base no código e em execuções de CI/CD reais.

## Abertura de 30–45 segundos

> O frontend do FoodBridge foi criado para tornar a redistribuição de alimentos organizada para diferentes perfis: doador, produtor, distribuidor, ONG e administrador. A interface usa React, roteamento protegido e um fluxo de sessão que separa autenticação temporária da seleção de organização. Há telas para doações, solicitações, voluntários, indicadores e administração. O build é testado e publicado automaticamente na Oracle Cloud pelo GitHub Actions. Um desafio real foi corrigir permissões do Nginx após deploy; a solução passou no CI e foi homologada com HTTP 200 local e externo.

## Estrutura sugerida de apresentação (7 telas / 4–6 minutos)

| Etapa | Visualização | Mensagem principal |
|---|---|---|
| 1 | Landing `/` | Problema do desperdício e atores da solução |
| 2 | Cadastro/login `/cadastro`, `/login` | Validação de identidade e feedback |
| 3 | Seleção `/organizacao`, `/selecionar-organizacao` | Contexto por organização, TEMP→ACCESS |
| 4 | Dashboard `/dashboard` | KPIs por papel e navegação orientada ao usuário |
| 5 | Doações `/doacoes` | Oferta, unidades, janelas, endereço e busca ONG |
| 6 | Solicitações/voluntários `/requisicoes`, `/voluntarios` | Ciclo de aprovação/coleta e isolamento |
| 7 | DevOps | CI/CD automático, Nginx, erro 403 investigado e corrigido |

## Fluxo de demonstração

1. Iniciar com uma conta **fictícia** e explicar como o sistema protege as rotas.
2. Mostrar a navegação por perfil; falar sobre limites de autorização do navegador.
3. Apresentar cadastro de doação e solicitação no **ambiente de teste**, nunca expondo CPF de pessoas reais.
4. Abrir `src/routes/AppRoutes.jsx`, `src/auth/session.ts` e `src/api/client.js` no GitHub para explicar arquitetura.
5. Exibir o histórico de build, testes e [deploy automático PASS](https://github.com/DanieldeAlmeida2024/Foodbridge-Frontend-React/actions/runs/43465805656).

## Evidências objetivas

- React 19 + Router 7 + TypeScript/JavaScript + Vite 8 + Axios + Tailwind 3; versões resolvidas em `package.json`.
- 10 rotas nominais de usuário + fallback `*`; funções de UI detalhadas em [RECURSOS_E_TELAS.md](RECURSOS_E_TELAS.md).
- `npm run test:session`, `npm run lint`, `npm run build` executados pelo workflow.
- Primeira implantação automática final: `DEPLOY FRONTEND: PASS commit=9b9148de51a31e560b244f0c743b059a9f861edf ... HTTP_LOCAL=200`, `FRONTEND_NGINX_LOCAL_HTTP=200`, `FRONTEND_EXTERNAL_HTTP=200`.
- Backup `dist` gerado; rollback existe em `deploy/oracle/atualizar-frontend.sh`.

## Perguntas que um avaliador pode fazer

**Como você protege uma rota?** `ProtectedRoute` diferencia TEMP e ACCESS e checa papel, mas apenas o backend autentica/autoriza realmente.

**Qual a vantagem de centralizar HTTP?** `client.js` define baseURL, timeout, Bearer e 401; evita lógica duplicada. `Register.tsx` ainda usa fetch direto e deverá ser unificado.

**Como garantir CD confiável?** O workflow executa testes/lint/build, fixa host key SSH, confere SHA-256, cria backup, extrai `dist`, valida permissões e exige HTTP 200.

**Qual problema real você resolveu?** Analisou HTTP 403 Nginx após a publicação e corrigiu modos de diretórios/arquivos, com teste de saúde e rollback.

**O que falta?** HTTPS, browser E2E abrangente, auditoria de acessibilidade, estratégia para tokens em localStorage e monitoramento de disponibilidade.

## Cuidados de apresentação

Não mostrar JWT, credenciais de organização, CPF, e-mail ou endereço pessoais. Utilizar dados sintéticos, indicar quando uma função é apenas planejada e evitar estatísticas sociais sem fonte. Um CI aprovado comprova testes executados e publicação, não certificação de todas as páginas em todos os navegadores.

**Apresentação full-stack correspondente:** [FoodBridge API — visão do produto e engenharia](https://github.com/DanieldeAlmeida2024/FoodBridge-API-Kotlin/blob/main/docs/APRESENTACAO_PROJETO.md).
