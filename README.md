# Nino Delivery — nino-api

## Sumário

* [1. Visão Geral e Modelo de Negócio](#1-visão-geral-e-modelo-de-negócio)
* [2. Arquitetura Geral](#2-arquitetura-geral)
* [3. Stack](#3-stack)
* [4. Estrutura de Pastas](#4-estrutura-de-pastas)
* [5. Catálogo de Módulos](#5-catálogo-de-módulos)
* [6. Segurança, Autenticação e Autorização](#6-segurança-autenticação-e-autorização)
* [7. RBAC — Guards por Role](#7-rbac--guards-por-role)
* [8. Status dos Módulos](#8-status-dos-módulos)
* [9. Roadmap](#9-roadmap)
* [10. Variáveis de Ambiente](#10-variáveis-de-ambiente)
* [11. Infraestrutura & Hospedagem](#11-infraestrutura--hospedagem)
* [12. Docker & Desenvolvimento Local](#12-docker--desenvolvimento-local)
* [13. Referências](#13-referências)
* [14. Contribuição & Commits](#14-contribuição--commits)

---

## 1. Visão Geral e Modelo de Negócio

### Identidade e Conceito

O **Nino** é uma plataforma SaaS voltada para o mercado de alimentação (restaurantes, lanchonetes, padarias e similares). Opera sob o modelo **White-Label B2B**: o consumidor final nunca interage com a marca "Nino" — toda a interface é personalizada com a identidade do restaurante contratante.

### Monetização

- **Zero comissão** — o restaurante retém 100% das vendas
- **Assinatura fixa** — receita gerada exclusivamente por mensalidades
- **Foco inicial** — Norte do Brasil (Estado do Pará)

### Planos

| Plano | Valor | Tenants | Pedidos/mês |
|---|---|---|---|
| Iniciante | R$ 97,00 | 1 | 200 |
| Profissional | R$ 197,00 | 3 | Ilimitados |
| Rede | Sob consulta | 4+ | Ilimitados |

### Ciclo de Vida do Cliente

- **Trial:** 30 dias gratuitos, sem cartão. Gatilhos de renovação nos dias 15, 25 e 29.
- **Adimplente:** acesso total.
- **Atraso 3 dias:** Dashboard suspenso; site de vendas continua.
- **Atraso 5 dias:** Site entra em modo `MAINTENANCE`.
- **Inativo:** `isActive = false` na `Company` invalida todos os tokens JWT.

---

## 2. Arquitetura Geral

### Multi-Tenant (Row-Level Isolation)

Todas as entidades operacionais carregam `tenantId` como FK. Toda query é filtrada por ele na camada de repositório. Schema `public` único — sem schema-per-tenant.

- **Entidades de plataforma:** `Company`, `Plan`, `Subscription`, `User`, `Credential`, `Session`, roles e domínios estáticos
- **Entidades operacionais:** `Tenant`, `Product`, `Order`, `Customer` e relacionados — todas com `tenantId`

> Topologia completa do banco: [`docs/database.md`](docs/database.md)

### Camadas (Strict 3-Tier)

| Camada | Responsabilidade |
|---|---|
| **Controller** | Roteamento HTTP, guards, extração de headers/params, delegação ao service |
| **Service** | Regras de negócio, orquestração de fluxos |
| **Repository** | Única camada autorizada a usar `PrismaService` |

> Padrões arquiteturais detalhados, fluxos e trade-offs: [`docs/architecture.md`](docs/architecture.md)

### Defesas na Borda

- `ExceptionFilter` global — erros Prisma não vazam no JSON de resposta
- `ValidationPipe` global — `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`

---

## 3. Stack

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js LTS + TypeScript 5.7 |
| Framework | NestJS v11 |
| Banco de dados | PostgreSQL v16 (Docker em dev) |
| ORM | Prisma v7.8 + `@prisma/adapter-pg` |
| Auth | JWT (access 15min + refresh 7d) + Passport.js + bcrypt |
| Validação | class-validator + class-transformer |
| Rate limiting | @nestjs/throttler v6.5 |
| Health check | @nestjs/terminus |
| Documentação | @nestjs/swagger — disponível em `/api/docs` |
| Testes | Jest v30 + ts-jest + Supertest |
| Linting | ESLint v9 + Prettier |
| Infra local | Docker + Docker Compose |

**Omissões deliberadas no MVP:** Redis, BullMQ, storage de imagens (S3/R2).

---

## 4. Estrutura de Pastas

```text
nino-api/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── config/database/           # PrismaService e seed
│   ├── mocks/                     # CNPJs e usuários fake para dev
│   ├── modules/
│   │   ├── auth/
│   │   ├── company/
│   │   │   └── modules/           # business-category, company-business-category, company-responsible
│   │   ├── customer/
│   │   │   └── modules/           # address, notification-preference, payment-method, tenant, loyalty
│   │   ├── global-role/
│   │   ├── health/
│   │   ├── invoice-status/
│   │   ├── notification-type/
│   │   ├── payment-method/
│   │   ├── plan/
│   │   │   └── modules/plan-type/
│   │   ├── product/
│   │   │   └── modules/product-category/
│   │   ├── session/
│   │   ├── subscription-status/
│   │   ├── tenant/
│   │   │   └── modules/           # opening-hours, payment-method, phone, settings, status, type
│   │   ├── tenant-role/
│   │   └── user/
│   │       └── modules/           # credential, user-tenant
│   └── shared/
│       ├── decorators/            # @Roles
│       ├── enums/                 # GlobalRole, TenantRole, status enums
│       ├── guards/                # JwtAuthGuard, RolesGuard
│       ├── interceptors/          # LoggingInterceptor
│       ├── interfaces/            # IBaseRepository, IBaseModel
│       ├── modules/common/        # CommonModule.forFeature() — lookup tables
│       ├── repositories/base/     # BaseRepository<T>
│       ├── services/              # error, pagination, password, prisma, token, cnpj
│       ├── strategies/            # JwtAuthStrategy
│       ├── types/                 # AuthRequest, PaginatedResponse, tipos do BaseRepository
│       └── validators/            # CnpjValidator
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── docs/                          # Arquitetura, banco, decisões
└── test/                          # Testes E2E
```

---

## 5. Catálogo de Módulos

### Plataforma (SaaS)

#### `auth`
Login, register, refresh, logout e `me`. Access Token (15min) + Refresh Token (7d, hasheado no banco). Estratégias `JwtAuthStrategy` e `JwtRefreshStrategy` via Passport.

#### `user`
Usuários operadores. CRUD com vínculo a `GlobalRole` e `Company`. Sub-módulos: `credential`, `user-tenant`.

#### `user → credential`
Credenciais de acesso. Provider `local` (email/senha), pronto para OAuth. Hash via `PasswordService`.

#### `user → user-tenant`
Vínculo `User` ↔ `Tenant` com `TenantRole`. Suporta múltiplos tenants por usuário.

#### `session`
Sessões ativas por dispositivo. Permite logout remoto e "logout de todos os dispositivos".

#### `company`
Empresas clientes do SaaS. Agrupa tenants, usuários, assinatura. Possui activate/deactivate (master switch). Sub-módulos: `business-category`, `company-business-category`, `company-responsible`.

#### `company → company-responsible`
Representante legal 1:1 com `Company`. Busca por `id` ou CPF.

#### `company → business-category`
Segmentos de mercado. Lookup table gerenciada pelo Admin.

#### `company → company-business-category`
Junção `Company` ↔ `BusinessCategory`. Vínculo, desvínculo, ativar/desativar.

#### `plan`
Catálogo de planos com limites físicos (`maxTenants`, `maxProducts`, `maxOrders`). Sub-módulo: `plan-type`.

---

### Lookup Tables

Todos usam `CommonModule.forFeature(modelKey, entityName)`. Gerenciados exclusivamente pelo Admin.

`global-role` · `tenant-role` · `tenant-status` · `tenant-type` · `subscription-status` · `invoice-status` · `payment-method` · `notification-type`

---

### Tenant (Operacional)

#### `tenant`
Loja whitelabel. Identidade visual, domínio customizado, status operacional. Sub-módulos: `opening-hours`, `tenant-payment-method`, `tenant-phone`, `tenant-settings`, `tenant-status`, `tenant-type`.

#### `tenant → opening-hours`
Horários por dia da semana (0=Dom a 6=Sáb).

#### `tenant → tenant-payment-method`
Métodos de pagamento habilitados por loja. Soft delete por chave composta `tenantId_methodId`.

#### `tenant → tenant-phone`
Telefones de contato. Múltiplos por tenant.

#### `tenant → tenant-settings`
Configurações operacionais (delivery, pickup, fidelidade). Upsert: cria na primeira vez, atualiza nas seguintes.

---

### Customer (Consumidor Final)

#### `customer`
Dados pessoais do consumidor. Sub-módulos: `customer-address`, `customer-notification-preference`, `customer-payment-method`, `customer-tenant`, `loyalty-transaction`.

#### `customer → customer-tenant`
Vínculo consumidor ↔ loja com acúmulo de `loyaltyPoints`.

#### `customer → loyalty-transaction`
Histórico de crédito/débito de pontos de fidelidade.

---

### Produto

#### `product`
Cardápio da loja. Sub-módulo: `product-category`.

#### `product → product-category`
Categorias do cardápio scoped por `tenantId`, ordenadas por `position`.

---

### Infraestrutura Compartilhada (`shared/`)

#### `BaseRepository`
Abstração genérica. Provê: `findAll`, `findAllPaginated`, `findItem`, `exists`, `insert`, `updateItem`, `softDelete`, `deleteMany`. Integra `ErrorService` e `PaginationService`.

#### `CommonModule`
Módulo dinâmico para lookup tables. `CommonModule.forFeature(modelKey, entityName)` instancia `CommonRepository` + `CommonService` genéricos.

#### `ErrorService`
Mapeia Prisma → NestJS: `P2025→NotFoundException`, `P2002→ConflictException`, `P2003/P2014→BadRequestException`.

---

## 6. Segurança, Autenticação e Autorização

### Dual-Token System

| Token | TTL | Transporte |
|---|---|---|
| Access Token | 15 min | Header `Authorization: Bearer` |
| Refresh Token | 7 dias | Cookie HttpOnly (hasheado no banco) |

O Refresh Token é hasheado antes de persistir na `Session`. Logout remoto = deletar o registro de sessão.

### Payload do JWT

```typescript
{
  sub: string,    // UUID do usuário
  role: string,   // GlobalRole (ex: 'ADMIN', 'MERCHANT')
  iat: number,
  exp: number
}
```

---

## 7. RBAC — Guards por Role

Todo controller usa `@UseGuards(JwtAuthGuard, RolesGuard)`. Role extraído do JWT — sem consulta ao banco.

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  @Get()
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT)
  getAll() { ... }
}
```

### Matriz de Permissões

Roles: `ADMIN` = `GlobalRole.ADMIN` · `SUPPORT` = `GlobalRole.SUPPORT` · `MERCHANT` = `GlobalRole.MERCHANT`

| Endpoint | ADMIN | SUPPORT | MERCHANT |
|---|:---:|:---:|:---:|
| `GET /users` | ✓ | ✓ | — |
| `GET /users/:id` | ✓ | ✓ | ✓ |
| `POST /users` | ✓ | — | — |
| `PATCH /users/:id` | ✓ | ✓ | ✓ |
| `DELETE /users/:id` | ✓ | — | — |
| `GET /companies` | ✓ | ✓ | — |
| `GET /companies/:id` | ✓ | ✓ | ✓ |
| `POST /companies` | ✓ | ✓ | — |
| `PUT /companies/:id` | ✓ | ✓ | — |
| `DELETE /companies/:id` | ✓ | — | — |
| `PATCH /companies/:id/activate` | ✓ | ✓ | — |
| `PATCH /companies/:id/deactivate` | ✓ | ✓ | — |
| `* /company-responsibles` | ✓ | ✓ | — |
| `GET /business-categories` | ✓ | ✓ | ✓ |
| `POST/PUT/DELETE /business-categories` | ✓ | — | — |
| `GET /plans` | ✓ | ✓ | ✓ |
| `POST/PATCH/DELETE /plans` | ✓ | — | — |
| `GET /global-roles` | ✓ | ✓ | — |
| `POST/PUT/DELETE /global-roles` | ✓ | — | — |
| `GET /tenant-roles` | ✓ | ✓ | ✓ |
| `POST/PUT/DELETE /tenant-roles` | ✓ | — | ✓ |
| `GET /subscription-statuses` | ✓ | ✓ | ✓ |
| `POST/PUT/DELETE /subscription-statuses` | ✓ | — | — |
| `POST /user-tenants` | ✓ | ✓ | — |
| `GET /user-tenants/user/:userId` | ✓ | ✓ | ✓ |
| `DELETE /user-tenants/:userId/:tenantId` | ✓ | ✓ | — |
| `GET /sessions/list-by-user-id/:userId` | ✓ | ✓ | — |
| `DELETE /sessions/:id` | ✓ | ✓ | — |

> Lista completa de endpoints: `/api/docs` (Swagger)

---

## 8. Status dos Módulos

**Última atualização:** Maio 2026 · **Desenvolvedor:** Paulo (Solo) · **Status:** MVP ~75%

| Módulo | Status |
|---|---|
| auth | ✅ |
| user | ✅ |
| credential | ✅ |
| session | ✅ |
| global-role | ✅ |
| tenant-role | ✅ |
| user-tenant | ✅ |
| courier-tenant | ✅ |
| company | ✅ |
| company-responsible | ✅ |
| business-category | ✅ |
| company-business-category | ✅ |
| plan | ✅ |
| plan-type | ✅ |
| subscription-status | ✅ |
| invoice-status | ✅ |
| payment-method | ✅ |
| notification-type | ✅ |
| tenant-status | ✅ |
| tenant-type | ✅ |
| tenant | ✅ |
| tenant-settings | ✅ |
| tenant-payment-method | ✅ |
| tenant-phone | ✅ |
| opening-hours | ✅ |
| product | ✅ |
| product-category | ✅ |
| customer | ✅ |
| customer-address | ✅ |
| customer-payment-method | ✅ |
| customer-tenant | ✅ |
| customer-notification-preference | ✅ |
| loyalty-transaction | ✅ |
| health | ✅ |
| mocks | ✅ |
| invite | ⏳ |
| subscription | ⏳ |
| order / order-status | ⏳ |
| payment | ⏳ |
| notification | ⏳ |
| billing | ⏳ |

---

## 9. Roadmap

### Curto prazo

- [ ] `POST /auth/forgot-password` + `POST /auth/reset-password` (depende Resend)
- [ ] Testes completos para todos os módulos

### Médio prazo

- [ ] Módulo Tenant (CRUD + row-level isolation + middleware de identificação)
- [ ] Rate limiting com Redis
- [ ] BullMQ — filas para email, WhatsApp, push

### MVP completo

- [ ] Cardápio completo (produto, categoria, modificador)
- [ ] Módulo Order + histórico
- [ ] Integração Pagar.me (split payments, webhooks)
- [ ] Delivery: rastreamento real-time (SSE)
- [ ] Notifications: Resend, Z-API, FCM
- [ ] Analytics: PostHog

---

## 10. Variáveis de Ambiente

```env
# Docker
CONTAINER_NAME=container_name

# Banco de dados
DB_USER=username_db
DB_PASSWORD=password_db
DB_NAME=database_name
DB_HOST=127.0.0.1
DB_PORT=5432
DB_URL=postgresql://DB_USER:DB_PASSWORD@DB_HOST:DB_PORT/DB_NAME?schema=public

# JWT
JWT_SECRET=seu-secret-access-token
JWT_REFRESH_SECRET=seu-secret-refresh-token

# Servidor
PORT=3000
NODE_ENV=development

# Planejado
RESEND_API_KEY=re_xxxxx
Z_API_TOKEN=xxxxx
PAGARME_API_KEY=xxxxx
FIREBASE_CREDENTIALS_JSON={ ... }
R2_ACCESS_KEY_ID=xxxxx
R2_SECRET_ACCESS_KEY=xxxxx
R2_BUCKET_NAME=nino-files
```

---

## 11. Infraestrutura & Hospedagem

### Fly.io (Produção)

| Serviço | Plano | Custo/mês |
|---|---|---|
| NestJS API | shared-cpu-1x, 512MB | ~$3 |
| Postgres gerenciado | Fly Postgres | ~$3 |
| Next.js SSR | shared-cpu-1x, 256MB | ~$2–3 |
| **Total** | | **~$8–9** |

**Domínios customizados:** campo `customDomain` no `Tenant` + Fly.io Certificates API para SSL dinâmico. O `TenantInterceptor` resolve o `tenantId` pelo domínio em cada requisição.

---

## 12. Docker & Desenvolvimento Local

```bash
# Banco de dados
npm run docker:up-d         # Inicia em background
npm run docker:down-d       # Para em background

# Prisma
npm run prisma:generate     # Gera client
npm run prisma:migrate      # Cria migration
npm run prisma:seed         # Popula dados iniciais
npm run prisma:reset        # Reset completo

# Servidor
npm run start:dev           # Watch mode
npm run build && npm run start:prod

# Testes
npm test
npm run test:watch
npm run test:cov
npm run test:e2e
```

---

## 13. Referências

- [NestJS](https://docs.nestjs.com)
- [Prisma](https://www.prisma.io/docs)
- [Passport.js](http://www.passportjs.org)
- [class-validator](https://github.com/typestack/class-validator)
- [Jest](https://jestjs.io)
- [Fly.io](https://fly.io/docs)

---

## 14. Contribuição & Commits

### Branches

- `main` → Produção
- `develop` → Staging
- `feature/nome-feature` → Features

### Padrão de Commits

```
feat(auth): implementar login com JWT
fix(user): corrigir validação de role
test(credentials): adicionar testes para updatePassword
refactor(repository): extrair queries em helpers
```
