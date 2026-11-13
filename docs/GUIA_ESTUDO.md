# FoodBridge React — guia de estudo e preparação para entrevista

> **FB-WEB-ESTUDO-001 · 13/11/2026.** Estruturado a partir dos arquivos reais do React, dos testes de sessão e do CI/CD homologado.

## Objetivo de aprendizagem

Compreender como uma SPA React implementa fluxos distintos para usuários e organizações, gerencia sessão JWT, integra API REST, constrói interfaces de cadastro e gestão e entrega artefatos estáticos com CI/CD por SSH. A API Kotlin não está neste repositório; estudar em paralelo a [arquitetura backend](https://github.com/DanieldeAlmeida2024/FoodBridge-API-Kotlin/blob/main/docs/ARQUITETURA_ATUAL.md).

## Trilha por aula

| Aula | Conteúdo | Arquivos | Prática |
|---|---|---|---|
| 1 | Inicialização do React/Vite | `src/main.tsx`, `src/App.tsx`, `vite.config.ts` | Rastrear montagem da aplicação |
| 2 | Rotas e proteção | `src/routes/AppRoutes.jsx`, `ProtectedRoute.tsx` | Desenhar matriz de papéis para 10 rotas |
| 3 | Contexto e sessão | `src/auth/session.ts`, `AuthContext.tsx` | Simular ACCESS, TEMP, expiração, logout e troca de org |
| 4 | Cliente API | `src/api/client.js`, `usePublicDashboard.js` | Identificar baseURL, timeout e interceptors |
| 5 | Fluxos sociais | `Donations.jsx`, `Requests.jsx`, `Volunteers.jsx` | Explicar criação, requisição, aprovação e coleta |
| 6 | Componentização e UX | `components/layout/`, `components/ui/`, `theme.ts` | Comparar controles compartilhados, acessibilidade e estilos |
| 7 | Teste e entrega | `tests/session.test.ts`, `tests/ci/`, `deploy/oracle/` | Executar CI local, estudar deploy e explicar HTTP 403 corrigido |

## Tópicos para dominar

**JWT no browser.** `session.ts` lê claims apenas para decidir estado de UI, sem validar assinatura. O backend aplica autenticação/autorizações reais. `AuthContext` atualiza usuário em login, seleção, logout e evento `foodbridge:session-expired`.

**Rotas.** `ProtectedRoute` distingue TEMP (cadastro/seleção) de ACCESS (dashboard/gestão) e restringe `/voluntarios` a ONG e `/admin` a ADMIN.

**Erro 401.** O Axios remove dados de sessão do app e informa a UI quando servidor exige nova autenticação. Erros HTTP precisam de tratamento visual e não devem exibir conteúdo sensível.

**Dados assíncronos.** `usePublicDashboard` usa AbortController, estados loading/error, e atualização manual via contador de revisão.

**Formulários.** Cadastro, organização, doação e voluntários têm validação/feedback; a API permanece responsável por validar tipo, status, quantidades e permissões.

**Integrações.** `VITE_API_BASE_URL` controla o cliente Axios; `Register.tsx` usa fetch relativo, uma divergência a corrigir. ViaCEP é chamado no preenchimento de doação e pode falhar sem impedir fluxo principal.

**Operação.** Vite gera `dist`; GitHub Actions testa, compila e envia para Nginx. Corrigimos incidente real 403 ao normalizar as permissões estáticas 0755/0644 e exigir health antes do PASS.

## Exercício: rodar a UI local

Requer Node.js 24 (compatível com a configuração de CI), dependências instaláveis e uma API acessível em ambiente de desenvolvimento.

```bash
npm ci
npm run dev
npm run test:session
npm run lint
npm run build
```

Para apontar a API, configurar `VITE_API_BASE_URL` no ambiente Vite ou proxy local conforme necessidade; **não copiar secrets do servidor**. Não dirigir testes de mutação para banco produtivo.

## Perguntas comuns

**“O que diferencia frontend de backend na autorização?”** O guard melhora navegação e apresentação; somente API pode garantir autorização por token, status e organização.

**“Por que a página de login pode redirecionar para duas telas?”** O sistema distingue token temporário, que ainda precisa de organização selecionada/cadastrada, de token ACCESS de sessão organizacional.

**“Quais problemas aparecem com localStorage?”** A exposição a XSS; política CSP, autenticação segura, rotacionar tokens e eventual migração para cookies HttpOnly precisam ser avaliados.

**“O que aconteceu com HTTP 403?”** O diretório de staging criado com `umask 077` ficou privado quando movido para `dist`; Nginx não conseguia lê-lo. O script agora normaliza permissões e valida HTTP local antes de finalizar.

**“Qual o significado do CI/CD automático?”** Mudanças de código na `main` geram novo build, testes, publicação via SSH e confirmação de saúde; o primeiro run automático aprovado está [aqui](https://github.com/DanieldeAlmeida2024/Foodbridge-Frontend-React/actions/runs/43465805656).

**“A interface já cobre 100% do sistema?”** Existem dez rotas e telas principais, mas falta comprovação de todos os 50 contratos HTTP em navegador real, acessibilidade, HTTPS e segurança integral de sessão.

## Checklist de estudo

- [ ] Reproduzir a navegação dos perfis TEMP/ACCESS, ONG e ADMIN.
- [ ] Explicar as responsabilidades de `AuthContext`, `ProtectedRoute` e `session.ts`.
- [ ] Encontrar o Axios interceptor que adiciona Bearer e limpa sessão em 401.
- [ ] Desenhar uma tela de requisição doação ligada ao controller correspondente.
- [ ] Explicar por que `/doacoes/publicadas` não é parte do contrato atual.
- [ ] Listar os dados pessoais exibidos e como restringir seu acesso.
- [ ] Executar `npm run test:session`, lint e build no ambiente local.
- [ ] Mostrar o log de CD aprovado e a proteção de rollback em 3 minutos.

Leitura complementar: [catálogo das telas](RECURSOS_E_TELAS.md), [arquitetura](ARQUITETURA_FRONTEND_ATUAL.md), [roteiro de apresentação](APRESENTACAO_FRONTEND.md) e [guia full-stack do backend](https://github.com/DanieldeAlmeida2024/FoodBridge-API-Kotlin/blob/main/docs/GUIA_ESTUDO.md).
