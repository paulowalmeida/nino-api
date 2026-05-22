# Perfis de Usuário — Nino

## GlobalRole

### ADMIN
Criado diretamente via banco de dados. Sem fluxo de cadastro público. Controle total da plataforma.

### SUPPORT
Convidado por link de email pelo ADMIN. Fluxo: rota pública do invite → entra como GUEST → preenche cadastro → acesso ao backoffice com restrição de dados sensíveis. Depende de: invite + Resend.

### MERCHANT
Rota pública de cadastro. O sistema cria atomicamente: `Company` + `CompanyResponsible` + `User` + `Credential` + `Subscription`. Trial de 30 dias sem cartão.

Acesso total ao backoffice de todos os seus tenants. Em lojas sem equipe, opera sozinho todo o fluxo (pedidos, cardápio, configurações, entregas). Quando tem equipe, convida colaboradores definindo o perfil.

- Plano com tenant único → entra direto na visão da loja
- Planos com múltiplos tenants → tela de seleção de loja

**Pode convidar:** OWNER, MANAGER, STAFF

### COURIER
Autônomo independente, sem vínculo empregatício com a plataforma. Rota pública de cadastro próprio.

Vínculo com tenants via `CourierTenant`: a loja envia invite por email/link, ou o responsável associa manualmente via backoffice. Um entregador pode estar vinculado a múltiplos tenants de diferentes merchants.

A atribuição de pedidos é feita pela loja (MANAGER ou OWNER) — o entregador recebe notificação e executa. A plataforma serve como canal operacional e de registro para auditoria entre entregador e restaurante. Pagamento negociado diretamente com o restaurante.

**Acesso restrito a:** pedidos atribuídos, rota de entrega, dados do cliente, confirmação/cancelamento de entrega e histórico próprio de entregas.

### CUSTOMER
Dois modos de uso:

**Sem conta (guest):** faz pedido informando nome, telefone, endereço e itens via `POST /orders/guest`. Rota pública, sem JWT. O status inicial `PENDING` é resolvido automaticamente pelo servidor. Dados de pagamento são preenchidos no checkout mas não são persistidos (sem conta = sem histórico).

Para navegar o cardápio antes do pedido, os endpoints `GET /tenants/slug/:slug` e `GET /tenants/:tenantId/products` também são públicos.

**Com conta:** OAuth (Google, Facebook ou email) emite JWT com role `GUEST` → completa perfil obrigatório (nome, CPF, telefone) → endereço com opção de geolocalização → métodos de pagamento (opcional) → vira `CUSTOMER` → redirecionado para a loja de origem.

### GUEST
Role JWT exclusivo do fluxo OAuth incompleto. Permissão única: acessar a rota de completar perfil. Ao completar, vira `CUSTOMER`. Pedidos sem conta usam `POST /orders/guest` (rota pública) — não precisam de JWT.

---

## TenantRole

Todos os perfis abaixo são scoped por tenant via `UserTenant` — o acesso é sempre restrito à loja vinculada. Um colaborador pode ter vínculo em múltiplas lojas, mas nunca mistura visão entre elas.

### OWNER
Dono de uma loja específica. Pode ser o próprio MERCHANT ou alguém delegado via invite. Acesso total à unidade: operação, configurações e financeiro da loja — nunca da empresa como um todo.

**Pode convidar:** MANAGER, STAFF

### MANAGER
Gerente operacional de uma loja. Acesso ao dia a dia da operação sem controle financeiro ou de configurações da unidade.

**Pode convidar:** STAFF

### STAFF
Colaborador operacional genérico. Cobre qualquer função de execução (atendimento, cozinha, etc.). Sem acesso a configurações ou financeiro.

---

## Hierarquia de convites e remoção

| Quem | Pode convidar | Pode remover |
|---|---|---|
| MERCHANT | OWNER, MANAGER, STAFF | OWNER, MANAGER, STAFF |
| OWNER | MANAGER, STAFF | MANAGER, STAFF |
| MANAGER | STAFF | STAFF |
| STAFF | — | — |

Remoção segue a mesma hierarquia do convite — apenas níveis acima podem remover.

---

## Entidades de vínculo

| Vínculo | Entidade | Observação |
|---|---|---|
| Usuário ↔ Tenant | `UserTenant` | inclui TenantRole |
| Entregador ↔ Tenant | `CourierTenant` | sem role, vínculo operacional simples |
