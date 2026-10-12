# FoodBridge API - Documentacao para Frontend

Esta documentacao resume os endpoints, autenticacao, payloads e tipos de dados usados pelo frontend React.

## Convencoes

- Base URL local sugerida: `http://localhost:8080`
- Content-Type para requests com body: `application/json`
- Datas usam ISO-8601: `YYYY-MM-DDTHH:mm:ss`, exemplo `2026-05-06T14:30:00`
- Rotas protegidas usam header:

```http
Authorization: Bearer <token>
```

## Tipos Compartilhados

### Endereco

```json
{
  "linha1": "Rua das Flores",
  "linha2": "Sala 2",
  "numero": "123",
  "cep": "01001000",
  "bairro": "Centro",
  "cidade": "Sao Paulo",
  "estado": "SP",
  "pais": "Brasil"
}
```

### JanelaHorario

Usada em doacoes para indicar os horarios disponiveis para coleta.

```json
{
  "inicio": "2026-05-06T09:00:00",
  "fim": "2026-05-06T12:00:00"
}
```

### Enums

`OrganizacaoRole`

```text
DOADOR, PRODUTOR, DISTRIBUIDOR, ONG, ADMIN
```

`StatusOrganizacao`

```text
DOCUMENTOS_PENDENTES, REVISAO, VERIFICADO, SUSPENSO, INATIVO
```

`UserStatus`

```text
PENDENTE_VERIFICACAO, VERIFICADO, SUSPENSO, INATIVO
```

`TipoDoacao`

```text
VEGETAIS, FRUTAS, GRAOS, LATICINIO, CARNE, COMIDA_PREPARADA, PADARIA, BEBIDAS, OUTROS
```

`Unidade`

```text
KG, LITRO, UNIDADE, CAIXA, LOTE
```

`StatusDoacao`

```text
RASCUNHO, PUBLICADO, DISPONIVEL, PARCIALMENTE_REIVINDICADO, TOTALMENTE_REIVINDICADO, COMPLETO, EXPIRADO, CANCELADO
```

`StatusReivindicacao`

```text
PENDENTE, APROVADO, CONCLUIDO, REJEITADO, CANCELADO
```

`StatusVoluntario`

```text
ATIVO, INATIVO, SUSPENSO
```

## Autenticacao

### Login

`POST /auth/login`

Publico.

Request:

```json
{
  "email": "usuario@email.com",
  "senha": "123456"
}
```

Response:

```json
{
  "accessToken": "jwt-ou-null",
  "tempToken": "jwt-ou-null",
  "nome": "Maria",
  "email": "usuario@email.com",
  "organizacoes": [
    {
      "organizacaoId": 1,
      "nome": "ONG Esperanca",
      "role": "ONG",
      "status": "VERIFICADO"
    }
  ],
  "status": "VERIFICADO"
}
```

Uso no frontend:

- Se vier `accessToken`, use nas rotas protegidas.
- Se vier `tempToken`, use para cadastrar ou selecionar organizacao.

### Selecionar Organizacao

`POST /auth/select-org`

Requer token temporario.

Request:

```json
{
  "usuarioId": 1,
  "organizacaoId": 10
}
```

Response:

```json
{
  "token": "access-token",
  "usuarioId": 1,
  "vinculoId": 10,
  "organizacaoId": 10,
  "role": "ONG"
}
```

## Usuarios

### Criar Usuario

`POST /usuarios`

Publico.

Request:

```json
{
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "senha": "123456",
  "status": "PENDENTE_VERIFICACAO"
}
```

Response:

```json
{
  "id": 1,
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "status": "PENDENTE_VERIFICACAO"
}
```

### Usuario Logado

`GET /usuarios/me`

Requer access token.

Response: `UsuarioResponse`.

### Organizacoes do Usuario Logado

`GET /usuarios/me/organizacoes`

Requer access token.

Response:

```json
[
  {
    "organizacaoId": 10,
    "nome": "ONG Esperanca",
    "role": "ONG",
    "status": "VERIFICADO"
  }
]
```

### Atualizar Usuario Logado

`PUT /usuarios/me`

Requer access token.

Request: igual a `POST /usuarios`.

Response: `UsuarioResponse`.

### Excluir Usuario Logado

`DELETE /usuarios/me`

Requer access token.

Response: `204 No Content`.

## Organizacoes

### Criar ou Vincular Organizacao

`POST /organizacoes`

Requer token temporario.

Request:

```json
{
  "nome": "ONG Esperanca",
  "cnpj": "12345678000199",
  "description": "Distribuicao de alimentos",
  "telefone": "11999999999",
  "email": "contato@ong.org",
  "website": "https://ong.org",
  "role": "ONG",
  "status": "REVISAO",
  "endereco": {
    "linha1": "Rua Central",
    "linha2": null,
    "numero": "100",
    "cep": "01001000",
    "bairro": "Centro",
    "cidade": "Sao Paulo",
    "estado": "SP",
    "pais": "Brasil"
  },
  "verificationDate": null
}
```

Response:

```json
{
  "id": 10,
  "nome": "ONG Esperanca",
  "cnpj": "12345678000199",
  "email": "contato@ong.org",
  "telefone": "11999999999",
  "status": "REVISAO",
  "role": "ONG",
  "usuarios": [],
  "voluntarios": [],
  "endereco": {}
}
```

### Buscar por CNPJ

`GET /organizacoes/cnpj/{cnpj}`

Requer token temporario.

Response: `OrganizacaoDTO`.

### Buscar por ID

`GET /organizacoes/{id}`

Requer access token.

Response: `OrganizacaoDTO`.

### Minha Organizacao

`GET /organizacoes/me`

Requer access token.

Response: `OrganizacaoDTO`.

### Listar Organizacoes

`GET /organizacoes`

Requer role `ADMIN`.

Response: `OrganizacaoDTO[]`.

### Atualizar Organizacao

`PUT /organizacoes/{id}`

Requer access token.

Request: `CreateUpdateOrganizacaoRequest`.

Response: `OrganizacaoDTO`.

### Inativar Organizacao

`DELETE /organizacoes/{id}`

Requer role `ADMIN`.

Response: `204 No Content`.

### Aprovar/Reprovar Usuario da Organizacao

`PATCH /organizacoes/usuarios/{vinculoId}/aprovar`

`PATCH /organizacoes/usuarios/{vinculoId}/reprovar`

Requer access token da organizacao.

Response: `204 No Content`.

## Doacoes

### DoacaoDTO

```json
{
  "tipoComida": "FRUTAS",
  "descricaoComida": "Bananas maduras para consumo",
  "quantidade": 20.0,
  "unidade": "KG",
  "dataExpiracao": "2026-05-08T18:00:00",
  "janelasDisponiveis": [
    {
      "inicio": "2026-05-06T09:00:00",
      "fim": "2026-05-06T12:00:00"
    }
  ],
  "status": "PUBLICADO",
  "endereco": {
    "linha1": "Rua Central",
    "linha2": null,
    "numero": "100",
    "cep": "01001000",
    "bairro": "Centro",
    "cidade": "Sao Paulo",
    "estado": "SP",
    "pais": "Brasil"
  },
  "organizacao": null
}
```

Observacoes:

- `quantidade` deve ser maior que zero.
- `janelasDisponiveis` deve ter pelo menos uma janela.
- Cada janela precisa ter `fim` maior que `inicio`.
- A organizacao doadora vem do token, entao o frontend pode enviar `organizacao: null`.

### Criar Doacao

`POST /doacoes`

Requer access token de organizacao doadora/produtora/distribuidora.

Request: `DoacaoDTO`.

Response: `DoacaoDTO`.

### Listar Doacoes da Organizacao Logada

`GET /doacoes`

Requer access token.

Response: `DoacaoDTO[]`.

### Buscar Doacao por ID

`GET /doacoes/{id}`

Requer access token.

Response: `DoacaoDTO`.

### Atualizar Doacao

`PUT /doacoes/{id}`

Requer access token da organizacao dona da doacao.

Request: `DoacaoDTO`.

Response: `DoacaoDTO`.

### Deletar Doacao

`DELETE /doacoes/{id}`

Requer access token da organizacao dona da doacao.

Response: `204 No Content`.

## Requisicoes de Doacao

### Criar Requisicao

`POST /requisicoes`

Requer access token de ONG.

Request:

```json
{
  "doacaoId": 1,
  "quantidadeSolicitada": 5.0,
  "observacao": "Podemos recolher pela manha."
}
```

Response:

```json
{
  "id": 1,
  "doacaoId": 1,
  "organizacaoSolicitanteId": 10,
  "organizacaoSolicitanteNome": "ONG Esperanca",
  "organizacaoDoadoraId": 20,
  "organizacaoDoadoraNome": "Mercado Bom",
  "voluntarioId": null,
  "voluntarioNome": null,
  "quantidadeSolicitada": 5.0,
  "observacao": "Podemos recolher pela manha.",
  "status": "PENDENTE",
  "statusDoacao": "PUBLICADO",
  "createdAt": "2026-05-06T10:00:00",
  "updatedAt": "2026-05-06T10:00:00",
  "respondedAt": null,
  "completedAt": null
}
```

### Minhas Requisicoes

`GET /requisicoes/minhas`

Requer access token de ONG.

Response: `RequisicaoDoacaoDTO[]`.

### Requisicoes Recebidas

`GET /requisicoes/recebidas`

Requer access token de doador/produtor/distribuidor.

Response: `RequisicaoDoacaoDTO[]`.

### Buscar Requisicao por ID

`GET /requisicoes/{id}`

Requer access token da ONG solicitante ou organizacao doadora.

Response: `RequisicaoDoacaoDTO`.

### Aprovar Requisicao com Voluntario

`PATCH /requisicoes/{id}/aprovar`

Requer access token da organizacao doadora.

Request:

```json
{
  "voluntarioId": 7
}
```

Regras:

- A requisicao precisa estar `PENDENTE`.
- O voluntario precisa existir.
- O voluntario precisa estar `ATIVO`.
- O voluntario precisa estar vinculado a ONG solicitante.

Response: `RequisicaoDoacaoDTO` com `status: "APROVADO"`.

### Rejeitar Requisicao

`PATCH /requisicoes/{id}/rejeitar`

Requer access token da organizacao doadora.

Response: `RequisicaoDoacaoDTO` com `status: "REJEITADO"`.

### Cancelar Requisicao

`PATCH /requisicoes/{id}/cancelar`

Requer access token da ONG solicitante.

Response: `RequisicaoDoacaoDTO` com `status: "CANCELADO"`.

### Concluir Recolhimento

`PATCH /requisicoes/{id}/concluir`

Requer access token da organizacao doadora.

Regras:

- A requisicao precisa estar `APROVADO`.
- A requisicao precisa ter voluntario vinculado.
- Representa a confirmacao do doador de que a doacao foi recolhida pessoalmente.

Response: `RequisicaoDoacaoDTO` com `status: "CONCLUIDO"` e `completedAt` preenchido.

## Voluntarios

### Criar ou Vincular Voluntario

`POST /voluntarios`

Requer access token da organizacao.

Request:

```json
{
  "nome": "Joao Souza",
  "telefone": "119999999999",
  "email": "joao@email.com",
  "cpf": "12345678909",
  "endereco": {
    "linha1": "Rua A",
    "linha2": null,
    "numero": "10",
    "cep": "01001000",
    "bairro": "Centro",
    "cidade": "Sao Paulo",
    "estado": "SP",
    "pais": "Brasil"
  }
}
```

Response:

```json
{
  "id": 7,
  "nome": "Joao Souza",
  "telefone": "119999999999",
  "cpf": "12345678909",
  "email": "joao@email.com",
  "endereco": {}
}
```

### Listar Voluntarios

`GET /voluntarios`

Requer access token.

Response: `VoluntarioDTO[]`.

### Buscar Voluntario por ID

`GET /voluntarios/{id}`

Requer access token.

Response: `VoluntarioDTO`.

### Atualizar Voluntario

`PUT /voluntarios/{id}`

Requer access token.

Request: `CreateUpdateVoluntario`.

Response: `VoluntarioDTO`.

### Desativar Vinculo do Voluntario com a Organizacao Logada

`PATCH /voluntarios/{id}/desativar`

Requer access token da organizacao.

Response: `204 No Content`.

## Dashboards

### Dashboard Publico

`GET /dashboards/publico`

Publico.

Response:

```json
{
  "doacoesDisponiveis": 12,
  "quantidadeDisponivel": 230.5,
  "organizacoesDoadoras": 8,
  "ongsAtivas": 5,
  "doacoesConcluidas": 40
}
```

### Dashboard Doador

`GET /dashboards/doador`

Requer access token com role `DOADOR`, `PRODUTOR` ou `DISTRIBUIDOR`.

Response:

```json
{
  "totalDoacoes": 10,
  "doacoesPublicadas": 4,
  "doacoesParciais": 2,
  "doacoesCompletas": 3,
  "requisicoesPendentes": 5,
  "coletasAguardando": 2,
  "coletasConcluidas": 7,
  "quantidadeDoada": 180.0
}
```

### Dashboard ONG

`GET /dashboards/ong`

Requer access token com role `ONG`.

Response:

```json
{
  "requisicoesPendentes": 3,
  "requisicoesAprovadas": 2,
  "requisicoesConcluidas": 9,
  "requisicoesCanceladas": 1,
  "doacoesDisponiveis": 12,
  "voluntariosAtivos": 6,
  "quantidadeRecebida": 95.0
}
```

## Admin

Todas as rotas abaixo requerem access token com role `ADMIN`.

### Organizacoes

`GET /admin/organizacoes`

Response: `OrganizacaoDTO[]`.

`GET /admin/organizacoes/pendentes`

Response: `OrganizacaoDTO[]`.

`PATCH /admin/organizacoes/{id}/aprovar`

Response: `204 No Content`.

`PATCH /admin/organizacoes/{id}/reprovar`

Response: `204 No Content`.

### Usuarios

`GET /admin/usuarios`

Response: `UsuarioDTO[]`.

`GET /admin/usuarios/pendentes`

Response: `UsuarioDTO[]`.

`PATCH /admin/usuarios/{id}/aprovar`

Response: `204 No Content`.

`PATCH /admin/usuarios/{id}/reprovar`

Response: `204 No Content`.

## Erros

O backend usa handlers globais para erros. No frontend, trate pelo menos:

- `400`: payload invalido ou regra de validacao.
- `401`: token ausente/invalido.
- `403`: usuario sem permissao ou nao verificado.
- `409`: regra de negocio violada.
- `404`: recurso nao encontrado.

Formato para `ValidationException`, `ResourceNotFoundException` e erro generico:

```json
{
  "mensagem": "Mensagem do backend",
  "codigo": 400,
  "timestamp": "2026-05-06T10:00:00"
}
```

Formato para `BusinessException`:

```json
{
  "error": "Mensagem do backend"
}
```

Erros de seguranca do Spring podem seguir outro formato padrao, por exemplo:

```json
{
  "timestamp": "2026-05-06T10:00:00",
  "status": 403,
  "error": "Forbidden",
  "path": "/rota-protegida"
}
```
