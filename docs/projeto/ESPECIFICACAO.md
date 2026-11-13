# FoodBridge Web — especificação do frontend

FBR-WEB · v1.1.0 · integração funcional de 13/11/2026.

## Escopo funcional
React/Vite para cadastro, login, organização, seleção de contexto, doações,
requisições/coletas, voluntários, indicadores e administração. A API Kotlin
valida assinatura, vínculo e autorização; a UI não substitui essas verificações.

## Sessão e contexto
`src/auth/session.ts` centraliza as chaves FoodBridge e a restauração síncrona.
Login ACCESS seleciona a organização indicada no JWT, mesmo quando não é a primeira
da lista. Login TEMP remove qualquer contexto organizacional anterior.
A seleção atualiza armazenamento e AuthContext, remove TEMP e exige o mesmo usuário
da sessão temporária. O logout preserva chaves de outras aplicações.
JWT expirado/malformado ou JSON inválido não restauram uma sessão autenticada.
A decodificação no navegador serve somente à UI; assinatura e permissões ficam na API.
Tokens continuam em localStorage; mitigação de XSS e evolução para sessão segura permanecem trabalhos próprios.

## Navegação
Cadastro e login são públicos. Organização e seleção exigem TEMP; dashboard,
doações e requisições exigem ACCESS; voluntários exigem ONG; administração exige ADMIN.
As guardas são conveniência de navegação e não autorização de dados.
Após cadastrar organização, a UI atualiza a lista e mostra o estado pendente na seleção.

## Cliente HTTP e implantação
Axios aceita `VITE_API_BASE_URL` (padrão relativo ao mesmo origin), timeout de 30 s,
respeita Authorization explícito e encerra sessão ao receber 401.
Nginx deve encaminhar as rotas da API Kotlin e fornecer fallback SPA.
O novo workflow CI testa sessão, lint e build em pull requests.
O deploy requer execução manual na main, `deploy=true`, environment
`oracle-production` e `VM_DEPLOY_ENABLED=true`; alterações na main não publicam automaticamente.

## Validação
Dez testes de sessão, TypeScript/Vite build e ESLint passaram localmente.
CI desta branch ainda deve ser conferido. Nenhum teste em navegador real,
deploy Nginx ou fluxo completo com a VM foi executado nesta revisão.
Gestão de membros não-ADMIN, cobertura das telas e os 165 cenários do backend
não são declarados completos por estes resultados.

## Perfil completo — v1.2.0 (proposta)
A rota ACCESS `/perfil` consulta e atualiza nome, e-mail e senha em `/usuarios/me`.
Senha vazia é omitida; nome/e-mail são obrigatórios na interface. Sucesso atualiza AuthContext.
A exclusão exige confirmação da própria pessoa, remove a conta/vínculos via API e encerra sessão;
organizações são preservadas. Não há execução de exclusão pelo agente nesta revisão.
Depende da correção da API [PR #12](https://github.com/DanieldeAlmeida2024/FoodBridge-API-Kotlin/pull/12).
CI de build/lint/sessão pendente desta branch; navegador e VM ainda precisam de homologação.
