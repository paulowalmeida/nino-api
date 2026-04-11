# Ninomia Delivery — nino-api Context (v2.0)

## 📋 Visão Geral do Projeto

**Ninomia Delivery** é uma plataforma SaaS **white-label** de delivery para restaurantes, lanchonetes e estabelecimentos de alimentação. Modelo B2B com cobrança por **mensalidade fixa** (zero comissão por pedido). O cliente final nunca vê o nome "Ninomia" — cada restaurante tem sua marca própria.

- **Mercado inicial:** Norte do Brasil (Pará)
- **MVP estimado:** 3-6 meses (desenvolvimento solo)
- **Status atual:** Backend ~60% (módulo auth concluído, faltam recursos futuros)
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
│   ├── app.module.ts                    # Root module (ThrottlerModule, ConfigModule, AuthModule)
│   ├── app.controller.ts                # Controller raiz
│   ├── app.service.ts                   # Service raiz
│   │
│   ├── auth/                            # ✅ Módulo de autenticação (~80% completo)
│   │   ├── auth.module.ts               # Imports JwtModule, Passport strategies, guards
│   │   ├── auth.controller.ts           # POST /auth/* — create-user, login, refresh, etc
│   │   ├── auth.service.ts              # Lógica: createUser, login, logout, refreshToken, changePassword
│   │   ├── auth.repository.ts           # Queries Prisma abstratas
│   │   │
│   │   ├── guards/
│   │   │   └── jwt-refresh.guard.ts     # Guard para refresh-token endpoint
│   │   │
│   │   ├── strategies/
│   │   │   └── jwt-refresh.strategy.ts  # Passport strategy para JWT refresh
│   │   │
│   │   ├── dtos/
│   │   │   ├── user-register-request.dto.ts    # { email, password, firstName, lastName, role }
│   │   │   ├── login-request.dto.ts            # { email, password }
│   │   │   ├── change-password-request.dto.ts  # { oldPassword, newPassword }
│   │   │   └── refresh-token.dto.ts            # { refreshToken }
│   │   │
│   │   └── types/
│   │       └── user/
│   │           ├── user-created.type.ts                   # Resposta de createUser
│   │           ├── user-found.type.ts                     # User sem password (seguro)
│   │           ├── user-found.repository.type.ts          # User raw do Prisma (com password)
│   │           ├── user-refresh-token.repository.type.ts  # User com hashedRefreshToken
│   │           ├── user-auth-request.type.ts              # Request.user injetado por JWT Guard
│   │           ├── user-token.data.type.ts                # { sub, email, role } no JWT
│   │           └── login-response.type.ts                 # { user, tokens }
│   │
│   ├── users/                           # ⏳ Módulo de usuários (planejado)
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── users.repository.ts
│   │
│   └── shared/                          # Código compartilhado entre módulos
│       ├── enums/
│       │   ├── user-role.enum.ts        # { ADMIN = 1, CUSTOMER = 2, DELIVERY = 3, RESTAURANT = 4 }
│       │   ├── plan.enum.ts             # { INICIANTE = 1, PROFISSIONAL = 2, REDE = 3 }
│       │   ├── subscription-status.enum.ts  # { ACTIVE = 1, INACTIVE = 2, CANCELLED = 3 }
│       │   └── notification-type.enum.ts    # { EMAIL = 1, WHATSAPP = 2, PUSH = 3 }
│       │
│       ├── guards/
│       │   └── jwt-auth.guard.ts        # Guard global para proteger endpoints
│       │
│       ├── strategies/
│       │   └── jwt-auth.strategy.ts     # Passport strategy para JWT access token
│       │
│       └── services/
│           └── prisma/
│               ├── prisma.module.ts                # Exporta PrismaService e PrismaErrorService
│               ├── prisma.service.ts               # Singleton do Prisma client com métodos auxiliares
│               ├── prisma-error.service.ts         # Centraliza tratamento de erros Prisma
│               ├── prisma-seed.ts                  # Script de seed (create roles, plans, statuses)
│               └── prisma-seed.data.ts             # Dados iniciais
│
├── prisma/
│   ├── schema.prisma                    # Schema do banco: 11 models (User, UserRole, Plan, etc)
│   ├── migrations/                      # Histórico de migrations (controlado)
│   └── generated/
│       └── zod/index.ts                 # Schemas Zod gerados automaticamente do schema.prisma
│
├── test/
│   ├── app.e2e-spec.ts                  # Testes end-to-end
│   └── jest-e2e.json                    # Config Jest para E2E
│
├── collections/
│   ├── auth.collection.yaml             # Postman/Insomnia collection (endpoints auth)
│   └── hello-world.yaml
│
├── .env.example                         # Template de variáveis de ambiente
├── docker-compose.yml                   # PostgreSQL + Redis localmente
├── package.json
├── tsconfig.json
├── jest.config.js
├── eslint.config.mjs
├── README.md
└── context.md                           # Este arquivo!
```

---

## 📊 Prisma Schema Detalhado (v7.4.1)

### Models Atuais

#### **UserRole** — Definição de papéis de usuário

```prisma
model UserRole {
  id          String  @id @default(uuid())
  code        Int     @unique            // 1=ADMIN, 2=CUSTOMER, 3=DELIVERY, 4=RESTAURANT
  description String  @unique           // "Administrator", "Customer", etc.
  users       User[]                     // Relação reversa
  @@map("user_roles")
}
```

#### **User** — Entidade central de autenticação

```prisma
model User {
  id                 String        @id @default(uuid())
  email              String        @unique
  password           String        // Hash bcrypt
  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt
  hashedRefreshToken String?       // Hash bcrypt do refresh token (null se logout)

  roleId             String        // FK para UserRole
  role               UserRole      @relation(fields: [roleId], references: [id])

  profile            UserProfile?  // 1:1 com perfil estendido
  tenants            Tenant[]      // N:1 — restaurante pode ter múltiplos users (admin, gerente)
  subscription       Subscription? // 1:1 — plano contratado
  notifications      Notification[] // 1:N — notificações do usuário

  @@map("users")
}
```

#### **UserProfile** — Dados pessoais estendidos

```prisma
model UserProfile {
  id        String    @id @default(uuid())
  userId    String    @unique
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  firstName String?
  lastName  String?
  avatarUrl String?
  birthDate DateTime?
  cpf       String?   // Para pessoa física
  cnpj      String?   // Para pessoa jurídica

  contacts  UserContact[]  // 1:N — múltiplos contatos (phone, mobile, whatsapp)
  addresses UserAddress[]  // 1:N — múltiplos endereços

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("user_profiles")
}
```

#### **UserContact** — Contatos do usuário

```prisma
model UserContact {
  id        String      @id @default(uuid())
  profileId String
  profile   UserProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  phone     String?
  mobile    String?
  whatsapp  String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("user_contacts")
}
```

#### **UserAddress** — Endereços do usuário

```prisma
model UserAddress {
  id         String      @id @default(uuid())
  profileId  String
  profile    UserProfile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  cep        String?
  street     String?
  number     String?
  complement String?
  city       String?
  state      String?

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@map("user_addresses")
}
```

#### **Plan** — Planos de assinatura

```prisma
model Plan {
  id          String         @id @default(uuid())
  code        Int            @unique      // 1=INICIANTE, 2=PROFISSIONAL, 3=REDE
  name        String         @unique      // "Iniciante", "Profissional", etc.
  slug        String         @unique      // "iniciante", "profissional"
  price       Decimal        // Preço mensal em BRL
  maxTenants  Int            // Máx restaurantes para este plano
  maxProducts Int            // Máx produtos no cardápio
  maxOrders   Int            // Máx pedidos por mês
  isActive    Boolean        @default(true)
  subscriptions Subscription[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("plans")
}
```

#### **Subscription** — Assinatura do usuário

```prisma
model Subscription {
  id       String @id @default(uuid())
  userId   String @unique  // 1:1 — cada usuário pode ter uma assinatura
  user     User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  planId   String
  plan     Plan   @relation(fields: [planId], references: [id])

  statusId String
  status   SubscriptionStatus @relation(fields: [statusId], references: [id])

  startedAt DateTime  @default(now())
  expiresAt DateTime? // null se ativa permanentemente

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("subscriptions")
}
```

#### **SubscriptionStatus** — Estados de assinatura

```prisma
model SubscriptionStatus {
  id            String         @id @default(uuid())
  code          Int            @unique  // 1=ACTIVE, 2=INACTIVE, 3=CANCELLED
  description   String         @unique
  subscriptions Subscription[]

  @@map("subscription_statuses")
}
```

#### **Tenant** — Restaurante/estabelecimento

```prisma
model Tenant {
  id       String  @id @default(uuid())
  userId   String
  user     User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  name     String
  slug     String  @unique  // URL amigável
  logoUrl  String?
  phone    String?
  email    String?
  isActive Boolean @default(true)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("tenants")
}
```

#### **Notification** — Notificações in-app

```prisma
model Notification {
  id     String @id @default(uuid())
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  typeId String
  type   NotificationType @relation(fields: [typeId], references: [id])

  title  String
  body   String
  isRead Boolean   @default(false)
  readAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("notifications")
}
```

#### **NotificationType** — Tipos de notificação

```prisma
model NotificationType {
  id            String         @id @default(uuid())
  code          Int            @unique  // 1=EMAIL, 2=WHATSAPP, 3=PUSH
  description   String         @unique
  notifications Notification[]

  @@map("notification_types")
}
```

---

## 🔐 Autenticação & Segurança

### Fluxo de Login

1. **Registro:** POST `/auth/create-user` → bcrypt hash da senha → salva User + PersonalData
2. **Login:** POST `/auth/login` → valida credentials → gera access + refresh tokens → salva refresh token hasheado
3. **Access Token:** TTL 15 minutos — usado em requests autenticadas
4. **Refresh Token:** TTL 7 dias — usado para renovar access token sem fazer login novamente
5. **Logout:** POST `/auth/logout` → remove hashedRefreshToken do banco

### JWT Payload

```typescript
{
  sub: string // User ID
  email: string // Email do usuário
  role: number // Código da role (1=ADMIN, 2=CUSTOMER, etc.)
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
| POST `/auth/create-user`     | 3600s (1h) | 5 req  | Evita spam de registros        |
| POST `/auth/login`           | 60s (1min) | 5 req  | Força bruta                    |
| POST `/auth/refresh-token`   | 60s (1min) | 10 req | Renovação agressiva            |
| POST `/auth/change-password` | 60s (1min) | 3 req  | Força bruta em senha           |
| Global                       | 60s (1min) | 10 req | Default para qualquer endpoint |

---

## 🛣️ Endpoints da API

### Auth Module

#### ✅ POST `/auth/create-user`

Registra novo usuário.

**Request Body:**

```typescript
{
  email: string // email@example.com
  password: string // 8-16 chars
  firstName: string
  lastName: string
  role: number // 2=CUSTOMER, 4=RESTAURANT (enums)
}
```

**Response (201 Created):**

```typescript
{
  id: string
  createdAt: DateTime
  updatedAt: DateTime
  personalData: {
    email: string
    firstName: string
    lastName: string
  }
  role: {
    code: number
    description: string
  }
}
```

**Error (409 Conflict):** Email já existe

---

#### ✅ POST `/auth/login`

Autentica usuário e retorna tokens.

**Request Body:**

```typescript
{
  email: string
  password: string
}
```

**Response (200 OK):**

```typescript
{
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: { code: number, description: string }
    createdAt: DateTime
  }
  tokens: {
    accessToken: string      // JWT com TTL 15m
    refreshToken: string     // JWT com TTL 7d
  }
}
```

**Errors:**

- `401 Unauthorized` — Email ou senha inválidos
- `404 Not Found` — Usuário não existe

---

#### ✅ GET `/auth/current-user`

Retorna usuário logado. **Requer JwtAuthGuard.**

**Response (200 OK):**

```typescript
{
  id: string
  email: string
  firstName: string
  lastName: string
  role: { code: number, description: string }
  createdAt: DateTime
}
```

---

#### ✅ POST `/auth/logout`

Remove refresh token do usuário. **Requer JwtAuthGuard.**

**Response (200 OK):**

```typescript
{
  message: 'Logout bem-sucedido'
}
```

---

#### ✅ POST `/auth/refresh-token`

Renova access token usando refresh token. **Requer JwtRefreshGuard.**

**Request Body (via JWT):**

```typescript
// Refresh token vem no header Authorization: Bearer <refreshToken>
```

**Response (200 OK):**

```typescript
{
  accessToken: string
  refreshToken: string // Novo refresh token (rotation)
}
```

**Errors:**

- `401 Unauthorized` — Refresh token inválido ou expirado
- `401 Unauthorized` — Refresh token não bate com hash no banco

---

#### 🔄 POST `/auth/change-password`

Muda senha do usuário logado. **Requer JwtAuthGuard.**

**Request Body:**

```typescript
{
  oldPassword: string // Senha atual (8-16 chars)
  newPassword: string // Nova senha (8-16 chars)
}
```

**Response (200 OK):**

```typescript
{
  message: 'Password changed successfully'
}
```

**Errors:**

- `401 Unauthorized` — Senha antiga inválida
- `404 Not Found` — Usuário não encontrado

---

#### ⏳ POST `/auth/forgot-password` (Planejado)

Inicia fluxo de reset de senha via email (Resend).

#### ⏳ POST `/auth/reset-password` (Planejado)

Conclui reset de senha com token de email.

---

## 🏛️ Padrões Arquiteturais

### 1. **Repository Pattern**

Camada de abstração entre Service e Prisma.

```typescript
// ✅ Repository — trata erros Prisma
async createUser(payload: UserRegisterRequestDTO): Promise<UserCreated> {
  try {
    return await this.prisma.user.create({ ... })
  } catch (error) {
    this.prismaErrorService.handleError(error, 'User already exists')
  }
}

// ✅ Service — delegação de negócio
async createUser(payload: UserRegisterRequestDTO): Promise<UserCreated> {
  const cryptedPassword = await bcrypt.hash(payload.password, 10)
  return await this.authRepository.createUser({ ...payload, password: cryptedPassword })
}

// ✅ Controller — delegação HTTP
async createUser(@Body() payload: UserRegisterRequestDTO): Promise<UserCreated> {
  return await this.authService.createUser(payload)
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
  this.prismaErrorService.handleError(error, 'User not found')
}
```

### 3. **Types por Contexto**

Múltiplos tipos de "User" para controle explícito de exposição de dados.

```typescript
// UserFoundRepository — raw do Prisma (com password, hashedRefreshToken)
interface UserFoundRepository {
  id: string
  email: string
  password: string        // ⚠️ NUNCA retornar para cliente!
  hashedRefreshToken: string | null  // ⚠️ Sensível!
  personalData: { ... }
  role: { ... }
}

// UserFound — seguro para cliente (sem password, sem hashedRefreshToken)
interface UserFound {
  id: string
  email: string
  firstName: string
  lastName: string
  personalData: { email: string; firstName: string; lastName: string }
  role: { code: number; description: string }
  createdAt: DateTime
}

// UserCreated — resposta de registro
interface UserCreated {
  id: string
  personalData: { email: string; firstName: string; lastName: string }
  role: { code: number; description: string }
  createdAt: DateTime
}
```

**Garantia:** Cada tipo documenta exatamente o que aquela camada expõe.

### 4. **Omit no Prisma**

Excluir campos sensíveis nas queries.

```typescript
// Nunca retornar password, hashedRefreshToken, roleId, personalDataId
await this.prisma.user.findUnique({
  where: { id },
  omit: {
    password: true,
    hashedRefreshToken: true,
    personalDataId: true,
    roleId: true
  },
  include: { personalData: { ... }, role: { ... } }
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
@Throttle({ default: { ttl: 3600000, limit: 5 } })  // 1h, 5 req
@Post('create-user')
async createUser(...) { ... }
```

### 8. **Middleware de Tenant (Futuro)**

A cada requisição, identifica o restaurante (via JWT) e conecta ao schema correto.

```typescript
// Após implementação schema-per-tenant:
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.user.tenantId // Extraído do JWT
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

```typescript
// ✅ Correto
private validateUser(userFound: UserFoundRepository | null): UserFoundRepository {
  if (!userFound) throw new UnauthorizedException('Invalid credentials')
  return userFound
}

private async validatePassword(password: string, hashedPassword: string): Promise<void> {
  const isValid = await bcrypt.compare(password, hashedPassword)
  if (!isValid) throw new UnauthorizedException('Invalid credentials')
}

private async executeValidations(userFound, passwd): Promise<UserFound> {
  const user = await this.validateUser(userFound)
  await this.validatePassword(passwd, user.personalData.password)
  this.validateRole(user.role.code)
  return this.parseToUserFound(user)
}

// Uso — fácil de ler
async login(payload: LoginRequestDTO): Promise<LoginResponse> {
  const userFound = await this.authRepository.findUserByEmail(payload.email)
  const validatedUser = await this.executeValidations(userFound, payload.password)
  // ...
}
```

### Early Return — Sem Else

Falha rápido, retorna cedo. Evita nesting profundo.

```typescript
// ✅
if (!userFound) throw new UnauthorizedException('Invalid credentials')
return userFound

// ❌
if (userFound) {
  return userFound
} else {
  throw new UnauthorizedException('Invalid credentials')
}
```

### Nomes Descritivos & Sufixos de Contexto

- Variáveis: `userFoundRepository`, `hashedRefreshToken`, `userDataToken`
- Sem abreviações: `usr`, `pwd`, `repo` → evitar
- Sufixos que indicam contexto: `...Repository`, `...DTO`, `...Type`, `...Guard`, `...Strategy`

```typescript
// ✅
const userFoundRepository: UserFoundRepository =
  await this.authRepository.findUserByEmail(email)
const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)

// ❌
const usr = await this.repo.findUser(email)
const hrt = await bcrypt.hash(rft, 10)
```

### Separação de Dados Sensíveis

Nunca retornar `password`, `hashedRefreshToken` para o cliente.

```typescript
// ✅ Parseamento explícito
private parseToUserFound(user: UserFoundRepository): UserFound {
  const { password, ...personalData } = user.personalData
  return { ...user, personalData }  // password removido
}

// ✅ Omit no Prisma
await this.prisma.user.findUnique({
  where: { id },
  omit: { password: true, hashedRefreshToken: true }
})
```

### Try/Catch Apenas no Repository

Service e Controller não tratam erros Prisma diretamente — delegam.

```typescript
// ✅ Repository
async createUser(payload): Promise<UserCreated> {
  try {
    return await this.prisma.user.create({ ... })
  } catch (error) {
    this.prismaErrorService.handleError(error, 'User already exists')
  }
}

// ✅ Service — propaga naturalmente
async createUser(payload: UserRegisterRequestDTO): Promise<UserCreated> {
  const cryptedPassword = await bcrypt.hash(payload.password, 10)
  return await this.authRepository.createUser({ ...payload, password: cryptedPassword })
  // Se erro → automático do repository
}
```

---

## 🧪 Padrões de Teste

### Estrutura: AAA (Arrange, Act, Assert)

Todo teste segue: monta dados → executa → verifica.

```typescript
describe('AuthService', () => {
  describe('createUser', () => {
    it('should successfully create a new user', async () => {
      // Arrange
      const newUserPayload: UserRegisterRequestDTO = {
        email: 'user@example.com',
        password: 'password123',
        firstName: 'João',
        lastName: 'Silva',
        role: 2,
      }
      const createdUser: UserCreated = {
        id: 'uuid-123',
        personalData: {
          email: 'user@example.com',
          firstName: 'João',
          lastName: 'Silva',
        },
        role: { code: 2, description: 'Customer' },
        createdAt: new Date(),
      }
      mockAuthRepository.createUser.mockResolvedValue(createdUser)
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password')

      // Act
      const result = await service.createUser(newUserPayload)

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(newUserPayload.password, 10)
      expect(mockAuthRepository.createUser).toHaveBeenCalledWith({
        ...newUserPayload,
        password: 'hashed-password',
      })
      expect(result).toEqual(createdUser)
    })

    it('should throw ConflictException if email already exists', async () => {
      // Arrange
      mockAuthRepository.createUser.mockRejectedValue(
        new ConflictException('User already exists'),
      )

      // Act & Assert
      await expect(service.createUser(payload)).rejects.toThrow(
        ConflictException,
      )
    })
  })
})
```

### Cobertura Obrigatória por Camada

**Controller** — testa delegação, não lógica

- Happy path: retorna o que o service retornou
- Error path: propaga erro do service

```typescript
it('should return user created when service succeeds', async () => {
  const result = { id: 'uuid', ... }
  mockAuthService.createUser.mockResolvedValue(result)

  expect(await controller.createUser(payload)).toEqual(result)
  expect(mockAuthService.createUser).toHaveBeenCalledWith(payload)
})

it('should throw ConflictException when service throws', async () => {
  mockAuthService.createUser.mockRejectedValue(
    new ConflictException('User already exists')
  )

  await expect(controller.createUser(payload)).rejects.toThrow(ConflictException)
})
```

**Service** — testa lógica de negócio

- Happy path completo
- Cada validação que pode falhar
- Que os métodos corretos foram chamados com os argumentos corretos

```typescript
it('should hash password before calling repository', async () => {
  jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-pwd')

  await service.createUser(payload)

  expect(bcrypt.hash).toHaveBeenCalledWith(payload.password, 10)
  expect(mockRepository.createUser).toHaveBeenCalledWith({
    ...payload,
    password: 'hashed-pwd',
  })
})

it('should throw UnauthorizedException if password validation fails', async () => {
  jest.spyOn(bcrypt, 'compare').mockResolvedValue(false)
  mockRepository.findUserByEmail.mockResolvedValue(userWithPassword)

  await expect(service.login(loginPayload)).rejects.toThrow(
    UnauthorizedException,
  )
})
```

**Repository** — testa queries Prisma

- Happy path: query chamada com parâmetros exatos
- Erros Prisma → PrismaErrorService chamado
- Erros genéricos → PrismaErrorService chamado

```typescript
it('should call Prisma user.create with correct data', async () => {
  const spy = jest.spyOn(mockPrisma.user, 'create').mockResolvedValue(createdUser)

  await repository.createUser(payload)

  expect(spy).toHaveBeenCalledWith({
    data: { ... },
    include: { ... },
    omit: { ... }
  })
})

it('should call PrismaErrorService on P2002 error', async () => {
  const p2002Error = new Prisma.PrismaClientKnownRequestError('', 'P2002', '...')
  jest.spyOn(mockPrisma.user, 'create').mockRejectedValue(p2002Error)
  const spy = jest.spyOn(mockPrismaErrorService, 'handleError')

  try {
    await repository.createUser(payload)
  } catch {}

  expect(spy).toHaveBeenCalledWith(p2002Error, expect.any(String))
})
```

**DTO** — testa validações class-validator

```typescript
it('should reject invalid email', async () => {
  const dto = new LoginRequestDTO()
  dto.email = 'invalid-email'
  dto.password = 'password123'

  const errors = await validate(dto)

  expect(errors).toHaveLength(1)
  expect(errors[0].property).toBe('email')
  expect(errors[0].constraints).toHaveProperty('isEmail')
})

it('should reject password < 8 chars', async () => {
  const dto = new LoginRequestDTO()
  dto.email = 'user@example.com'
  dto.password = 'short'

  const errors = await validate(dto)

  expect(errors[0].constraints).toHaveProperty('minLength')
})
```

### Mocks & Setup

```typescript
beforeEach(() => {
  jest.clearAllMocks() // Essencial — limpa estado entre testes
})

// Mock repository
const mockAuthRepository = {
  createUser: jest.fn(),
  findUserByEmail: jest.fn(),
  updateRefreshToken: jest.fn(),
}

// Mock Prisma
const mockPrisma = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
}

// Mock bcrypt
jest.mock('bcrypt')
```

### Cobertura de Código

Config no `package.json`:

```json
{
  "jest": {
    "collectCoverageFrom": [
      "**/*.(t|j)s",
      "!**/*.module.ts",
      "!**/*.type.ts",
      "!**/types/**",
      "!**/*.enum.ts",
      "!**/main.ts",
      "!**/*.dto.ts",
      "!**/*.seed.**"
    ]
  }
}
```

Comando: `npm run test:cov` → gera relatório em `coverage/lcov-report/index.html`

---

## 🔄 Fluxos Principais

### Fluxo 1: Registro de Novo Usuário

```
POST /auth/create-user
  ├─ Validação DTO (class-validator)
  ├─ AuthController.createUser()
  ├─ AuthService.createUser()
  │   ├─ bcrypt.hash(password, 10)
  │   └─ authRepository.createUser()
  │       ├─ Prisma.user.create()
  │       └─ PrismaErrorService (se erro)
  └─ Response 201: { id, personalData, role, createdAt }
```

### Fluxo 2: Login & Token Generation

```
POST /auth/login
  ├─ Validação DTO
  ├─ AuthService.login()
  │   ├─ authRepository.findUserByEmail()
  │   ├─ executeValidations()
  │   │   ├─ validateUser() → NotFoundException
  │   │   ├─ validatePassword() → UnauthorizedException
  │   │   └─ validateRole() → HttpException
  │   ├─ getUserTokenData() → { sub, email, role }
  │   ├─ getTokens() → JwtService.signAsync()
  │   │   ├─ generateTokens(15m, JWT_SECRET) → accessToken
  │   │   └─ generateTokens(7d, JWT_REFRESH_SECRET) → refreshToken
  │   ├─ updateUserRefreshToken()
  │   │   └─ bcrypt.hash(refreshToken, 10) → hashedRefreshToken
  │   └─ buildLoginResponse()
  └─ Response 200: { user, tokens }
```

### Fluxo 3: Renovação de Token (Refresh)

```
POST /auth/refresh-token (+ JWT Refresh Guard)
  ├─ JwtRefreshGuard valida refresh token
  ├─ AuthService.refreshToken()
  │   ├─ authRepository.getRefreshToken(userId)
  │   ├─ checkHashsRefresh()
  │   │   └─ bcrypt.compare(token, hashedRefreshToken)
  │   ├─ getTokens() → novo access + novo refresh
  │   └─ updateUserRefreshToken()
  └─ Response 200: { accessToken, refreshToken }
```

### Fluxo 4: Mudança de Senha

```
POST /auth/change-password (+ JWT Auth Guard)
  ├─ JwtAuthGuard valida access token
  ├─ AuthService.changePassword()
  │   ├─ authRepository.getUserByEmail()
  │   ├─ validatePassword(oldPassword)
  │   ├─ bcrypt.hash(newPassword, 10)
  │   ├─ authRepository.updateUserPassword()
  │   └─ Response 200: { message: "Password changed successfully" }
  └─ Nova senha em efeito imediatamente
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
| **Types por contexto** | Múltiplos tipos de User     | Controle explícito do que cada camada expõe               | Type único (pode expor sensíveis)                              |
| **Validação**          | class-validator (decorator) | Declarativa, reutilizável, automática no pipe             | Validação manual (repetitivo)                                  |
| **Frontend**           | PWA (Next.js)               | Elimina barreira de adoção (sem App Store)                | App nativo (iOS/Android separados)                             |
| **Pagamento**          | Pagar.me split              | Dinheiro vai direto pro restaurante — Ninomia não toca    | Manual transfer (complexo, demora)                             |
| **Storage**            | Cloudflare R2               | Zero custo de egress — crítico pra app com muitas imagens | AWS S3 (egress caro)                                           |
| **Database**           | PostgreSQL                  | Robusto, ACID, suporta schema isolation, JSON             | MySQL (menos features), SQLite (single-user)                   |

---

## 📦 Status dos Módulos

| Módulo                | Status          | Progresso | Próximo Passo                                                 |
| --------------------- | --------------- | --------- | ------------------------------------------------------------- |
| **shared/prisma**     | ✅ Concluído    | 100%      | —                                                             |
| **shared/guards**     | ✅ Concluído    | 100%      | —                                                             |
| **shared/strategies** | ✅ Concluído    | 100%      | —                                                             |
| **shared/enums**      | ✅ Concluído    | 100%      | —                                                             |
| **auth**              | 🔄 Em progresso | ~80%      | changePassword; forgotPassword/resetPassword (depende Resend) |
| **users**             | ⏳ Futuro       | 5%        | CRUD básico, listar usuários, atualizar perfil                |
| **tenant**            | ⏳ Futuro       | 0%        | CRUD de restaurante, schema-per-tenant isolation              |
| **restaurant**        | ⏳ Futuro       | 0%        | Cardápio, produtos, configurações de entrega                  |
| **order**             | ⏳ Futuro       | 0%        | Criar pedido, fluxo de status, histórico                      |
| **payment**           | ⏳ Futuro       | 0%        | Integração Pagar.me split, reconciliação                      |
| **delivery**          | ⏳ Futuro       | 0%        | Atribuição de entregador, rastreamento real-time              |
| **notification**      | ⏳ Futuro       | 0%        | Resend (email), Z-API (WhatsApp), FCM (push), SSE (in-app)    |

---

## 🚀 Próximas Features (Roadmap)

### Curto Prazo (1-2 semanas)

- [x] Endpoint `POST /auth/change-password` — lógica funcionando
- [ ] Testes completos para change-password (guard, service, repository)
- [ ] Implementar `POST /auth/forgot-password` + `POST /auth/reset-password`
  - Depende integração com Resend (email transacional)
  - Token de reset com TTL curto (30 min)
- [ ] Documentação Swagger (`@nestjs/swagger`)

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
DATABASE_URL=postgresql://user:password@localhost:5432/ninomia_dev

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
R2_ACCOUNT_ID=xxxxx
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

**`docker-compose.yml`:**

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: ninomia
      POSTGRES_PASSWORD: password
      POSTGRES_DB: ninomia_dev
    ports:
      - '5432:5432'

  redis:
    image: redis:7
    ports:
      - '6379:6379'
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
fix(auth): corrigir validação de password
test(auth): adicionar testes para createUser
docs: atualizar CONTEXT.md
refactor(prisma): extrair queries em repository
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
**Status:** MVP em desenvolvimento
