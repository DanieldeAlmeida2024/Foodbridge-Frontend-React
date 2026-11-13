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

**Estado em 13/11/2026:** CI/CD automático na Oracle homologado em [run #43465805656](https://github.com/DanieldeAlmeida2024/Foodbridge-Frontend-React/actions/runs/43465805656). O incidente HTTP 403 foi corrigido via permissões estáticas do Nginx; manter backup, health e host SSH fixado.

## Contrato obrigatório de documentação e inventário — 13/11/2026

- Antes de modificar módulos, leia [docs/README_DOCUMENTACAO.md](docs/README_DOCUMENTACAO.md), [docs/INVENTARIO_PROJETO.md](docs/INVENTARIO_PROJETO.md) e a documentação atual do recurso alterado.
- PR que cria, move ou remove arquivos: execute `python3 tools/atualizar_inventario.py --write`, inclua a alteração em `docs/INVENTARIO_PROJETO.md` e verifique `python3 tools/atualizar_inventario.py --check`.
- O teste `tests/ci/test_inventory_contract.py` exige correspondência exata entre o Git e o inventário. Uma mudança de conteúdo sem mudar caminhos **não** é detectada por esse teste; atualize manualmente `RECURSOS_E_STATUS.md` / `RECURSOS_E_TELAS.md`, diagramas e catálogo de API, conforme o escopo.
- Ao alterar contrato HTTP, autorização, modelo de dados, tela, teste ou fluxo de deploy, atualizar documentos vinculados e `docs/controle/VERSIONAMENTO.md` no mesmo PR.
- Diferenciar especificação histórica, código existente, CI aprovado e e2e homologado; registrar evidência real por commit/run. Não afirmar conformidade LGPD/HTTPS/100% de cobertura sem provas.
- O CI/CD atual é disparado automaticamente em push de **código** na main. Um PR somente documental não deve acionar nova publicação na Oracle. Não restabelecer gates manuais legados sem decisão explícita.
