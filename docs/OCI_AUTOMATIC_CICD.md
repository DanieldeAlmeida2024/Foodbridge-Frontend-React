# FoodBridge React — CI/CD automático Oracle E2.1.Micro

**FB-WEB-CD-AUTO-001 · 13/11/2026**

## Publicação contínua

Ao mesclar alterações de código, assets, dependências ou workflow no branch `main`, o GitHub Actions `.github/workflows/deploy.yml` realiza automaticamente `npm ci`, testes de sessão, `lint`, build React/Vite, compactação, envio SSH com host key fixa e implantação no Nginx. Não é necessário alterar `OCI_DEPLOY_ENABLED` ou `OCI_AUTO_DEPLOY_ENABLED`: **essas variáveis não são utilizadas pelo workflow**. Alterações apenas de documentação não reiniciam o processo de publicação.

O deployment preserva o backup do `dist` anterior; valida o SHA256, impede links/caminhos tar inseguros, faz `nginx -t` antes e depois da troca e confirma HTTP 200 na raiz pública do Nginx. Não reinicia Nginx, Docker ou a API nem altera PostgreSQL.

## Controle

- `pull_request`: valida `npm ci`, `test:session`, `lint`, `build` e contrato de segurança; nunca publica
- `push main`: dispara deploy sem flag manual após testes próprios do workflow
- `workflow_dispatch deploy=true`: opção de publicação manual se necessário
- `concurrency frontend-producao`: serializa os deployments; não cancela uma troca em andamento
- `oracle-production`: environment separado com `OCI_SSH_PRIVATE_KEY`, `OCI_SSH_KNOWN_HOSTS`, `OCI_SSH_HOST` e `OCI_SSH_USER`. Não expor esses valores nos logs, comentários ou repositório

## Verificação

A primeira publicação manual já foi comprovada no [run #43425858526](https://github.com/DanieldeAlmeida2024/Foodbridge-Frontend-React/actions/runs/43425858526). Após integrar o CD automático, exigir novo run de evento `push` com job `deploy=SUCCESS` e registro `DEPLOY FRONTEND: PASS` e `FRONTEND_PUBLIC_HTTP=200`. Se falhar, manter backup e corrigir a falha; não tratar `skipped` como sucesso.

Este mecanismo não configura HTTPS em 443, nem faz publicação da API; são operações independentes.
