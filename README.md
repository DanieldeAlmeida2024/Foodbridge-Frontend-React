# Foodbridge-Frontend-React

Aplicação web da plataforma FoodBridge, incluindo cadastro, autenticação e organização das doações.

## Início rápido
**Stack:** React, Vite, TypeScript, JavaScript. Os passos abaixo dependem da configuração apropriada do ambiente e de serviços externos.

```bash
npm ci && npm run dev
```

**Verificação inicial:** `npm run build`. Não interpretar esse comando como evidência de testes aprovados antes de executá-lo.

## Principais diretórios/arquivos
- `package.json`
- `src/pages`
- `src/context`
- `src/api`
- `API_DOCUMENTATION.md`
- `.github/workflows/deploy.yml`

## Limitações
A implantação Oracle Cloud exige secrets e infraestrutura; os dois deploys observados em outubro de 2026 falharam. O motivo não foi identificado apenas pela conclusão dos runs.

## Documentação técnica
- [Requisitos](docs/REQUISITOS.md)
- [Arquitetura](docs/ARQUITETURA.md)
- [UML](docs/UML.puml)
- [Plano de testes](docs/PLANO_TESTES.md)
- [Guia para IA](AGENTS.md)

---

## README anterior preservado

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## Documentação técnica versionada

- [Especificação e análise de domínio](docs/projeto/ESPECIFICACAO.md)
- [Diagramas UML editáveis](docs/uml/README.md)
- [Plano de testes](docs/testes/PLANO_DE_TESTES.md)
- [Controle de versões](docs/controle/VERSIONAMENTO.md)

## Validação funcional da sessão
```sh
npm ci
npm run test:session
npm run lint
npm run build
```
A URL da API pode ser configurada com `VITE_API_BASE_URL`; o padrão usa o mesmo origin.
CI roda em PRs. Publicação exige workflow manual, `deploy=true` e
`VM_DEPLOY_ENABLED=true` no environment `oracle-production`.
[Casos e limites dos testes](docs/testes/SESSAO_E_INTEGRACAO.md).
