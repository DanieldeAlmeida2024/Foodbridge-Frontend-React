# FoodBridge React — publicação direta no Nginx via GitHub Actions/SSH

**FB-WEB-CD-SSH-002 · 13/11/2026 · versão em homologação.**

## Escopo

O projeto React/Vite entrega arquivos HTML/CSS/JS do diretório `dist` (não usa imagem Docker). GitHub Actions executa `npm ci`, `npm run test:session`, `npm run lint` e `npm run build` antes de empacotar. O runner usa a chave RSA dedicada `SHA256:3zV6jlZeYgt19xz4h0KrumznEr3SNlyAEiolj+XrmO8` e valida a host key fixada em `known_hosts`. A publicação SSH envia o tarball ao diretório temporário na Oracle e executa `deploy/oracle/atualizar-frontend.sh` por stdin.

## Proteções

- Branch `main` obrigatória. Publicação manual: `workflow_dispatch deploy=true` e variável de **repositório** `OCI_DEPLOY_ENABLED=true`. Publicação a cada push da main: exige ainda `OCI_AUTO_DEPLOY_ENABLED=true`.
- Ambas as flags começam `false`. O workflow de pull request não tem job de deploy. O job de deploy executa testes, lint e build internamente antes de qualquer SSH.
- `OCI_SSH_PRIVATE_KEY` e `OCI_SSH_KNOWN_HOSTS` são secrets do **environment `oracle-production` deste repositório frontend**, separados do backend. `OCI_SSH_HOST` e `OCI_SSH_USER` são variables do environment. Não compartilhar secrets via issue, chat, logs ou arquivos versionados.
- O script remoto valida SHA-256, conteúdo e estrutura do tar, rejeita symlinks, verifica Nginx, prepara staging e guarda backup do `dist` antigo; em falha depois da troca, tenta restaurar o diretório anterior. Não acessa PostgreSQL nem reinicia Nginx.
- SSH só com `BatchMode=yes`, `IdentitiesOnly=yes`, `IdentityAgent=none` e `StrictHostKeyChecking=yes`. A porta 22 da VPC está aberta à internet por decisão do operador; endurecimento de sshd e monitoramento são responsabilidades de operação.

## Preparação do environment pelo Windows

O backend tem secrets próprios e já passou em preflight remoto, mas **eles não são herdados pelo frontend**. Após o merge deste PR, clonar o frontend no Windows e executar:

```powershell
gh auth status
powershell.exe -NoProfile -File .\deploy\oracle\preparar-secrets-ssh-windows.ps1
```

O script usa a cópia local já homologada da RSA em `%USERPROFILE%\.ssh\foodbridge-ci-rsa-test`, valida fingerprint e conexão SSH, cria environment, define vars e grava secrets por stdin através do GitHub CLI, sem imprimir a chave. **Ele mantém ambos os gates de deploy desligados.**

## Primeiro preflight (sem publicação)

```powershell
gh workflow run oracle-frontend-preflight.yml --ref main --repo DanieldeAlmeida2024/Foodbridge-Frontend-React
gh run list --workflow oracle-frontend-preflight.yml --limit 5 --repo DanieldeAlmeida2024/Foodbridge-Frontend-React
```

Exigir `SSH_RSA_OK`, `SSH_EXIT=0`, `FRONTEND ORACLE PREFLIGHT: PASS (somente leitura)`, Nginx ativo e diretórios existentes/graváveis. Esse teste não atualiza o site.

## Preflight real homologado — 13/11/2026

Operador executou no Windows `deploy/oracle/preparar-secrets-ssh-windows.ps1` e confirmou `FRONTEND_SSH_ENV_READY=YES`, com os gates do repositório `OCI_DEPLOY_ENABLED=false` e `OCI_AUTO_DEPLOY_ENABLED=false`. O script registrou RSA dedicada e `known_hosts` na área de secrets do environment `oracle-production` deste repositório, sem exibir a chave.

A execução [GitHub Actions #43424408420](https://github.com/DanieldeAlmeida2024/Foodbridge-Frontend-React/actions/runs/43424408420), job `131882164371`, terminou **SUCCESS**. Os logs confirmam:

```text
SSH_RSA_OK
SSH_EXIT=0
nginx: configuration file /etc/nginx/nginx.conf test is successful
FRONTEND ORACLE PREFLIGHT: PASS (somente leitura)
```

**Acesso remoto e permissões do frontend homologados; deploy real ainda NÃO executado.** Próxima liberação: autorizar manualmente uma publicação, conferir backup e site HTTP, depois voltar a bloquear o gate até revisão de rollback.

## Primeiro deploy manual supervisionado

Após preflight aprovado e backup da versão anterior verificado:

```powershell
gh variable set OCI_DEPLOY_ENABLED --body true --repo DanieldeAlmeida2024/Foodbridge-Frontend-React
gh variable set OCI_AUTO_DEPLOY_ENABLED --body false --repo DanieldeAlmeida2024/Foodbridge-Frontend-React
gh workflow run deploy.yml --ref main -f deploy=true --repo DanieldeAlmeida2024/Foodbridge-Frontend-React
gh run list --workflow deploy.yml --limit 5 --repo DanieldeAlmeida2024/Foodbridge-Frontend-React
```

Conferir no run `Deploy Frontend FoodBridge`: testes, lint e build PASS, SHA-256 válido, `DEPLOY FRONTEND: PASS commit=... backup=...`. Verificar o site no navegador e fazer requisição HTTP externa ao domínio correto. Caso falhe a saúde pública, desabilitar o deploy e efetuar rollback do backup.

## Ligar e desligar automaticidade

Após deploy manual e smoke test aprovados, ligar `gh variable set OCI_AUTO_DEPLOY_ENABLED --body true --repo DanieldeAlmeida2024/Foodbridge-Frontend-React`; para desativar imediatamente, usar `false` e, se necessário, também definir `OCI_DEPLOY_ENABLED=false`.

Não instalar Tailscale nem agentes de pull da VM como parte dessa operação. Verificar branch protection/checks antes de ativar publicação automática, pois push direto de código não revisado poderá ser implantado.

Referência cruzada: [documentação da API/SSH direto](https://github.com/DanieldeAlmeida2024/FoodBridge-API-Kotlin/blob/main/docs/implantacao/CI_CD_ORACLE_SSH_DIRETO.md).