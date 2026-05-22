# Perfis de Usuário — Nino API

## GlobalRole

| Role | Cadastro | Descrição |
|---|---|---|
| `ADMIN` | Via banco | Controle total da plataforma |
| `SUPPORT` | Invite por email (ADMIN) | Backoffice com restrição de dados sensíveis |
| `MERCHANT` | Rota pública | Cria `Company` + `Subscription` atomicamente. Trial 30 dias |
| `COURIER` | Rota pública | Autônomo. Vínculo com tenants via `CourierTenant` |
| `CUSTOMER` | OAuth → completa perfil | Consumidor final com conta |
| `GUEST` | JWT temporário OAuth | Permissão única: completar perfil → vira `CUSTOMER` |

## TenantRole

Scoped por tenant via `UserTenant`.

| Role | Acesso |
|---|---|
| `OWNER` | Total na unidade (operação + config + financeiro) |
| `MANAGER` | Operação do dia a dia. Sem config/financeiro |
| `STAFF` | Execução. Sem config/financeiro |

## Hierarquia de convites

| Quem | Pode convidar | Pode remover |
|---|---|---|
| MERCHANT | OWNER, MANAGER, STAFF | OWNER, MANAGER, STAFF |
| OWNER | MANAGER, STAFF | MANAGER, STAFF |
| MANAGER | STAFF | STAFF |
| STAFF | — | — |

## Endpoints públicos (sem JWT)

| Endpoint | Motivo |
|---|---|
| `POST /orders/guest` | Pedido sem conta |
| `GET /tenants/slug/:slug` | Browse do cardápio |
| `GET /tenants/:id/products` | Browse do cardápio |
