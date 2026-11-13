# FoodBridge — frontend React

[![CI Web](https://github.com/DanieldeAlmeida2024/Foodbridge-Frontend-React/actions/workflows/ci.yml/badge.svg)](https://github.com/DanieldeAlmeida2024/Foodbridge-Frontend-React/actions/workflows/ci.yml)
[![Deploy Oracle](https://github.com/DanieldeAlmeida2024/Foodbridge-Frontend-React/actions/workflows/deploy.yml/badge.svg)](https://github.com/DanieldeAlmeida2024/Foodbridge-Frontend-React/actions/workflows/deploy.yml)

Interface web do FoodBridge, plataforma de redistribuição de alimentos entre organizações doadoras e ONGs. Este projeto apresenta formulários, navegação por papel, doações, solicitações, voluntários, indicadores e administração. O servidor é a [API Kotlin/Spring Boot](https://github.com/DanieldeAlmeida2024/FoodBridge-API-Kotlin).

**Stack:** React 19 · TypeScript 6 + JavaScript/JSX · Vite 8 · React Router 7 · Axios · Tailwind CSS 3 · ESLint 9.

## Recursos implementados

- Dez rotas nominais, incluindo landing, cadastro, login, organização, seleção de contexto, dashboard, doações, requisições, voluntários (ONG) e administração (ADMIN).
- Sessão JWT com transição TEMP → ACCESS, `AuthContext`, guards de navegação e interceptor Axios.
- Formulários de doação e voluntário, filtros de alimentos, consulta de CEP com ViaCEP, indicadores públicos e aprovações institucionais.
- Teste automatizado de sessão, lint e build de produção.
- **Deploy automático do site na Oracle** após push de código na `main`; envio SSH com host key pinada, backup do `dist`, rollback e validação HTTP 200 do Nginx.

**Deploy automático real:** [run #43465805656 — SUCCESS](https://github.com/DanieldeAlmeida2024/Foodbridge-Frontend-React/actions/runs/43465805656), com Nginx local e externo HTTP 200. [Deploy automático da API](https://github.com/DanieldeAlmeida2024/FoodBridge-API-Kotlin/actions/runs/43465999269) também homologado.

## Documentação e portfólio

**[Central de documentação](docs/README_DOCUMENTACAO.md)** · [Inventário completo do repositório](docs/INVENTARIO_PROJETO.md) · [Telas e operações](docs/RECURSOS_E_TELAS.md) · [Arquitetura React + Mermaid](docs/ARQUITETURA_FRONTEND_ATUAL.md) · [Guia de estudo](docs/GUIA_ESTUDO.md) · [Apresentação](docs/APRESENTACAO_FRONTEND.md).

Outras referências: [contratos HTTP e exemplos](API_DOCUMENTATION.md), [UML editável](docs/uml/README.md), [plano de testes](docs/testes/PLANO_DE_TESTES.md), [CI/CD e rollback](docs/OCI_AUTOMATIC_CICD.md), [documentação do produto completo](https://github.com/DanieldeAlmeida2024/FoodBridge-API-Kotlin/blob/main/docs/README_DOCUMENTACAO.md).

## Rodar em desenvolvimento

Requer Node.js 24 compatível com a configuração de CI. Com uma API de desenvolvimento acessível:

```bash
npm ci
npm run dev
npm run test:session
npm run lint
npm run build
npm run preview
```

O cliente Axios lê `VITE_API_BASE_URL` ou usa a mesma origem por padrão; o cadastro `Register.tsx` ainda usa `fetch("/usuarios")` relativo. Configure URL/proxy local de forma coerente. **Nunca direcionar testes de cadastro para o PostgreSQL de produção**.

Ao alterar a árvore do projeto:

```bash
python3 tools/atualizar_inventario.py --write
python3 tools/atualizar_inventario.py --check
```

O CI verifica que o inventário MD contém todos os arquivos rastreados.

## Limites e evolução

A proteção das rotas no frontend melhora a UX, mas autorização real é responsabilidade da API. JWT permanece no localStorage; revisar risco XSS e sessão segura. TLS, testes de navegador E2E e acessibilidade abrangentes são frentes de evolução, não itens já certificados. Para distinguir implementação de homologação, veja [recursos e telas](docs/RECURSOS_E_TELAS.md).

**Colaboração:** [AGENTS.md](AGENTS.md) e [versionamento documental](docs/controle/VERSIONAMENTO.md).
