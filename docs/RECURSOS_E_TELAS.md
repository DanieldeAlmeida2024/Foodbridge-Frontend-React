# FoodBridge Web — catálogo completo das páginas e recursos

> **FB-WEB-ROTAS-001 · 13/11/2026.** Referência atual: `src/routes/AppRoutes.jsx`, `ProtectedRoute.tsx`, `src/pages/`, `src/api/client.js`, `src/auth/session.ts`. Inclui **10 rotas nominais** e fallback `*`.

## Navegação e controle de acesso

| Caminho | Página | Público ou guarda | Funcionalidade |
|---|---|---|---|
| `/` | `Landing.jsx` | Público | Proposta de valor, como funciona, atores e indicadores públicos |
| `/cadastro` | `Register.tsx` | Público | Cadastro de usuário |
| `/login` | `Login.tsx` | Público | Autenticação e encaminhamento após JWT |
| `/organizacao` | `OrganizationForm.tsx` | TEMP | Cadastrar organização ou solicitar vínculo; consulta de CNPJ |
| `/selecionar-organizacao` | `SelectOrganization.tsx` | TEMP | Seleção de organização e emissão de contexto ACCESS |
| `/dashboard` | `Dashboard.jsx` | ACCESS | Indicadores e atalhos por papel |
| `/doacoes` | `Donations.jsx` | ACCESS | Listagem, cadastro, edição, remoção e solicitação de alimentos |
| `/requisicoes` | `Requests.jsx` | ACCESS | Acompanhamento e transições de solicitações |
| `/voluntarios` | `Volunteers.jsx` | ACCESS + `ONG` | Cadastro, busca por CPF, edição e desativação de vínculo |
| `/admin` | `Admin.jsx` | ACCESS + `ADMIN` | Pendências e aprovação/reprovação institucional |
| `*` | `Landing.jsx` | Fallback | Rotas desconhecidas retornam a landing no cliente |

O `ProtectedRoute` verifica claims decodificadas e o papel para navegação; **não valida a assinatura JWT** e não substitui autorização no Spring Security/serviços backend. `AuthContext` mantém a UI sincronizada com login, seleção e logout.

## Módulos por página e integrações

### Página inicial — `Landing.jsx`

Apresenta a proposta da plataforma e etapas do fluxo social; usa `usePublicDashboard` e `GET /dashboards/publico`. Renderiza indicadores agregados, mensagens de carregamento/erro e chamadas para inscrição. Imagens e ícones em `public/` e `src/assets/`.

### Cadastro — `Register.tsx`

Valida campos em formulário e chama `POST /usuarios`; usa `fetch("/usuarios")` relativo. **Atenção:** essa implementação não herda necessariamente `VITE_API_BASE_URL` do cliente Axios compartilhado; considerar padronizar o transporte em revisão futura.

### Autenticação — `Login.tsx`, `OrganizationForm.tsx`, `SelectOrganization.tsx`

Login chama `POST /auth/login`; conforme TEMP ou ACCESS, encaminha para cadastro/seleção ou dashboard. `OrganizationForm` consulta `GET /organizacoes/cnpj/{cnpj}` e envia `POST /organizacoes`. `SelectOrganization` envia `POST /auth/select-org` e guarda contexto resultante. Testes de sessão verificam expiração, correspondência de usuário/vínculo e isolamento das chaves do app.

### Dashboard — `Dashboard.jsx`

Conforme papel, consulta `GET /dashboards/ong`, `GET /dashboards/doador` ou dados públicos e, quando a sessão permite, `GET /organizacoes/me`. Oferece navegação contextual e indicadores operacionais. As métricas exibidas dependem de dados do backend e não são prova de impacto social já realizado.

### Doações — `Donations.jsx`

Doador: `GET /doacoes`, `POST /doacoes`, `PUT /doacoes/{id}`, `DELETE /doacoes/{id}`. ONG: busca disponíveis em `GET /doacoes/disponiveis`, apresenta detalhes e envia `POST /requisicoes`. Formulário inclui tipo, descrição, quantidade, unidade, validade, janelas e endereço. O lookup externo `https://viacep.com.br/ws/{cep}/json/` auxilia CEP (serviço de terceiro).

**Compatibilidade a revisar:** `getDonationsForRole()` tenta `/doacoes/disponiveis`, depois `/doacoes/publicadas` e depois `/doacoes`. A rota `/doacoes/publicadas` **não consta** no catálogo atual do backend; há fallback, mas a tentativa gera requisição evitável.

### Solicitações — `Requests.jsx`

Consulta `GET /requisicoes/minhas` para ONG ou `GET /requisicoes/recebidas` para doador; carrega voluntários quando aplicável. Envia `PATCH /requisicoes/{id}/{ação}` para aprovação, rejeição, cancelamento, conclusão ou vínculo de voluntário. A API verifica estado, papel e titularidade.

### Voluntários — `Volunteers.jsx`

Lista `GET /voluntarios`, busca `GET /voluntarios/cpf/{cpf}`, cria `POST /voluntarios`, atualiza `PUT /voluntarios/{id}` e desativa vínculo `PATCH /voluntarios/{id}/desativar`. CPF, endereço, email e telefone exigem tratamento de dados pessoais, minimização e acesso por organização.

### Administração — `Admin.jsx`

Exibe `GET /admin/organizacoes/pendentes` e `GET /admin/usuarios/pendentes`, com operações `PATCH /admin/{tipo}/{id}/aprovar` e `.../reprovar`. O backend é responsável por validar papel ADMIN.

## Componentes compartilhados e estilo

| Área | Arquivos | Papel |
|---|---|---|
| Layout | `src/components/layout/AppShell.jsx`, `AuthLayout.tsx`, `Container.tsx`, `Navbar.tsx` | Estrutura, navegação e layouts autenticados |
| UI | `src/components/ui/Button.tsx`, `Card.tsx`, `Feature.tsx`, `Icon.jsx`, `Input.tsx`, `Stat.tsx`, `Step.tsx`, `StyleIcon.jsx` | Componentes e elementos de apresentação |
| Indicadores | `src/components/dashboard/ImpactSummary.jsx` | Visualização de impacto/indicadores |
| Sessão | `src/auth/session.ts`, `src/context/AuthContext.tsx` | Persistência de contexto, login, troca de organização e logout |
| Transporte | `src/api/client.js`, `src/api/client.d.ts`, `src/hooks/usePublicDashboard.js` | Axios, autenticação e consulta pública |
| Tema | `src/styles/theme.ts`, `src/index.css`, `tailwind.config.js` | Tokens de tema, CSS e Tailwind |
| Roteamento | `src/routes/AppRoutes.jsx`, `ProtectedRoute.tsx` | Associação URLs/telas e guards |

## Dependências e execução

`React 19`, `React Router 7`, `Axios 1.x`, `TypeScript 6`, `Vite 8`, `Tailwind CSS 3`, `ESLint 9`. Os scripts são `npm run dev`, `npm run test:session`, `npm run lint`, `npm run build` e `npm run preview`; confirmar `package.json` para versões exatas.

**CI/CD**: [push automático homologado](https://github.com/DanieldeAlmeida2024/Foodbridge-Frontend-React/actions/runs/43465805656). O script remota publica a pasta `dist` no Nginx via SSH e verifica HTTP 200 local/externo, com backup e rollback.

## Estado, limites e evidência

Rotas e componentes **existem no código**. Os testes presentes validam sessão, build, lint e contratos de deploy. A existência de UI não prova acessibilidade WCAG, compatibilidade de todos os navegadores, LGPD, TLS/HTTPS ou cobertura completa E2E de todas as telas. Tokens estão em localStorage; avaliar proteção XSS/CSP e estratégia de sessão segura.

Leitura: [arquitetura atual](ARQUITETURA_FRONTEND_ATUAL.md), [inventário integral](INVENTARIO_PROJETO.md), [API com 50 rotas](https://github.com/DanieldeAlmeida2024/FoodBridge-API-Kotlin/blob/main/docs/REFERENCIA_API_ATUAL.md).
