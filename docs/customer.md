# Customer — Regras de Negócio

## Modos de uso

### Com conta

OAuth (Google, Facebook ou email) → completa perfil (nome, CPF, telefone) → vira `CUSTOMER`.

Benefícios:
- Endereços salvos
- Métodos de pagamento salvos
- Histórico de pedidos
- Programa de fidelidade (acúmulo e resgate de pontos)
- Preferências de notificação

### Sem conta (guest)

Faz pedido via `POST /orders/guest` informando nome, telefone, endereço e itens. Sem JWT.

- Status inicial `PENDING` resolvido automaticamente pelo servidor
- Dados de pagamento preenchidos no checkout mas **não persistidos**
- Sem histórico de pedidos
- Sem fidelidade

---

## Fluxo de pedido guest

1. `GET /tenants/slug/:slug` — encontra o tenant pelo slug (público)
2. `GET /tenants/:tenantId/products` — navega o cardápio (público)
3. `POST /orders/guest` — cria o pedido com nome + telefone + endereço + itens

### Endereço no pedido guest

O endereço pode ser informado de duas formas:

**Manual:** cliente preenche os campos diretamente (`guestZipCode`, `guestStreet`, `guestNumber`, `guestNeighborhood`, `guestCity`, `guestState`).

**Geolocalização (melhoria futura — frontend):** o frontend solicita permissão de localização do dispositivo, resolve lat/lng para endereço via API de geocoding (ex: Google Maps Geocoding API) e preenche os campos automaticamente. O backend não muda — recebe os mesmos campos de endereço independente da origem.

---

## Programa de fidelidade

Scoped por tenant via `CustomerTenant.loyaltyPoints`. Cada loja tem seu saldo independente.

| Evento | Tipo | Quem cria |
|---|---|---|
| Pedido confirmado | `EARN` | ADMIN ou SUPPORT |
| Resgate | `REDEEM` | ADMIN ou SUPPORT |
| Expiração | `EXPIRE` | ADMIN ou SUPPORT |
| Ajuste manual | `ADJUST` | ADMIN ou SUPPORT |

Configuração por tenant em `TenantSettings`: `loyaltyEnabled`, `loyaltyPointsPerOrder`, `loyaltyPointValue`.

---

## Notificações

Preferências salvas por tipo de notificação via `CustomerNotificationPreference`. Campos: `emailEnabled`, `pushEnabled`, `smsEnabled`. Upsert — cria na primeira vez, atualiza nas seguintes.

---

## Endereços

Múltiplos por customer. Campo `isPrimary` marca o endereço padrão de entrega.

---

## Métodos de pagamento

Múltiplos por customer. Campo `isDefault` marca o cartão padrão. `gatewayToken` armazena o token do gateway (ex: Pagar.me) — nunca dados brutos do cartão.
