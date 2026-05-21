# Banco de Dados — Topologia e Entidades

Modelagem definida em `prisma/schema.prisma`. Colunas padrão (`id`, `createdAt`, `updatedAt`, `deletedAt`) omitidas — presentes em todas as entidades.

---

## Core B2B (SaaS)

### Lookup Tables

Gerenciadas pelo Admin Nino. Referência imutável para o restante do sistema.

- **`GlobalRole`** — `ADMIN`, `SUPPORT`, `MERCHANT`, `CUSTOMER`, `COURIER`, `GUEST`
- **`TenantRole`** — `OWNER`, `MANAGER`, `STAFF`
- **`TenantStatus`** — `CONFIGURING`, `ACTIVE`, `MAINTENANCE`, `SUSPENDED`
- **`TenantType`** — tipo de estabelecimento (Restaurante, Padaria, etc.)
- **`SubscriptionStatus`** — `TRIAL`, `ACTIVE`, `PAST_DUE`, `CANCELED`
- **`InvoiceStatus`** — `PENDING`, `PAID`, `VOID`
- **`PaymentStatus`** — `PENDING`, `APPROVED`, `FAILED`
- **`PaymentMethod`** — `PIX`, `CREDIT_CARD`, `CASH`
- **`PlanType`** — `MONTHLY`, `YEARLY`
- **`NotificationType`** — `SYSTEM`, `BILLING`, `ORDER`

### Empresas e Faturamento

- **`Company`** — raiz do cliente pagante. `companyName`, `cnpj` (Unique), `legalName`, `stateRegistration`. Flag `isActive` como master switch.
- **`CompanyResponsible`** — representante legal 1:1 com `Company`. `name`, `cpf` (Unique), `email`, `phone`.
- **`BusinessCategory`** — segmentos de mercado. Vínculo via `CompanyBusinessCategory` (N:M).
- **`Plan`** — catálogo de planos. `name`, `slug` (Unique), `price`, `maxTenants`, `maxProducts`, `maxOrders`.
- **`Subscription`** — contrato vigente 1:1 com `Company`. Liga a um `Plan` e `SubscriptionStatus`.
- **`Invoice`** — fatura de assinatura vinculada à `Company`.

### Segurança e Acesso

- **`User`** — operador humano. `isActive`, `lastLoginAt`, `locale`, `timezone`. Vínculo opcional com `Company`.
- **`Credential`** — email + senha (hashed). Chave única composta `userId + provider`. Pronto para OAuth.
- **`Session`** — sessão ativa por dispositivo. `refreshToken` (hashed), `ipAddress`, `userAgent`, `expiresAt`.
- **`UserTenant`** — vínculo `User` ↔ `Tenant` com `TenantRole`.
- **`CourierTenant`** — vínculo operacional `User(COURIER)` ↔ `Tenant`. Sem role. PK composta `(courierId, tenantId)`. Flag `isActive`.
- **`Invite`** — convite para ingressar em um `Tenant`.

### Tenant (Loja Whitelabel)

- **`Tenant`** — a loja. `slug` (Unique), `logoUrl`, `favicon`, `primaryColor`, `secondaryColor`, `customDomain` (Unique, Nullable).
- **`TenantSettings`** — configurações operacionais 1:1. `deliveryFee`, `minOrderAmount`, `deliveryRadius`, `isDeliveryEnabled`, `isPickupEnabled`, `requireAccount`, `requireCpf`, `allowGuestOrder`, `loyaltyEnabled`, `loyaltyPointsPerOrder`, `loyaltyPointValue`, `allowSharedStaff`.
- **`TenantPhone`** — telefones de contato (N por tenant).
- **`TenantPaymentMethod`** — junção `Tenant` ↔ `PaymentMethod` com flag `isActive`.
- **`OpeningHours`** — horários por dia da semana (0=Dom a 6=Sáb). `openTime`, `closeTime`, `isOpen`.

---

## Entidades Operacionais (isoladas por `tenantId`)

Todas filtradas por `tenantId` no repository. Nenhuma query retorna dados de outro Tenant.

- **`ProductCategory`** / **`Product`** / **`ProductImage`** — cardápio e imagens.
- **`ProductModifier`** / **`ProductModifierOption`** / **`ProductModifierMap`** — opcionais (tamanho, borda, etc.).
- **`Customer`** / **`CustomerAddress`** / **`CustomerTenant`** — consumidor final e vínculo por loja (com `loyaltyPoints`).
- **`CustomerPaymentMethod`** — métodos de pagamento salvos pelo consumidor.
- **`CustomerNotificationPreference`** — preferências de alerta por tipo.
- **`LoyaltyTransaction`** — histórico de crédito/débito de pontos.
- **`Order`** / **`OrderItem`** / **`OrderItemModifier`** — pedido e itens. `unitPrice` congelado no momento da compra.
- **`OrderStatus`** / **`OrderStatusHistory`** — ciclo de vida do pedido.
- **`Payment`** — pagamento vinculado ao pedido.
- **`Notification`** — alertas por `NotificationType`.
