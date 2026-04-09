# Ninomia Delivery — nino-api Context

## O que é

SaaS white-label de delivery para restaurantes. B2B, mensalidade fixa, zero comissão por pedido.
O cliente final nunca vê o nome Ninomia. Mercado inicial: Norte do Brasil — Pará.

## Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** NestJS (monolito MVP)
- **ORM:** Prisma + Prisma Accelerate
- **Banco:** PostgreSQL (schema-per-tenant planejado)
- **Auth:** JWT (access 15min + refresh 7d) + Passport.js
- **Filas:** BullMQ + Redis (planejado)
- **Validação:** class-validator + class-transformer
- **Testes:** Jest

## Estrutura de Pastas

```
src/
  app.module.ts
  main.ts
  auth/
    auth.controller.ts
    auth.service.ts
    auth.repository.ts
    auth.module.ts
    dtos/
    guards/
    strategies/
    types/user/
  shared/
    enums/
    services/prisma/
prisma/
  schema.prisma
  migrations/
  generated/zod/
```

## Models Prisma (schema atual)

```prisma
model UserRole {
  id          String  @id @default(uuid())
  code        Int     @unique
  description String  @unique
  users       User[]
  @@map("user_roles")
}

model PersonalData {
  id        String    @id @default(uuid())
  email     String    @unique
  password  String
  firstName String
  lastName  String
  avatarUrl String?
  birthDate DateTime?
  user      User?
  @@map("personal_data")
}

model User {
  id                 String       @id @default(uuid())
  createdAt          DateTime     @default(now())
  updatedAt          DateTime     @updatedAt
  hashedRefreshToken String?
  roleId             String
  role               UserRole
  personalDataId     String       @unique
  personalData       PersonalData
  @@map("users")
}
```

## Endpoints Auth

| Método | Rota | Guard | Status |
|--------|------|-------|--------|
| POST | /auth/create-user | — | ✅ |
| POST | /auth/login | — | ✅ |
| GET | /auth/current-user | JwtAuthGuard | ✅ |
| POST | /auth/logout | JwtAuthGuard | ✅ |
| POST | /auth/refresh-token | JwtRefreshGuard | ✅ |
| POST | /auth/change-password | JwtAuthGuard | ⏳ pendente |

## JWT

- **Access token:** 15min — secret `JWT_SECRET`
- **Refresh token:** 7d — secret `JWT_REFRESH_SECRET`
- Payload: `{ sub: userId, email, role: number }`
- Refresh token hasheado com bcrypt antes de salvar (`hashedRefreshToken`)

## Padrões Arquiteturais

- **Repository pattern** — AuthRepository abstrai todas as queries Prisma do service
- **PrismaErrorService** — centraliza tratamento de erros Prisma (unique constraint, not found etc.)
- **Types por contexto** — UserFound, UserFoundRepository, UserCreated, UserRefreshTokenRepository etc.
  - Evita expor campos sensíveis entre camadas
  - Cada tipo reflete exatamente o que aquela camada precisa
- **Omit no Prisma** — `hashedRefreshToken`, `password`, `personalDataId`, `roleId` nunca retornam nas queries
- **ConfigModule global** — todas as envs via `configService.get()`
- **ValidationPipe global** — `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`
- **Path aliases** — `@auth/`, `@shared/`

## Convenções de Escrita

### Funções pequenas, responsabilidade única
Cada função faz uma coisa só. Se ficou grande, extrai método privado.

```typescript
// ✅ Correto — funções pequenas e nomeadas
private validateUser(userFound: UserFoundRepository | null): UserFoundRepository {
  if (!userFound) throw new UnauthorizedException('Invalid credentials')
  return userFound
}

private async validatePassword(password: string, hashedPassword: string): Promise<void> {
  const isValid = await bcrypt.compare(password, hashedPassword)
  if (!isValid) throw new UnauthorizedException('Invalid credentials')
}

private validateRole(role: number): void {
  if (!role) throw new HttpException('User role not found', 500)
}

// Orquestra as validações — fácil de ler
private async executeValidations(userFound, passwd) {
  const user = await this.validateUser(userFound)
  await this.validatePassword(passwd, user.personalData.password)
  this.validateRole(user.role.code)
  return this.parseToUserFound(user)
}
```

### Early return — sem else desnecessário
Falha rápido, retorna cedo.

```typescript
// ✅
if (!userFound) throw new UnauthorizedException('Invalid credentials')
return userFound

// ❌ evitar
if (userFound) {
  return userFound
} else {
  throw new UnauthorizedException('Invalid credentials')
}
```

### Nomes descritivos e consistentes
- Variáveis: `userFoundRepository`, `hashedRefreshToken`, `userDataToken`
- Sem abreviações: `usr`, `pwd`, `repo` → evitar
- Sufixos que indicam contexto: `...Repository`, `...DTO`, `...Type`, `...Guard`, `...Strategy`

### Separação de dados sensíveis
Nunca retornar `password`, `hashedRefreshToken` para o cliente.
Usar `omit` no Prisma ou destruturação:

```typescript
private parseToUserFound(user: UserFoundRepository): UserFound {
  const { password, ...personalData } = user.personalData
  return { ...user, personalData }
}
```

### Try/catch apenas no Repository
Service e Controller não tratam erros do Prisma diretamente — delegam ao `PrismaErrorService`.

```typescript
// ✅ Repository — trata erro
async createUser(payload): Promise<UserCreated> {
  try {
    return await this.prisma.user.create({ ... })
  } catch (error) {
    this.prismaErrorService.handleError(error, 'User already exists')
  }
}

// ✅ Service — propaga naturalmente
async createUser(payload): Promise<UserCreated> {
  const cryptedPassword = await bcrypt.hash(payload.password, 10)
  return await this.authRepository.createUser({ ...payload, password: cryptedPassword })
}
```

## Padrões de Teste

### Estrutura: AAA (Arrange, Act, Assert)
Todo teste segue: monta os dados → executa → verifica.

```typescript
it('should successfully create a new user', async () => {
  // Arrange
  mockAuthRepository.createUser.mockResolvedValue(createdUser)

  // Act
  const result = await service.createUser(newUserPayload)

  // Assert
  expect(bcrypt.hash).toHaveBeenCalledWith(newUserPayload.password, 10)
  expect(mockAuthRepository.createUser).toHaveBeenCalledWith({ ... })
  expect(result).toEqual(createdUser)
})
```

### Cobertura obrigatória por camada

**Controller** — testa delegação, não lógica:
- Happy path: retorna o que o service retornou
- Error path: propaga o erro do service

**Service** — testa lógica de negócio:
- Happy path completo
- Cada validação que pode falhar (usuário não encontrado, senha inválida, role ausente)
- Que os métodos corretos foram chamados com os argumentos corretos

**Repository** — testa queries Prisma:
- Happy path: query chamada com os parâmetros exatos
- Erros Prisma (P2002 unique constraint etc.) → PrismaErrorService chamado
- Erros genéricos → PrismaErrorService chamado

**DTO** — testa validações do class-validator:
- Payload válido → sem erros
- Cada campo inválido → erro com a constraint correta

### Mocks
- Dependências sempre mockadas via `jest.fn()` ou `jest.spyOn()`
- `jest.clearAllMocks()` no `beforeEach` — nunca deixar estado entre testes
- Mocks de bcrypt via `jest.spyOn(bcrypt, 'hash')` e `jest.spyOn(bcrypt, 'compare')`

### Nomenclatura dos testes
- `'should [comportamento esperado]'`
- `'should throw [Exceção] if [condição]'`
- `'should return [resultado] when [condição]'`

### describe aninhado por método
```typescript
describe('AuthService', () => {
  describe('createUser', () => {
    it('should ...')
    it('should throw ...')
  })
  describe('login', () => {
    it('should ...')
  })
})
```

## Trade-offs e Decisões de Arquitetura

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Arquitetura | Monolito | MVP — velocidade > escalabilidade prematura |
| Multi-tenant | Schema-per-tenant | Isolamento real sem custo de múltiplos bancos |
| ORM | Prisma | Type-safety, migrations controladas, geração de Zod |
| Auth | JWT stateless | Sem sessão server-side — escala horizontal fácil |
| Refresh token | Hasheado no banco | Segurança — token plain nunca persiste |
| Erro Prisma | Serviço centralizado | Evita try/catch espalhado, mensagens consistentes |
| Types por contexto | Múltiplos tipos de User | Controle explícito do que cada camada expõe |
| Frontend | PWA (Next.js) | Elimina barreira de adoção (sem App Store) |
| Pagamento | Pagar.me split | Dinheiro vai direto pro restaurante — Ninomia não toca |
| Storage | Cloudflare R2 | Zero custo de egress — crítico pra app com muitas imagens |

## Status dos Módulos

| Módulo | Status |
|--------|--------|
| shared/prisma | ✅ Completo |
| auth | 🔄 ~80% — falta changePassword, forgotPassword, resetPassword |
| tenant (schema-per-tenant) | ⏳ Próximo |
| restaurant | ⏳ Planejado |
| order | ⏳ Planejado |
| payment (Pagar.me split) | ⏳ Planejado |
| delivery | ⏳ Planejado |
| notification (Resend/Z-API/FCM/SSE) | ⏳ Planejado |

## Próximas Features

- `changePassword` — endpoint existe, lógica pendente
- `forgotPassword` / `resetPassword` — depende de integração com Resend
- Rate limiting com `@nestjs/throttler`
- Swagger
- Módulo de tenant com schema-per-tenant no PostgreSQL

## Variáveis de Ambiente

```env
DATABASE_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
PORT=3000
```
