# Controle de versões — Foodbridge-Frontend-React

## v1.2.0 — documentação completa da interface e inventário rastreado (13/11/2026)

Atualização de documentação após a homologação do [deploy automático web #43465805656](https://github.com/DanieldeAlmeida2024/Foodbridge-Frontend-React/actions/runs/43465805656), publicado por push na main após testes, build, backup, validação de Nginx e HTTP 200. A configuração anterior de flags manuais permanece nos documentos antigos apenas como histórico.

| ID | Documento | Finalidade |
|---|---|---|
| FB-WEB-DOC-HUB-001 | [Central de documentação](../README_DOCUMENTACAO.md) | Entradas para todos os documentos atuais |
| FB-WEB-INVENT-001 | [Inventário Git](../INVENTARIO_PROJETO.md) | Lista de todos os arquivos com controle automático no CI |
| FB-WEB-ROTAS-001 | [Telas e recursos](../RECURSOS_E_TELAS.md) | 10 rotas nominais, integrações e pendências |
| FB-WEB-ARC-001 | [Arquitetura atual](../ARQUITETURA_FRONTEND_ATUAL.md) | Componentes, sessão, Nginx e CI/CD |
| FB-WEB-ESTUDO-001 | [Guia de estudo](../GUIA_ESTUDO.md) | Aulas e exercícios de React |
| FB-WEB-PORTFOLIO-001 | [Apresentação](../APRESENTACAO_FRONTEND.md) | Pitch, roteiro de demonstração e evidências |

`tools/atualizar_inventario.py` gera a lista de arquivos versionados, e `tests/ci/test_inventory_contract.py` reprova PRs se o inventário estiver desatualizado. Alterações de comportamento exigem revisão manual da documentação funcional, testes e este histórico. Esta revisão não altera recursos da aplicação.


ID: **FBR-WEB-DOC** · versão **1.0.0** · 11/11/2026 · código analisado `f7ae44e78d011734e8cc6d7cf643a9c88d8c7457`.

| Artefato | Versão | Escopo |
|---|---|---|
| [Projeto](../projeto/ESPECIFICACAO.md) | 1.0.0 | Domínio, contratos e fluxos |
| [UML](../uml/README.md) | 1.0.0 | Diagramas do repositório |
| [Testes](../testes/PLANO_DE_TESTES.md) | 1.0.0 | Plano, evidências e lacunas |

Aumentar MAJOR para quebra de contrato/estado, MINOR para funcionalidade/caso novo e PATCH para correção de documentação. Todo PR funcional deve atualizar estes documentos e registrar execução por commit; nunca chamar cenários planejados de PASS.

## v1.1.0 — integração funcional de sessão (13/11/2026)
- Sessão restaurável, contexto organizacional vinculado ao JWT, logout específico e guardas de navegação.
- Cliente HTTP configurável, expiração 401 e cadastro organizacional retornando à seleção.
- Dez testes Node executados, build e lint locais aprovados; CI separado da publicação manual.
- Código sem deploy. Homologação em navegador/VM e entrega integral permanecem pendentes.
