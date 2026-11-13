# Implantação do frontend por artefato CI (Oracle Cloud)

FB-WEB-PULL-001 | 13/11/2026 | implementação em PR, **sem deploy realizado**.

O workflow `.github/workflows/ci.yml` executa `npm ci`, `test:session`, lint e build no runner hospedado. Quando todas as etapas passam, a action `upload-artifact` disponibiliza `dist/` como `foodbridge-frontend-dist` durante 7 dias.

Um agente instalado na VM Oracle — mantido no repositório `FoodBridge-API-Kotlin` como `deploy/oracle/pull-approved-artifact.sh` — consulta o Actions deste repositório via HTTPS 443. Só publica o artefato de um run SUCCESS de `push` na main que corresponde exatamente ao HEAD atual. Ele substitui o `dist` do Nginx após staging e mantém backup para rollback. Não exige SSH iniciado pelo GitHub nem Tailscale.

**Não** clonar/buildar este projeto em produção durante esse processo; o artefato é o resultado do CI e não uma imagem Docker. Não altera Oracle Linux, PostgreSQL ou Java.

## Gates ainda pendentes

- Proteger branch main e obrigar aprovação de PR e CI.
- Mesclar o PR com upload de artefato e obter primeiro run de push/main aprovado.
- Instalar o agente na VM conforme `docs/implantacao/CI_CD_POR_ARTEFATOS.md` do repositório API, configurar token GitHub Actions com acesso de leitura **aos dois repositórios**, e testar o modo `frontend --check`.
- Testar permissões de `opc` para a pasta de build, funcionamento do Nginx e rollback com publicação supervisionada.
- Habilitar timer automático só após comprovar gates. `VM_DEPLOY_ENABLED` do workflow antigo por SSH deve permanecer desativado.

Registro de sucesso de build não significa versão publicada na VM; documentar SHA, run e confirmação no servidor.
