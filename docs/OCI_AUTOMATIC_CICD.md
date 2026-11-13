# FoodBridge React — CI/CD automático Oracle E2.1.Micro

**FB-WEB-CD-AUTO-001 · 13/11/2026**

## Publicação contínua

Ao mesclar alterações de código, assets, dependências ou workflow no branch `main`, o GitHub Actions `.github/workflows/deploy.yml` realiza automaticamente `npm ci`, testes de sessão, `lint`, build React/Vite, compactação, envio SSH com host key fixa e implantação no Nginx. Não é necessário alterar `OCI_DEPLOY_ENABLED` ou `OCI_AUTO_DEPLOY_ENABLED`: **essas variáveis não são utilizadas pelo workflow**. Alterações apenas de documentação não reiniciam o processo de publicação.

O deployment preserva o backup do `dist` anterior; valida o SHA256, impede links/caminhos tar inseguros, faz `nginx -t` antes e depois da troca e confirma HTTP 200 **no Nginx local da VM por SSH**. A resposta externa do IP é reportada separadamente, pois o runner GitHub recebeu HTTP 403 mesmo com a publicação remota concluída. Não reinicia o Nginx nem a API do FoodBridge e não modifica o PostgreSQL da aplicação.

## Controle

- `pull_request`: valida `npm ci`, `test:session`, `lint`, `build` e contrato de segurança; nunca publica
- `push main`: dispara deploy sem flag manual após testes próprios do workflow
- `workflow_dispatch deploy=true`: opção de publicação manual se necessário
- `concurrency frontend-producao`: serializa os deployments; não cancela uma troca em andamento
- `oracle-production`: environment separado com `OCI_SSH_PRIVATE_KEY`, `OCI_SSH_KNOWN_HOSTS`, `OCI_SSH_HOST` e `OCI_SSH_USER`. Não expor esses valores nos logs, comentários ou repositório

## Verificação

A primeira publicação manual já foi comprovada no [run #43425858526](https://github.com/DanieldeAlmeida2024/Foodbridge-Frontend-React/actions/runs/43425858526). Após integrar o CD automático, exigir novo run de evento `push` com job `deploy=SUCCESS` e registro `DEPLOY FRONTEND: PASS` e `FRONTEND_NGINX_LOCAL_HTTP=200`. Se falhar, manter backup e corrigir a falha; não tratar `skipped` como sucesso.

Este mecanismo não configura HTTPS em 443, nem faz publicação da API; são operações independentes.

## Evidência do primeiro push automático e correção do smoke

O [run #43464755446](https://github.com/DanieldeAlmeida2024/Foodbridge-Frontend-React/actions/runs/43464755446) foi disparado automaticamente por `push` após [PR #9](https://github.com/DanieldeAlmeida2024/Foodbridge-Frontend-React/pull/9) e passou em testes, build, SSH, transferência, backup e publicação remota. O log confirmou `DEPLOY FRONTEND: PASS commit=578c98c65444f8abe9faa3786f711fc0cb2095aa`. O job terminou FAILURE **somente** na sondagem externa `http://163.176.133.210/`, que retornou 403 para o runner do GitHub. Isso não demonstra que o site é acessível para todos os clientes externos, nem indica falha da cópia de `dist`.

A correção substitui a exigência de resposta externa 200 por uma verificação HTTP 200 no Nginx da própria VM, via SSH autenticado, e registra o resultado externo como alerta de conectividade/política. O CD não depende de IP externo do runner para confirmar um deploy local. Uma validação adicional no navegador de um usuário externo é recomendada para investigar a resposta 403.

## Incidente HTTP 403 local — correção do mode de dist

O segundo [run automático #43465262108](https://github.com/DanieldeAlmeida2024/Foodbridge-Frontend-React/actions/runs/43465262108) também compilou, testou e publicou o build com `DEPLOY FRONTEND: PASS commit=2159b76429d178fd975bda7bc56a48522831366f`. Porém o diagnóstico via SSH detectou `Nginx local nao respondeu HTTP 200: 403`, evidenciando um problema **real de acesso aos arquivos estáticos**. A rotina anterior usava `umask 077` e `mktemp -d`, preservando permissões que podiam impedir o usuário Nginx de percorrer `dist` mesmo com SELinux correto.

A correção `deploy/oracle/atualizar-frontend.sh` normaliza somente o conteúdo público do `dist` após extrair (`0755` diretórios, `0644` arquivos), mantendo a segurança do arquivo SSH e do tar temporário. Antes de emitir `DEPLOY FRONTEND: PASS`, exige `curl http://127.0.0.1/` HTTP 200; se falhar, restaura o backup e normaliza também suas permissões. Esse controle evita declarar sucesso apenas por `nginx -t` e `index.html` existir.

## Homologação final do frontend — 13/11/2026

A correção de permissões [PR #11](https://github.com/DanieldeAlmeida2024/Foodbridge-Frontend-React/pull/11) passou no CI e foi mesclada. O `push` em `main` disparou automaticamente o [deploy #43465805656](https://github.com/DanieldeAlmeida2024/Foodbridge-Frontend-React/actions/runs/43465805656), **SUCCESS** com todos os passos aprovados. Evidências do log remoto:

```text
DEPLOY FRONTEND: PASS commit=9b9148de51a31e560b244f0c743b059a9f861edf backup=/opt/foodbridge/foodbridge-frontend/foodbridge-frontend/backups/github-actions-9b9148de51a31e560b244f0c743b059a9f861edf-20261113T164516Z HTTP_LOCAL=200
FRONTEND_NGINX_LOCAL_HTTP=200
FRONTEND_EXTERNAL_HTTP=200
```

**CD automático do frontend homologado por publicação real**, sem variáveis de habilitação e sem intervenção manual. O erro HTTP 403 do Nginx foi corrigido e os testes remoto e externo retornaram 200. Publicações subsequentes ocorrem em pushes de arquivos executáveis na `main`; commits somente de documentação não executam novo deploy.
