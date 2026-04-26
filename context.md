# Ninomia Delivery — nino-api Context (v3.0)

## 📋 Visão Geral do Projeto

**Ninomia Delivery** é uma plataforma SaaS **white-label** de delivery para restaurantes, lanchonetes e estabelecimentos de alimentação. Modelo B2B com cobrança por **mensalidade fixa** (zero comissão por pedido). O cliente final nunca vê o nome "Ninomia" — cada restaurante tem sua marca própria.

- **Mercado inicial:** Norte do Brasil (Pará)
- **MVP estimado:** 3-6 meses (desenvolvimento solo)
- **Status atual:** Backend ~45% (auth completo, user/credentials modularizados, 7 módulos de API)
- **Origem do nome:** Fusão de Nino (gato) + Mia (cachorra) — pets da família fundadora

---

## 🏗️ Arquitetura Geral

### Modelo Multi-Tenant com Schema-per-Tenant (Planejado)

A arquitetura adota isolamento por schema PostgreSQL:

- Todos os restaurantes compartilham a mesma instância do banco
- Cada restaurante possui seu próprio schema isolado → segurança garantida por design
- Impossível vazar dados entre tenants mesmo com vulnerabilidades no código
- Facilita backup/restore por cliente
- Escalável sem custo de múltiplos bancos de dados
- Padrão adotado por Shopify e outras grandes SaaS

### Componentes Principais

| Camada              | Tecnologia          | Função                                                                                      |
| ------------------- | ------------------- | ------------------------------------------------------------------------------------------- |
| **Backend**         | NestJS + TypeScript | Monolito MVP; API REST com autenticação JWT; processamento de negócio                       |
| **Banco de dados**  | PostgreSQL + Prisma | Persistência com schema-per-tenant; migrations tipadas; Prisma Accelerate para pooling      |
| **Cache & Filas**   | Redis + BullMQ      | Cache de dados frequentes; processamento assíncrono de emails, WhatsApp, push notifications |
| **Frontend Web**    | Next.js (PWA)       | Interface cliente final + painel restaurante; SSR; PWA para instalação sem App Store        |
| **Frontend Mobile** | React Native (Expo) | App do entregador (Android/iOS); build na nuvem sem Mac necessário                          |
| **Storage**         | Cloudflare R2       | Fotos de cardápio, logos, arquivos; zero custo de egress                                    |
| **CDN**             | Cloudflare          | Distribuição global; cache em edge; DNS + WAF                                               |
| **CI/CD**           | GitHub Actions      | Testes automatizados; build; deploy contínuo                                                |
| **Infraestrutura**  | Railway (PaaS)      | NestJS, PostgreSQL, Redis hospedados; SSL automático; escalabilidade gerenciada             |

---

## 🖥️ Stack Técnico Detalhado

### Runtime & Framework

- **Node.js** + **TypeScript** — Type safety end-to-end
- **NestJS** (v11) — Framework opinionado com injeção de dependência, decorators, estrutura modular
- **express** (abstrato via NestJS)

### Banco de Dados & ORM

- **PostgreSQL** (v14+) — Banco relacional com suporte a Row Level Security (RLS)
- **Prisma ORM** (v7.4.1) — Query builder tipado; migrations automáticas; Zod generation
- **Prisma Accelerate** (~$10/mês) — Connection pooling gerenciado; essencial para multi-tenant

### Autenticação & Segurança

- **JWT (JSON Web Tokens)** — Stateless; access token 15min + refresh token 7 dias
- **Passport.js** (v0.7) — Estratégias de autenticação plugáveis
- **bcrypt** (v6) — Hashing de senhas e refresh tokens
- **@nestjs/jwt** + **@nestjs/passport** — Integração nativa NestJS
- **Rate limiting** (@nestjs/throttler v6.5) — Proteção contra força bruta e abuse
- **Helmet** — Headers HTTP de segurança automáticos (CSP, XSS, MIME sniffing)
- **CORS** — Apenas domínios \*.ninomia.com

### Validação de Dados

- **class-validator** + **class-transformer** — DTOs com validação declarativa
- **ValidationPipe global** — `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`
- **Zod** (via zod-prisma-types) — Schemas de validação tipados gerados do Prisma schema

### Filas & Processamento Assíncrono (Planejado)

- **Redis** — Broker de filas; cache em memória
- **BullMQ** — Filas robustas para emails, WhatsApp, push notifications, alertas

### Testes

- **Jest** (v30) — Framework de testes com cobertura automática
- **ts-jest** — Transformação TypeScript → JavaScript em testes
- **supertest** (v7) — HTTP assertions para testes de integração

### Linting & Formatação

- **ESLint** (v9.18) — Análise estática de código com regras personalizadas
- **Prettier** (v3.4.2) — Formatação automática de código
- **eslint-config-prettier** — Evita conflitos entre ESLint e Prettier

### Dependências de Produção Principais

```json
{
  "@nestjs/common": "^11.0.1",
  "@nestjs/config": "^4.0.3",
  "@nestjs/core": "^11.0.1",
  "@nestjs/jwt": "^11.0.2",
  "@nestjs/passport": "^11.0.5",
  "@nestjs/platform-express": "^11.0.1",
  "@nestjs/throttler": "^6.5.0",
  "@prisma/client": "^7.4.1",
  "bcrypt": "^6.0.0",
  "class-validator": "^0.15.1",
  "class-transformer": "^0.5.1",
  "passport": "^0.7.0",
  "passport-jwt": "^4.0.1"
}
```

---

## 📁 Estrutura de Pastas

```
nino-api/
├── src/
│   ├── main.ts                          # Entry point da aplicação
│   ├── app.module.ts                    # Root module com todos os módulos importados
│   ├── app.controller.ts                # Controller raiz
│   ├── app.service.ts                   # Service raiz
│   │
│   ├── auth/                            # ✅ Módulo de autenticação (100% completo)
│   │   ├── auth.module.ts               # Imports JwtModule, Passport strategies, guards
│   │   ├── auth.controller.ts           # POST /auth/* — login, logout, refresh, change-password
│   │   ├── auth.service.ts              # Lógica: login, logout, refreshToken, changePassword
│   │   │
│   │   ├── guards/
│   │   │   └── jwt-refresh.guard.ts     # Guard para refresh-token endpoint
│   │   │
│   │   ├── strategies/
│   │   │   └── jwt-refresh.strategy.ts  # Passport strategy para JWT refresh
│   │   │
│   │   ├── dtos/
│   │   │   ├── login-request.dto.ts            # { email, password }
│   │   │   ├── change-password-request.dto.ts  # { oldPassword, newPassword }
│   │   │   └── refresh-token.dto.ts            # { refreshToken }
│   │   │
│   │   └── types/
│   │       ├── login-response.type.ts          # { user, tokens }
│   │       ├── tokens.type.ts                  # { accessToken, refreshToken }
│   │       ├── auth-credential-repository.type.ts
│   │       ├── auth-credential-refresh-token.type.ts
│   │       └── user-token.data.type.ts      # { sub, email, role } no JWT
│   │
│   ├── user/                         # ✅ Módulo de contas (100% completo)
│   │   ├── user.module.ts
│   │   ├── user.controller.ts        # 9 endpoints
│   │   ├── user.service.ts
│   │   ├── user.repository.ts
│   │   ├── new-user.dto.ts           # DTO para criar conta
│   │   │
│   │   ├── dto/
│   │   │   ├── update-preferences.dto.ts
│   │   │   └── update-role.dto.ts
│   │   │
│   │   └── types/
│   │       └── user.type.ts          # Type Prisma tipado
│   │
│   ├── credential/                      # ✅ Módulo de credenciais (100% completo)
│   │   ├── credential.module.ts
│   │   ├── credential.controller.ts     # 5 endpoints
│   │   ├── credential.service.ts
│   │   ├── credential.repository.ts
│   │   │
│   │   ├── dto/
│   │   │   └── update-credential.dto.ts
│   │   │
│   │   └── types/
│   │       ├── credential.type.ts
│   │       └── credential-repository.type.ts
│   │
│   ├── role/                            # ✅ Módulo de roles (100% completo)
│   │   ├── role.module.ts
│   │   ├── role.controller.ts           # 3 endpoints
│   │   ├── role.service.ts
│   │   ├── role.repository.ts
│   │   └── types/
│   │       └── role.type.ts
│   │
│   ├── plan/                            # ✅ Módulo de planos (100% completo)
│   │   ├── plan.module.ts
│   │   ├── plan.controller.ts           # 4 endpoints
│   │   ├── plan.service.ts
│   │   ├── plan.repository.ts
│   │   └── types/
│   │       └── plan.type.ts
│   │
│   ├── subscription-status/             # ✅ Módulo de status (100% completo)
│   │   ├── subscription-status.module.ts
│   │   ├── subscription-status.controller.ts  # 3 endpoints
│   │   ├── subscription-status.service.ts
│   │   ├── subscription-status.repository.ts
│   │   └── types/ (sem arquivo específico)
│   │
│   ├── notification-type/               # ✅ Módulo de tipos de notificação (100% completo)
│   │   ├── notification-type.module.ts
│   │   ├── notification-type.controller.ts   # 3 endpoints
│   │   ├── notification-type.service.ts
│   │   ├── notification-type.repository.ts
│   │   └── types/
│   │       └── notification-type.type.ts
│   │
│   ├── profile/                            # ⏳ Módulo de usuários (planejado)
│   │   ├── profile.repository.ts
│   │   ├── profile.service.ts
│   │   ├── profile.controller.ts
│   │   ├── profile.module.ts
│   │   ├── profile.dto.ts
│   │   └── types/
│   │       └── profile-repository.type.ts
│   │
│   └── shared/                          # Código compartilhado entre módulos
│       ├── enums/
│       │   └── (tipos de enum para roles, plans, etc)
│       │
│       ├── guards/
│       │   └── jwt-auth.guard.ts        # Guard global para proteger endpoints
│       │
│       ├── strategies/
│       │   └── jwt-auth.strategy.ts     # Passport strategy para JWT access token
│       │
│       └── services/
│           ├── password/
│           │   └── password.service.ts  # bcrypt hash, compare, validate
│           │
│           ├── token/
│           │   └── token.service.ts     # JWT generation
│           │
│           └── prisma/
│               ├── prisma.module.ts                # Exporta PrismaService e PrismaErrorService
│               ├── prisma.service.ts               # Singleton do Prisma client com métodos auxiliares
│               └── prisma-error.service.ts         # Centraliza tratamento de erros Prisma
│
├── prisma/
│   ├── schema.prisma                    # Schema do banco: 11 models
│   ├── migrations/                      # Histórico de migrations (controlado)
│   └── generated/
│       └── zod/index.ts                 # Schemas Zod gerados automaticamente do schema.prisma
│
├── test/
│   ├── app.e2e-spec.ts                  # Testes end-to-end
│   └── jest-e2e.json                    # Config Jest para E2E
│
├── collections/
│   ├── auth.collection.yaml             # Postman/Insomnia collection
│   └── hello-world.yaml
│
├── .env.example                         # Template de variáveis de ambiente
├── docker-compose.yml                   # PostgreSQL + Redis localmente
├── package.json
├── tsconfig.json
├── jest.config.js
├── eslint.config.mjs
├── README.md
└── CONTEXT.md                           # Este arquivo!
```

---

## 📊 Prisma Schema Detalhado (v7.4.1)

### Models Atuais

#### **Role** — Definição de papéis

```prisma
model Role {
  id          String    @id @default(uuid())
  code        Int       @unique
  description String    @unique

  users User[]

  @@map("roles")
}
```

#### **Plan** — Planos de assinatura

```prisma
model Plan {
  id            String   @id @default(uuid())
  code          Int      @unique
  name          String   @unique
  slug          String   @unique
  price         Decimal
  maxTenants    Int
  maxProducts   Int
  maxOrders     Int
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  subscriptions Subscription[]

  @@map("plans")
}
```

#### **SubscriptionStatus** — Estados de assinatura

```prisma
model SubscriptionStatus {
  id            String @id @default(uuid())
  code          Int    @unique
  description   String @unique

  subscriptions Subscription[]

  @@map("subscription_statuses")
}
```

#### **NotificationType** — Tipos de notificação

```prisma
model NotificationType {
  id          String @id @default(uuid())
  code        Int    @unique
  description String @unique

  notifications Notification[]

  @@map("notification_types")
}
```

#### **AuthCredential** — Credenciais de autenticação

```prisma
model AuthCredential {
  id                 String   @id @default(uuid())
  userId          String
  email              String?
  password           String?
  hashedRefreshToken String?
  provider           String   @default("local")
  providerId         String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  user User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, provider])
  @@map("auth_credentials")
}
```

#### **User** — Entidade central de contas

```prisma
model User {
  id            String    @id @default(uuid())
  roleId        String
  isActive      Boolean   @default(true)
  lastLoginAt   DateTime?
  locale        String?
  timezone      String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  role          Role             @relation(fields: [roleId], references: [id])
  credentials   AuthCredential[]
  profile          Profile?
  tenants       Tenant[]
  subscription  Subscription?
  notifications Notification[]

  @@map("users")
}
```

#### **Profile** — Dados pessoais/estendidos

```prisma
model Profile {
  id          String   @id @default(uuid())
  userId   String   @unique
  firstName   String?
  lastName    String?
  companyName String?
  cpf         String?  @unique
  cnpj        String?  @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user   User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  contacts  ProfileContact[]
  addresses ProfileAddress[]

  @@map("profiles")
}
```

#### **ProfileContact** — Contatos do usuário

```prisma
model ProfileContact {
  id        String   @id @default(uuid())
  profileId    String
  phone     String?
  mobile    String?
  whatsapp  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  profile Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  @@map("profile_contacts")
}
```

#### **ProfileAddress** — Endereços do usuário

```prisma
model ProfileAddress {
  id         String   @id @default(uuid())
  profileId     String
  cep        String?
  street     String?
  number     String?
  complement String?
  city       String?
  state      String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  profile Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  @@map("profile_addresses")
}
```

#### **Tenant** — Restaurante/estabelecimento

```prisma
model Tenant {
  id        String   @id @default(uuid())
  userId String
  name      String
  slug      String   @unique
  logoUrl   String?
  phone     String?
  email     String?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("tenants")
}
```

#### **Subscription** — Assinatura do usuário

```prisma
model Subscription {
  id        String    @id @default(uuid())
  userId String    @unique
  planId    String
  statusId  String
  startedAt DateTime  @default(now())
  expiresAt DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  user User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  plan    Plan               @relation(fields: [planId], references: [id])
  status  SubscriptionStatus @relation(fields: [statusId], references: [id])

  @@map("subscriptions")
}
```

#### **Notification** — Notificações in-app

```prisma
model Notification {
  id        String    @id @default(uuid())
  userId String
  typeId    String
  title     String
  body      String
  isRead    Boolean   @default(false)
  readAt    DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  user User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  type    NotificationType @relation(fields: [typeId], references: [id])

  @@map("notifications")
}
```

---

## 🔐 Autenticação & Segurança

### Fluxo de Login

1. **Login:** POST `/auth/login` → valida credentials → gera access + refresh tokens → salva refresh token hasheado
2. **Access Token:** TTL 15 minutos — usado em requests autenticadas
3. **Refresh Token:** TTL 7 dias — usado para renovar access token sem fazer login novamente
4. **Logout:** POST `/auth/logout` → remove hashedRefreshToken do banco

### JWT Payload

```typescript
{
  sub: string // User ID
  email: string // Email do usuário
  role: number // Código da role
  iat: number // Issued at
  exp: number // Expiration time
}
```

### Estratégias Passport

- **JwtStrategy** — Extrai JWT do header `Authorization: Bearer <token>`
- **JwtRefreshStrategy** — Extrai refresh token e valida contra o hash no banco

### Guards

- **JwtAuthGuard** — Protege endpoints; valida access token
- **JwtRefreshGuard** — Valida refresh token para renovação

### Rate Limiting por Endpoint

| Endpoint                     | TTL        | Limit  | Propósito                      |
| ---------------------------- | ---------- | ------ | ------------------------------ |
| POST `/auth/login`           | 60s (1min) | 5 req  | Força bruta                    |
| POST `/auth/refresh-token`   | 60s (1min) | 10 req | Renovação agressiva            |
| POST `/auth/change-password` | 60s (1min) | 3 req  | Força bruta em senha           |
| Global                       | 60s (1min) | 10 req | Default para qualquer endpoint |

---

## 🛣️ Endpoints da API

### 📊 Resumo Total: 31 Endpoints

#### **Auth Module** (4 endpoints)

- `POST /auth/login` — Login
- `POST /auth/logout` — Logout
- `POST /auth/refresh-token` — Refresh token
- `POST /auth/change-password` — Mudar senha

#### **User Module** (9 endpoints)

- `POST /users` — Criar conta
- `GET /users` — Listar todas
- `GET /users/:id` — Buscar por ID
- `GET /users/email/:email` — Buscar por email
- `GET /users/:id/login-history` — Histórico de logins
- `PATCH /users/:id/preferences` — Atualizar locale + timezone
- `PATCH /users/:id/role` — Mudar role
- `PATCH /users/:id/deactivate` — Desativar
- `PATCH /users/:id/activate` — Reativar

#### **Credentials Module** (5 endpoints)

- `GET /credentials` — Listagem (implementar)
- `GET /credentials/:id` — Buscar por ID
- `GET /credentials/user/:userId` — Listar por conta
- `PATCH /credentials/:id` — Atualizar email
- `PATCH /credentials/:id/password` — Atualizar senha

#### **Role Module** (3 endpoints)

- `GET /roles` — Listar todas
- `GET /roles/:id` — Buscar por ID
- `GET /roles/code/:code` — Buscar por code

#### **Plan Module** (4 endpoints)

- `GET /plans` — Listar (apenas ativos)
- `GET /plans/:id` — Buscar por ID
- `GET /plans/code/:code` — Buscar por code
- `GET /plans/slug/:slug` — Buscar por slug

#### **SubscriptionStatus Module** (3 endpoints)

- `GET /subscription-statuses` — Listar todas
- `GET /subscription-statuses/:id` — Buscar por ID
- `GET /subscription-statuses/code/:code` — Buscar por code

#### **NotificationType Module** (3 endpoints)

- `GET /notification-types` — Listar todas
- `GET /notification-types/:id` — Buscar por ID
- `GET /notification-types/code/:code` — Buscar por code

---

## 🏛️ Padrões Arquiteturais

### 1. **Repository Pattern**

Camada de abstração entre Service e Prisma. **Tratamento de null centralizado no repository.**

```typescript
// ✅ Repository — trata erros Prisma + null
async getById(id: string): Promise<User> {
  try {
    const user = await this.prisma.user.findUnique({
      where: { id },
      ...this.userSelect,
    })

    if (!user) throw new NotFoundException('User not found')

    return user
  } catch (error) {
    this.prismaErrorService.handleError(error)
  }
}

// ✅ Service — delegação pura
async getById(id: string): Promise<User> {
  return await this.userRepository.getById(id)
  // Se erro → automático do repository
}

// ✅ Controller — delegação HTTP
async getById(@Param('id') id: string): Promise<User> {
  return await this.userService.getById(id)
}
```

### 2. **PrismaErrorService — Centralização de Erros**

Mapeia códigos de erro Prisma para exceções NestJS.

```typescript
// Suportados:
// P2025 — NotFoundException (recurso não encontrado)
// P2002 — ConflictException (unique constraint)
// P2003 — BadRequestException (foreign key constraint)

// Uso:
try {
  await this.prisma.user.delete(...)
} catch (error) {
  this.prismaErrorService.handleError(error)
}
```

### 3. **Types com Prisma.GetPayload**

Múltiplos tipos de entidades para controle explícito de exposição de dados.

```typescript
// ✅ Tipado automaticamente do schema
import { Prisma } from '@prisma/client'

export type User = Prisma.UserGetPayload<{
  omit: { roleId: true }
  include: {
    credentials: { omit: { userId: true } }
    role: { omit: { id: true } }
    // ...
  }
}>
```

### 4. **Omit no Prisma**

Excluir campos sensíveis nas queries.

```typescript
// Nunca retornar password, hashedRefreshToken
await this.prisma.authCredential.findUnique({
  where: { id },
  omit: {
    password: true,
    hashedRefreshToken: true,
  }
})
```

### 5. **ConfigModule Global**

Todas as variáveis de ambiente via `ConfigService`.

```typescript
// ✅ Injeta automaticamente
constructor(private configService: ConfigService) {}

const secret = this.configService.get<string>('JWT_SECRET')
const port = this.configService.get<number>('PORT', 3000)  // com default
```

### 6. **ValidationPipe Global**

Valida e transforma payloads automaticamente.

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // Remove campos não descritos no DTO
    forbidNonWhitelisted: true, // Rejeita se houver campos extras
    transform: true, // Converte tipos (string → number, etc.)
  }),
)
```

### 7. **ThrottlerModule Global**

Rate limiting aplicado globalmente + overrides por endpoint.

```typescript
// Global: 10 req/minuto
ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }])

// Override endpoint específico
@Throttle({ default: { ttl: 3600000, limit: 5 } })
@Post('login')
async login(...) { ... }
```

### 8. **Middleware de Tenant (Futuro)**

A cada requisição, identifica o restaurante (via JWT) e conecta ao schema correto.

```typescript
// Após implementação schema-per-tenant:
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.profile.tenantId // Extraído do JWT
    // Conecta Prisma ao schema "tenant_<tenantId>"
    this.prisma.$queryRaw`SET search_path TO tenant_${tenantId}`
    next()
  }
}
```

### 9. **Path Aliases**

Imports sem relativos confusos.

```typescript
// ✅
import { AuthService } from '@auth/auth.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

// ❌ Evitar
import { AuthService } from '../../../../auth/auth.service'
```

---

## ✍️ Convenções de Escrita

### Funções Pequenas & Responsabilidade Única

Cada função faz **uma coisa só**. Se ficou grande, extrai método privado.

### Early Return — Sem Else

Falha rápido, retorna cedo. Evita nesting profundo.

```typescript
// ✅
if (!credential.email || !credential.password)
  throw new UnauthorizedException('Invalid credentials')

await this.passwordService.validate(payload.password, credential.password)

// ❌
if (credential.email && credential.password) {
  await this.passwordService.validate(...)
} else {
  throw new UnauthorizedException(...)
}
```

### Nomes Descritivos & Sufixos de Contexto

- Variáveis: `credentialRepository`, `hashedRefreshToken`, `userTokenData`
- Sem abreviações: `usr`, `pwd`, `repo` → evitar
- Sufixos que indicam contexto: `...Repository`, `...DTO`, `...Type`, `...Guard`, `...Strategy`

### Separação de Dados Sensíveis

Nunca retornar `password`, `hashedRefreshToken` para o cliente.

```typescript
// ✅ Omit no Prisma
await this.prisma.authCredential.findUnique({
  where: { id },
  omit: { password: true, hashedRefreshToken: true }
})
```

### Try/Catch Apenas no Repository

Service e Controller não tratam erros Prisma diretamente — delegam.

```typescript
// ✅ Repository
async getById(id: string): Promise<User> {
  try {
    return await this.prisma.user.findUnique({ ... })
  } catch (error) {
    this.prismaErrorService.handleError(error)
  }
}

// ✅ Service — propaga naturalmente
async getById(id: string): Promise<User> {
  return await this.userRepository.getById(id)
  // Se erro → automático do repository
}
```

---

## 🧪 Padrões de Teste

### Estrutura: AAA (Arrange, Act, Assert)

Todo teste segue: monta dados → executa → verifica.

### Cobertura Obrigatória por Camada

**Controller** — testa delegação, não lógica

- Happy path: retorna o que o service retornou
- Error path: propaga erro do service

**Service** — testa lógica de negócio

- Happy path completo
- Cada validação que pode falhar
- Que os métodos corretos foram chamados

**Repository** — testa queries Prisma

- Happy path: query chamada com parâmetros exatos
- Erros Prisma → PrismaErrorService chamado

**DTO** — testa validações class-validator

---

## 🔄 Fluxos Principais

### Fluxo 1: Login & Token Generation

```
POST /auth/login
  ├─ Validação DTO
  ├─ AuthService.login()
  │   ├─ credentialsService.getByEmail()
  │   ├─ validatePassword()
  │   ├─ userRepository.getById()
  │   ├─ userRepository.updateLastLogin()
  │   ├─ tokenService.getTokens()
  │   │   ├─ generateToken(15m, JWT_SECRET) → accessToken
  │   │   └─ generateToken(7d, JWT_REFRESH_SECRET) → refreshToken
  │   ├─ credentialsService.updateRefreshToken()
  │   └─ buildLoginResponse()
  └─ Response 200: { user, tokens }
```

### Fluxo 2: Renovação de Token (Refresh)

```
POST /auth/refresh-token (+ JWT Refresh Guard)
  ├─ JwtRefreshGuard valida refresh token
  ├─ AuthService.refreshToken()
  │   ├─ credentialsService.getRefreshToken()
  │   ├─ validatePassword()
  │   ├─ userRepository.getById()
  │   ├─ tokenService.getTokens() → novo access + novo refresh
  │   └─ credentialsService.updateRefreshToken()
  └─ Response 200: { accessToken, refreshToken }
```

### Fluxo 3: Mudança de Senha

```
POST /auth/change-password (+ JWT Auth Guard)
  ├─ JwtAuthGuard valida access token
  ├─ AuthService.changePassword()
  │   ├─ credentialsService.getByEmail()
  │   ├─ validatePassword(oldPassword)
  │   ├─ credentialsService.updatePassword()
  │   └─ Response 200: { message: "Password changed successfully" }
  └─ Nova senha em efeito imediatamente
```

### Fluxo 4: Criar Conta

```
POST /users
  ├─ Validação DTO
  ├─ UserService.create()
  │   ├─ userRepository.create(roleId)
  │   ├─ credentialsService.create(userId, email, password)
  │   └─ userRepository.getById()
  └─ Response 201: { user }
```

### Fluxo 5: Atualizar Preferências

```
PATCH /users/:id/preferences (+ JWT Auth Guard)
  ├─ UserService.updatePreferences()
  │   └─ userRepository.updatePreferences()
  └─ Response 200: { user with updated locale/timezone }
```

---

## 🔧 Trade-offs & Decisões Arquiteturais

| Decisão                | Escolha                     | Motivo                                                    | Alternativa                                                    |
| ---------------------- | --------------------------- | --------------------------------------------------------- | -------------------------------------------------------------- |
| **Arquitetura**        | Monolito                    | MVP — velocidade > escalabilidade prematura               | Microsserviços (overkill para MVP)                             |
| **Multi-tenant**       | Schema-per-tenant           | Isolamento real sem custo de múltiplos bancos             | Database-per-tenant (mais caro), Row-per-tenant (menos seguro) |
| **ORM**                | Prisma                      | Type-safety, migrations controladas, Zod generation       | Sequelize (menos tipado), TypeORM (mais complexo)              |
| **Auth**               | JWT stateless               | Sem sessão server-side — escala horizontal fácil          | Session-based (precisa de shared cache)                        |
| **Refresh token**      | Hasheado no banco           | Segurança — token plain nunca persiste                    | JWT de longa duração (risco de vazamento)                      |
| **Error handling**     | Service centralizado        | Evita try/catch espalhado, mensagens consistentes         | Erros inline (código repetido)                                 |
| **Types por contexto** | Prisma.GetPayload           | Tipo seguro automaticamente, sempre sincronizado          | Type manual (pode ficar desatualizado)                         |
| **Null handling**      | No repository               | Centralizado, sem duplicação de validação                 | No service (repetitivo)                                        |
| **Validação**          | class-validator (decorator) | Declarativa, reutilizável, automática no pipe             | Validação manual (repetitivo)                                  |
| **Credentials**        | Módulo separado             | Responsabilidade isolada, reutilizável pelo auth          | Misturado com auth (difícil de testar)                         |
| **Repository**         | Sempre trata null/erros     | Evita if checks nos services                              | Deixar para o service (código repetido)                        |

---

## 📦 Status dos Módulos

| Módulo                | Status          | Endpoints | Progresso |
| --------------------- | --------------- | --------- | --------- |
| **auth**              | ✅ Concluído    | 4         | 100%      |
| **user**           | ✅ Concluído    | 9         | 100%      |
| **credential**        | ✅ Concluído    | 5         | 100%      |
| **role**              | ✅ Concluído    | 3         | 100%      |
| **plan**              | ✅ Concluído    | 4         | 100%      |
| **subscription-status** | ✅ Concluído  | 3         | 100%      |
| **notification-type** | ✅ Concluído    | 3         | 100%      |
| **shared/prisma**     | ✅ Concluído    | —         | 100%      |
| **shared/guards**     | ✅ Concluído    | —         | 100%      |
| **shared/strategies** | ✅ Concluído    | —         | 100%      |
| **profile**              | ⏳ Futuro       | —         | 5%        |
| **tenant**            | ⏳ Futuro       | —         | 0%        |
| **restaurant**        | ⏳ Futuro       | —         | 0%        |
| **order**             | ⏳ Futuro       | —         | 0%        |
| **payment**           | ⏳ Futuro       | —         | 0%        |
| **delivery**          | ⏳ Futuro       | —         | 0%        |
| **notification**      | ⏳ Futuro       | —         | 0%        |

---

## 🚀 Próximas Features (Roadmap)

### Curto Prazo (1-2 semanas)

- [ ] Swagger documentation (`@nestjs/swagger`)
- [ ] Implementar `POST /auth/forgot-password` + `POST /auth/reset-password`
  - Depende integração com Resend (email transacional)
  - Token de reset com TTL curto (30 min)
- [ ] Testes completos para todos os módulos

### Médio Prazo (3-4 semanas)

- [ ] Módulo de Tenant
  - CRUD: create, read, update, delete restaurante
  - Schema-per-tenant isolamento no PostgreSQL
  - Middleware de tenant identificação
- [ ] Rate limiting refinado com Redis (ao invés de em-memory)
- [ ] BullMQ + filas assíncronas
  - Emails via Resend
  - WhatsApp via Z-API
  - Push notifications via FCM

### Longo Prazo (MVP completo)

- [ ] Módulo Restaurant: cardápio, produtos, categorias
- [ ] Módulo Order: criar, rastrear, histórico de pedidos
- [ ] Integração Pagar.me: split payments, webhooks
- [ ] Módulo Delivery: entregadores, rastreamento real-time (SSE)
- [ ] Notifications: Resend, Z-API, FCM, SSE
- [ ] Analytics: PostHog integration

---

## 🛠️ Variáveis de Ambiente

```env
# Banco de Dados
DATABASE_URL=postgresql://profile:password@localhost:5432/ninomia_dev

# JWT Secrets
JWT_SECRET=seu-secret-super-seguro-access-token
JWT_REFRESH_SECRET=seu-secret-super-seguro-refresh-token

# Servidor
PORT=3000
NODE_ENV=development

# Prisma Accelerate (production)
PRISMA_ACCELERATE_URL=https://accelerate.prisma.io/...

# Resend (email)
RESEND_API_KEY=re_xxxxx

# Z-API (WhatsApp)
Z_API_TOKEN=xxxxx

# Pagar.me
PAGARME_API_KEY=xxxxx

# Firebase (push notifications)
FIREBASE_CREDENTIALS_JSON={ ... }

# Cloudflare R2 (storage)
R2_USER_ID=xxxxx
R2_ACCESS_KEY_ID=xxxxx
R2_SECRET_ACCESS_KEY=xxxxx
R2_BUCKET_NAME=ninomia-files
```

**Arquivo `.env.example`:** Sempre atualizado com as variáveis necessárias.

---

## 🐳 Docker & Local Development

### Docker Compose (PostgreSQL + Redis)

```bash
docker-compose up -d        # Inicia BD
docker-compose down         # Para BD
docker-compose down -v      # Para + remove volumes
```

### Prisma Migrations

```bash
npm run prisma:generate     # Gera Prisma client
npm run prisma:migrate      # Cria migration
npm run prisma:seed         # Popula dados iniciais (roles, plans, statuses)
npm run prisma:sync         # Sync schema sem migration (dev only)
```

### Executar Servidor

```bash
npm run start:dev           # Watch mode
npm run build               # Build para prod
npm run start:prod          # Produção
```

### Testes

```bash
npm test                    # Uma vez
npm run test:watch          # Watch mode
npm run test:cov            # Com cobertura
npm run test:e2e            # Testes end-to-end
```

---

## 📚 Referências & Documentação

- **NestJS:** https://docs.nestjs.com
- **Prisma:** https://www.prisma.io/docs
- **TypeScript:** https://www.typescriptlang.org
- **bcrypt:** https://github.com/kelektiv/node.bcrypt.js
- **JWT:** https://jwt.io
- **Passport.js:** http://www.passportjs.org
- **class-validator:** https://github.com/typestack/class-validator
- **Jest:** https://jestjs.io
- **Railway:** https://railway.app/docs
- **PostgreSQL:** https://www.postgresql.org/docs

---

## 🤝 Contribuição & Commits

### Padrão de Branches

- `main` → Produção
- `develop` → Staging
- `feature/nome-feature` → Feature branches

### Padrão de Commits

```
feat(auth): implementar login com JWT
fix(user): corrigir validação de role
test(credentials): adicionar testes para updatePassword
docs: atualizar CONTEXT.md
refactor(repository): extrair queries em helpers
```

### Pull Request Checklist

- [ ] Testes passando (`npm test`)
- [ ] Cobertura mantida/melhorada
- [ ] Linting sem erros (`npm run lint`)
- [ ] CONTEXT.md atualizado (se aplicável)
- [ ] Mensagens de commit descritivas

---

## 📞 Suporte & Dúvidas

Dúvidas sobre código? Consulte:

1. Este CONTEXT.md
2. Tests (`.spec.ts` files)
3. Comments inline no código
4. Issue no repositório

---

**Última atualização:** Abril 2026  
**Desenvolvedor:** Paulo (Solo)  
**Status:** MVP em desenvolvimento — 45% concluído

**31 endpoints implementados em 7 módulos completamente funcional e modular!** 🎉
