# Controle de versões — Foodbridge-Frontend-React

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
