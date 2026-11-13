# Central de documentação — FoodBridge Web

> **FB-WEB-DOC-HUB-001 · 13/11/2026.** Documentação da interface baseada no React real, atualizada após a homologação do deploy automático na Oracle. A API Kotlin possui documentação própria e complementar.

## Escopo da infraestrutura

Esta documentação registra **somente os componentes do FoodBridge hospedados na Oracle**: site React/`dist` servido por Nginx, API Kotlin/Java, PostgreSQL específico do FoodBridge e rotinas de CI/CD, backup e saúde. Compartilhar a VM com outras aplicações **não** transforma esses serviços em dependências ou recursos do projeto. Para a topologia e o diagnóstico de rede pertinentes, veja [documentação de rede FoodBridge](https://github.com/DanieldeAlmeida2024/FoodBridge-API-Kotlin/blob/main/docs/implantacao/DIAGNOSTICO_REDE_FOODBRIDGE.md).

## Índice rápido

| Finalidade | Documento | Escopo |
|---|---|---|
| Mapear tudo que existe no Git | [Inventário completo](INVENTARIO_PROJETO.md) | Arquivos rastreados, agrupados por pasta; comando de atualização |
| Entender as telas | [Recursos e 10 rotas](RECURSOS_E_TELAS.md) | Formulários, papéis, API usada e recursos por tela |
| Estudar arquitetura | [Arquitetura frontend atual](ARQUITETURA_FRONTEND_ATUAL.md) | Diagrama React, sessão, HTTP, dados e deploy |
| Estudar para entrevista | [Guia de estudo](GUIA_ESTUDO.md) | Sete aulas, exercícios, testes e questões |
| Apresentar em banca | [Roteiro de apresentação](APRESENTACAO_FRONTEND.md) | Pitch, sete telas e problemas resolvidos |
| Operar entrega contínua | [CI/CD automático](OCI_AUTOMATIC_CICD.md) | SSH, Nginx, teste HTTP, backups e log real |
| Contratos do backend | [Catálogo oficial de 50 endpoints](https://github.com/DanieldeAlmeida2024/FoodBridge-API-Kotlin/blob/main/docs/REFERENCIA_API_ATUAL.md) | Rotas com método, finalidade e guarda |
| Material legado | [Especificação anterior](projeto/ESPECIFICACAO.md), [API_DOCUMENTATION.md](../API_DOCUMENTATION.md) | Exemplos e histórico: conferir divergências |
| Testes | [Plano de testes](testes/PLANO_DE_TESTES.md), [testes de sessão](testes/SESSAO_E_INTEGRACAO.md) | Casos, evidências e limites |
| UML editável | [Diagramas de rotas e pacotes](uml/README.md) | PlantUML dos módulos do web |
| Versionamento | [Controle documental](controle/VERSIONAMENTO.md) | Revisões e impactos |

## Integração entre repositórios

[API Kotlin](https://github.com/DanieldeAlmeida2024/FoodBridge-API-Kotlin) → identidade, autorização, regras de negócio e PostgreSQL. [React](https://github.com/DanieldeAlmeida2024/Foodbridge-Frontend-React) → experiência de navegação, formulários, guardas de UI e cliente REST. O backend é fonte autorizada para acesso e estados.

[Central de documentação da API e produto completo](https://github.com/DanieldeAlmeida2024/FoodBridge-API-Kotlin/blob/main/docs/README_DOCUMENTACAO.md) · [apresentação full-stack](https://github.com/DanieldeAlmeida2024/FoodBridge-API-Kotlin/blob/main/docs/APRESENTACAO_PROJETO.md).

## Como manter o inventário no tempo

```bash
python3 tools/atualizar_inventario.py --write
python3 tools/atualizar_inventario.py --check
npm run test:session && npm run lint && npm run build
```

O teste `tests/ci/test_inventory_contract.py` é descoberto pelo CI e exige que o bloco gerado contenha **todos os arquivos versionados** do repositório. Alteração só de documentação não publica outra versão no Nginx; alterações em `src/`, `public/`, dependências ou workflow acionam CD automático.

**Evidência:** [run #43465805656 — PASS](https://github.com/DanieldeAlmeida2024/Foodbridge-Frontend-React/actions/runs/43465805656), com testes/lint/build, SSH, backup de `dist` e HTTP 200 local/externo. O deploy da API é independente.
