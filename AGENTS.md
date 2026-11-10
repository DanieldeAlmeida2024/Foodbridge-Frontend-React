# Guia de colaboração e IA — Foodbridge-Frontend-React

Aplicação web da plataforma FoodBridge, incluindo cadastro, autenticação e organização das doações.

## Ler primeiro
- `package.json`
- `src/pages`
- `src/context`
- `src/api`
- `API_DOCUMENTATION.md`
- `.github/workflows/deploy.yml`

## Invariantes
- Preservar stack e contratos existentes; não reescrever módulos por preferência de linguagem.
- Usar identificadores em português em componentes novos somente se compatível com o projeto.
- Distinguir funcionalidade real, hipótese, código de exemplo e teste simulado.
- Não divulgar segredos ou dados privados em logs, testes, commits ou documentação.
- Não alterar produção nem apagar bancos e execuções sem escopo e plano de recuperação.
- Antes de merge: revisar diff e executar teste nativo (npm run build).

**Risco conhecido:** A implantação Oracle Cloud exige secrets e infraestrutura; os dois deploys observados em outubro de 2026 falharam. O motivo não foi identificado apenas pela conclusão dos runs.
