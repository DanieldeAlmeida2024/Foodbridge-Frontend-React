# Plano de testes — Foodbridge-Frontend-React

- CT-01 Estrutural: documentos e UML encontrados (teste Python abaixo).
- CT-02 Build/teste nativo: `npm run build`, com ambiente configurado.
- CT-03 Negativo: entradas inválidas e indisponibilidade de dependências.
- CT-04 Integração: validar acessos externos, autenticação e persistência conforme a stack.
- CT-05 Segurança: confirmar ausência de dados sensíveis em logs e artefatos.

Teste **somente documental**: `python -m unittest discover -s tests -p test_documentacao.py -v`.

CT-02 a CT-05 não são aprovados pelo teste de documentos. A implantação Oracle Cloud exige secrets e infraestrutura; os dois deploys observados em outubro de 2026 falharam. O motivo não foi identificado apenas pela conclusão dos runs.
