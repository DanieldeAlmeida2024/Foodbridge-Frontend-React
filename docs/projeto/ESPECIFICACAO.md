# FoodBridge Web — especificação do frontend

> **FBR-WEB — documentação v1.0.0** · 11/11/2026 · revisão do código `f7ae44e78d011734e8cc6d7cf643a9c88d8c7457`.


## Propósito
Interface React/Vite para os fluxos de cadastro, autenticação, seleção de organização e operações de doação, requisição, voluntários e administração da API FoodBridge. É um repositório separado do backend Kotlin: contratos devem ser validados por integração, não presumidos pelo nome do recurso.

## Rotas reais
`src/routes/AppRoutes.jsx` declara `/` (Landing), `/cadastro` (Register), `/login` (Login), `/organizacao` (OrganizationForm), `/selecionar-organizacao` (SelectOrganization), `/dashboard` (Dashboard), `/doacoes` (Donations), `/requisicoes` (Requests), `/voluntarios` (Volunteers) e `/admin` (Admin). As rotas no arquivo são componentes `Route` diretos, **sem guardas de navegação visíveis nesse módulo**.

## Fluxo de identidade
`src/context/AuthContext.tsx` mantém estado de usuário com nome, email, organizações (`organizacaoId`, nome, papel, status), `tempToken`, `accessToken` e status.
- `loginTemp(data)` grava/remove `tempToken` e `token` no `localStorage` e atualiza o estado React.
- `loginFinal(token)` grava `token` e remove `tempToken`, **mas não atualiza explicitamente `user`**; testar renderizações dependentes do estado.
- `logout()` chama `localStorage.clear()` e apaga o usuário, removendo potencialmente outras chaves que não pertencem ao FoodBridge.
- O `api/client.js` usa Axios com `baseURL: ""`, adiciona Bearer `token` prioritário ou, na ausência, `tempToken`. Deve-se verificar em implantação como o proxy encaminha URL relativa para a API Kotlin.

## Contrato de integração com API
A API Kotlin diferencia `TEMP` de `ACCESS`. A UI precisa respeitar o ciclo **login → selecionar organização → ACCESS → operações por papel**. Um usuário com duas organizações não pode reaproveitar contexto indevido entre organizações. O backend, e não o frontend, é a autoridade de autorização.

## Build e operação
`package.json` usa React 19, React Router 7, Axios, Vite 8, TypeScript 6, Tailwind 3 e ESLint 9. Scripts definidos: `npm run dev`, `npm run build` (`tsc -b && vite build`), `npm run lint`, `npm run preview`.

## Riscos identificados por leitura
- `localStorage` expõe tokens a JavaScript no contexto da página; tratar XSS como risco relevante.
- Sem guardas no `AppRoutes`, o controle de páginas depende de componentes individuais e backend; realizar auditoria por rota.
- `loginFinal` pode deixar o contexto React em situação diferente dos tokens gravados.
- `localStorage.clear()` remove dados de outras funcionalidades sob o mesmo origin.
- A URL base vazia precisa de proxy apropriado em produção; não introduzir endpoint fixo sem configuração por ambiente.
