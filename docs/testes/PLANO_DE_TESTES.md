# Testes do frontend FoodBridge

> **FBR-WEB — documentação v1.0.0** · 11/11/2026 · revisão do código `f7ae44e78d011734e8cc6d7cf643a9c88d8c7457`.


## Situação observada
`tests/test_documentacao.py` valida arquivos de documentação. O `package.json` não define `test` unitário; possui `build` e `lint`. Uma suíte E2E de autenticação/organização deve ser implementada. O PR de documentação não deve ser confundido com execução de todos os testes abaixo.

| ID | Prioridade | Jornada | Resultado esperado |
|---|---|---|---|
| WEB-01 | P0 | Cadastro → login | Dados retornam à UI sem expor segredo |
| WEB-02 | P0 | Login TEMP | `tempToken` salvo, `token` ACCESS anterior removido |
| WEB-03 | P0 | Seleção de organização | ACCESS substitui TEMP para operações protegidas |
| WEB-04 | P0 | Falha de seleção da organização | Nenhum token ACCESS criado indevidamente |
| WEB-05 | P0 | Troca de contexto entre duas ONGs | Dados de organização anterior não aparecem |
| WEB-06 | P0 | `/admin` com usuário comum | Sem acesso efetivo a dados/ações administrativas |
| WEB-07 | P0 | Logout | Tokens invalidados localmente, checar chaves não relacionadas |
| WEB-08 | P0 | Axios com `token` e `tempToken` | Prioridade correta e sem Bearer null/undefined |
| WEB-09 | P1 | `loginFinal` | Estado React e persistência coerentes |
| WEB-10 | P1 | Página profunda após reload | Rotas resolvidas via Nginx |
| WEB-11 | P1 | API 401/403/500 | Mensagem recuperável, sem dados sensíveis |
| WEB-12 | P0 | XSS em texto exibido | Token não acessível por conteúdo injetado |
| WEB-13 | P1 | `npm run lint` | Sem erros de lint |
| WEB-14 | P0 | `npm run build` | TypeScript compila e bundle é gerado |
| WEB-15 | P1 | Responsividade | Autenticação, lista e formulários funcionam em mobile |

## Estratégia de execução
1. `npm ci && npm run lint && npm run build` em CI de frontend.
2. Adicionar testes de componentes (contexto e interceptors) com React Testing Library/Vitest.
3. E2E com navegador e **API de homologação**, nunca endpoints que modifiquem produção.
4. Validar todos os papéis de organização com dados sintéticos e scripts de limpeza.

## Rastreabilidade
Mapear `WEB-01/02/03` a `src/pages/Login.tsx`, `src/pages/SelectOrganization.tsx`, `AuthContext.tsx` e `api/client.js`; `WEB-05/06` a rotas e API Kotlin. O resultado de cada execução deve identificar commit de frontend **e backend**.
