# Inventário completo — FoodBridge React

> **FB-WEB-INVENT-001 · 13/11/2026 · revisão documental 1.2.0.** Inventário de **todos os arquivos rastreados no Git** da interface, incluindo código, testes, assets, estilos, workflows e docs. `node_modules` e `dist` são artefatos de execução/build e não aparecem por não serem versionados.

## Organização funcional

| Área | Diretório ou arquivo | Responsabilidade |
|---|---|---|
| Inicialização | `src/main.tsx`, `src/App.tsx`, `index.html` | Montar a SPA React |
| Navegação | `src/routes/` | 10 rotas nominais, fallback e guards por TEMP/ACCESS/papel |
| Telas | `src/pages/` | Landing, cadastro, login, organização, dashboard, doações, pedidos, voluntários e administração |
| Sessão | `src/auth/session.ts`, `src/context/AuthContext.tsx` | Tokens, organização ativa, expiração e logout |
| HTTP | `src/api/`, `src/hooks/` | Axios/REST e dashboard público |
| Componentes | `src/components/layout/`, `src/components/ui/`, `src/components/dashboard/` | UI, layout e indicadores |
| Aparência e mídia | `src/styles/`, `src/index.css`, `public/`, `src/assets/`, `tailwind.config.js` | Estilos, imagens, ícones e tema |
| Testes | `tests/session.test.ts`, `tests/ci/`, `tests/test_documentacao.py` | Sessão, contratos de CD, inventário e documentação |
| Ferramentas | `tools/atualizar_inventario.py` | Sincronizar inventário Git |
| Build | `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig*.json`, `eslint.config.js` | Dependências e empacotamento |
| Infraestrutura | `.github/workflows/`, `deploy/oracle/` | GitHub Actions, SSH, backup/rollback do `dist`, Nginx |
| Documentação | `docs/`, `API_DOCUMENTATION.md`, `README.md`, `AGENTS.md` | Produto, integração, estudo, apresentação e operação |

## Recursos e documentação navegável

- [Telas e endpoints por perfil](RECURSOS_E_TELAS.md) e [arquitetura do React](ARQUITETURA_FRONTEND_ATUAL.md).
- [Material de estudo](GUIA_ESTUDO.md) e [roteiro de apresentação](APRESENTACAO_FRONTEND.md).
- [Central documental](README_DOCUMENTACAO.md) e [controle de versões](controle/VERSIONAMENTO.md).
- [API Kotlin — inventário do backend](https://github.com/DanieldeAlmeida2024/FoodBridge-API-Kotlin/blob/main/docs/INVENTARIO_PROJETO.md). Os arquivos do backend não são duplicados artificialmente aqui.

## Como atualizar

```bash
python3 tools/atualizar_inventario.py --write
python3 tools/atualizar_inventario.py --check
npm run test:session
npm run lint
npm run build
```

O teste `tests/ci/test_inventory_contract.py` compara este bloco ao Git. Todo PR que cria/remove/renomeia arquivos deve atualizá-lo. Ao mudar funcionalidades em arquivos existentes, revisar manualmente docs de telas, integração com a API, diagramas e versão documental — essa parte não é verificável apenas pelo inventário de caminhos.

## Todos os caminhos do repositório versionado

<!-- INVENTARIO_ARQUIVOS_INICIO -->
**Total de arquivos rastreados:** 89.

**Distribuicao por pasta de primeiro nivel:**
- `(raiz)`: 14
- `.github`: 3
- `deploy`: 2
- `docs`: 21
- `public`: 7
- `src`: 37
- `tests`: 4
- `tools`: 1

**Lista completa de caminhos versionados (gerada do Git):**

- [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)
- [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)
- [`.github/workflows/oracle-frontend-preflight.yml`](../.github/workflows/oracle-frontend-preflight.yml)
- [`.gitignore`](../.gitignore)
- [`AGENTS.md`](../AGENTS.md)
- [`API_DOCUMENTATION.md`](../API_DOCUMENTATION.md)
- [`README.md`](../README.md)
- [`deploy/oracle/atualizar-frontend.sh`](../deploy/oracle/atualizar-frontend.sh)
- [`deploy/oracle/preparar-secrets-ssh-windows.ps1`](../deploy/oracle/preparar-secrets-ssh-windows.ps1)
- [`docs/APRESENTACAO_FRONTEND.md`](../docs/APRESENTACAO_FRONTEND.md)
- [`docs/ARQUITETURA.md`](../docs/ARQUITETURA.md)
- [`docs/ARQUITETURA_FRONTEND_ATUAL.md`](../docs/ARQUITETURA_FRONTEND_ATUAL.md)
- [`docs/CI_CD_ORACLE_ARTEFATOS.md`](../docs/CI_CD_ORACLE_ARTEFATOS.md)
- [`docs/CI_CD_ORACLE_SSH_DIRETO.md`](../docs/CI_CD_ORACLE_SSH_DIRETO.md)
- [`docs/GUIA_ESTUDO.md`](../docs/GUIA_ESTUDO.md)
- [`docs/INVENTARIO_PROJETO.md`](../docs/INVENTARIO_PROJETO.md)
- [`docs/OCI_AUTOMATIC_CICD.md`](../docs/OCI_AUTOMATIC_CICD.md)
- [`docs/PLANO_TESTES.md`](../docs/PLANO_TESTES.md)
- [`docs/README_DOCUMENTACAO.md`](../docs/README_DOCUMENTACAO.md)
- [`docs/RECURSOS_E_TELAS.md`](../docs/RECURSOS_E_TELAS.md)
- [`docs/REQUISITOS.md`](../docs/REQUISITOS.md)
- [`docs/UML.puml`](../docs/UML.puml)
- [`docs/controle/VERSIONAMENTO.md`](../docs/controle/VERSIONAMENTO.md)
- [`docs/projeto/ESPECIFICACAO.md`](../docs/projeto/ESPECIFICACAO.md)
- [`docs/testes/PLANO_DE_TESTES.md`](../docs/testes/PLANO_DE_TESTES.md)
- [`docs/testes/SESSAO_E_INTEGRACAO.md`](../docs/testes/SESSAO_E_INTEGRACAO.md)
- [`docs/uml/01_rotas.puml`](../docs/uml/01_rotas.puml)
- [`docs/uml/02_autenticacao.puml`](../docs/uml/02_autenticacao.puml)
- [`docs/uml/03_pacotes.puml`](../docs/uml/03_pacotes.puml)
- [`docs/uml/README.md`](../docs/uml/README.md)
- [`eslint.config.js`](../eslint.config.js)
- [`index.html`](../index.html)
- [`package-lock.json`](../package-lock.json)
- [`package.json`](../package.json)
- [`postcss.config.js`](../postcss.config.js)
- [`public/favicon.svg`](../public/favicon.svg)
- [`public/icons.svg`](../public/icons.svg)
- [`public/images/doacao-alimentos.webp`](../public/images/doacao-alimentos.webp)
- [`public/images/frutas.webp`](../public/images/frutas.webp)
- [`public/images/mantimentos.webp`](../public/images/mantimentos.webp)
- [`public/images/padaria.webp`](../public/images/padaria.webp)
- [`public/images/vegetais.webp`](../public/images/vegetais.webp)
- [`src/App.tsx`](../src/App.tsx)
- [`src/api/client.d.ts`](../src/api/client.d.ts)
- [`src/api/client.js`](../src/api/client.js)
- [`src/assets/hero.png`](../src/assets/hero.png)
- [`src/assets/vite.svg`](../src/assets/vite.svg)
- [`src/auth/session.ts`](../src/auth/session.ts)
- [`src/components/dashboard/ImpactSummary.jsx`](../src/components/dashboard/ImpactSummary.jsx)
- [`src/components/layout/AppShell.jsx`](../src/components/layout/AppShell.jsx)
- [`src/components/layout/AuthLayout.tsx`](../src/components/layout/AuthLayout.tsx)
- [`src/components/layout/Container.tsx`](../src/components/layout/Container.tsx)
- [`src/components/layout/Navbar.tsx`](../src/components/layout/Navbar.tsx)
- [`src/components/ui/Button.tsx`](../src/components/ui/Button.tsx)
- [`src/components/ui/Card.tsx`](../src/components/ui/Card.tsx)
- [`src/components/ui/Feature.tsx`](../src/components/ui/Feature.tsx)
- [`src/components/ui/Icon.jsx`](../src/components/ui/Icon.jsx)
- [`src/components/ui/Input.tsx`](../src/components/ui/Input.tsx)
- [`src/components/ui/Stat.tsx`](../src/components/ui/Stat.tsx)
- [`src/components/ui/Step.tsx`](../src/components/ui/Step.tsx)
- [`src/components/ui/StyleIcon.jsx`](../src/components/ui/StyleIcon.jsx)
- [`src/context/AuthContext.tsx`](../src/context/AuthContext.tsx)
- [`src/hooks/usePublicDashboard.js`](../src/hooks/usePublicDashboard.js)
- [`src/index.css`](../src/index.css)
- [`src/main.tsx`](../src/main.tsx)
- [`src/pages/Admin.jsx`](../src/pages/Admin.jsx)
- [`src/pages/Dashboard.jsx`](../src/pages/Dashboard.jsx)
- [`src/pages/Donations.jsx`](../src/pages/Donations.jsx)
- [`src/pages/Landing.jsx`](../src/pages/Landing.jsx)
- [`src/pages/Login.tsx`](../src/pages/Login.tsx)
- [`src/pages/OrganizationForm.tsx`](../src/pages/OrganizationForm.tsx)
- [`src/pages/Register.tsx`](../src/pages/Register.tsx)
- [`src/pages/Requests.jsx`](../src/pages/Requests.jsx)
- [`src/pages/SelectOrganization.tsx`](../src/pages/SelectOrganization.tsx)
- [`src/pages/Volunteers.jsx`](../src/pages/Volunteers.jsx)
- [`src/routes/AppRoutes.d.ts`](../src/routes/AppRoutes.d.ts)
- [`src/routes/AppRoutes.jsx`](../src/routes/AppRoutes.jsx)
- [`src/routes/ProtectedRoute.tsx`](../src/routes/ProtectedRoute.tsx)
- [`src/styles/theme.ts`](../src/styles/theme.ts)
- [`tailwind.config.js`](../tailwind.config.js)
- [`tests/ci/test_direct_ssh_deploy_contract.py`](../tests/ci/test_direct_ssh_deploy_contract.py)
- [`tests/ci/test_inventory_contract.py`](../tests/ci/test_inventory_contract.py)
- [`tests/session.test.ts`](../tests/session.test.ts)
- [`tests/test_documentacao.py`](../tests/test_documentacao.py)
- [`tools/atualizar_inventario.py`](../tools/atualizar_inventario.py)
- [`tsconfig.app.json`](../tsconfig.app.json)
- [`tsconfig.json`](../tsconfig.json)
- [`tsconfig.node.json`](../tsconfig.node.json)
- [`vite.config.ts`](../vite.config.ts)
<!-- INVENTARIO_ARQUIVOS_FIM -->

**Limite:** este inventário cobre arquivos Git do frontend. O Nginx do FoodBridge, a API Java, o PostgreSQL da aplicação e suas configurações de produção estão descritos nos runbooks de implantação, mas não são arquivos rastreados neste repositório. Pacotes `node_modules`, artefatos locais `dist` e credenciais também não integram a árvore Git.
