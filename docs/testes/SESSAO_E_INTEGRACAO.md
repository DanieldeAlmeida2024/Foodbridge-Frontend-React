# Sessão e integração web — FBR-TST-002 v1.0.0

## Testes reproduzíveis
`npm ci` → `npm run test:session` → `npm run lint` → `npm run build`.

| Caso | Evidência automatizada |
|---|---|
| Recarregar sessão ACCESS | usuário restaurado e organização correta do JWT |
| Selecionar organização | TEMP removido, ACCESS/contexto atualizados |
| Login de outra conta | contexto da conta anterior removido |
| Logout | preserva armazenamento de outras aplicações |
| Armazenamento corrompido | retorna sessão anônima sem erro de renderização |
| Tokens inválidos/expirados | recusados para restauração |
| Organização ausente no usuário | não cria sessão autenticada |
| Conta suspensa | limpa a sessão anterior |
| Vínculo/subject inválidos | contexto recusado |
| Seleção sem TEMP | não autentica |

Os dez testes foram executados no Windows com Node 24, sem conexão à produção.
O build TypeScript/Vite e o lint passaram. O checkout local não materializou inicialmente
imagens binárias; elas são preservadas no repositório. O CI precisa validar o checkout completo.

## Homologação pendente
Navegador real + API: cadastro, aprovação, TEMP/ACCESS, recarga, logout,
doação, solicitação, aprovação, coleta, voluntários, painéis e administração.
Verificar erros 400/401/403/404/409, isolamento entre organizações e estados vazios.
Não declarar homologação da VM ou dos fluxos completos apenas com build/testes de sessão.
