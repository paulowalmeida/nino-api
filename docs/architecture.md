# Arquitetura — Nino API

## Padrões Arquiteturais

### Repository Pattern

Camada de abstração entre Service e Prisma via `BaseRepository<T>`. Repository filho só define métodos que o abstract não cobre — se `findItem`, `insert`, `softDelete` etc. já resolvem, o filho não reescreve nada.

```typescript
// Repository filho — sem métodos se o abstract já cobre
export class GlobalRoleRepository extends BaseRepository<Prisma.GlobalRoleDelegate> {
  constructor(prisma: PrismaService, errorService: ErrorService) {
    super(errorService, prisma.globalRole)
  }
}

// Service — chama direto os métodos do abstract via repository
async getById(id: string): Promise<GlobalRole> {
  return this.repo.findItem<GlobalRole>({ where: { id } })
}

// Repository filho com método próprio — só quando o abstract não resolve
async getBySlug(slug: string): Promise<Plan> {
  const exists = await this.model.findFirst({
    where: { slug, deletedAt: null },
  })
  if (exists) throw new ConflictException('Slug already exists')
  return this.insert<Plan>({ data })
}
```

### ErrorService — Centralização de Erros

Mapeia códigos Prisma para exceções NestJS. `HttpException` é relançada diretamente.

| Código | Exception |
|---|---|
| P2025 | NotFoundException |
| P2002 | ConflictException |
| P2003 | BadRequestException |
| P2014 | BadRequestException |

O `BaseRepository` já encapsula o try/catch via `executeFnWithTryCatch` — não escrever try/catch manual nos repositories.

### Remoção de campos sensíveis via destructuring

```typescript
const { typeId: _, ...rest } = entity
return { ...rest, type: { name: type.name } }
```

### ConfigModule Global

```typescript
constructor(private configService: ConfigService) {}

const url = this.configService.get<string>('DB_URL')
const port = this.configService.get<number>('PORT', 3000)
```

### ValidationPipe Global

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
```

### ThrottlerModule Global

```typescript
// Global: 10 req/minuto
ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }])

// Override por endpoint
@Throttle({ default: { ttl: 3600000, limit: 5 } })
@Post('login')
async login(...) { ... }
```

---

## Fluxos Principais

### Login

```
POST /auth/login  (throttle: 5 req/min)
  ├─ Validação DTO (LoginRequestDto)
  ├─ AuthService.login(dto, ipAddress, userAgent)
  │   ├─ credentialsService.getByEmailWithPassword(dto.email)
  │   ├─ passwordService.compare(dto.password, credential.password)
  │   ├─ userService.getById(credential.userId)
  │   ├─ tokenService.generateTokens({ sub: user.id, role: user.role.name })
  │   │   ├─ accessToken (15min, JWT_SECRET)
  │   │   └─ refreshToken (7d, JWT_REFRESH_SECRET)
  │   └─ sessionService.create({ userId, refreshToken: sha256(refreshToken), ipAddress, userAgent, expiresAt })
  └─ Response 200: { user, tokens }
```

### Refresh

```
POST /auth/refresh
  ├─ Lê refreshToken do header Authorization: Bearer
  ├─ AuthService.refresh(token, ipAddress, userAgent)
  │   ├─ tokenService.verifyRefreshToken(token) → valida assinatura JWT
  │   ├─ sessionService.findByRefreshToken(sha256(token))
  │   │   └─ se não encontrar → deleta TODAS as sessões do usuário (reuse attack) → 401
  │   ├─ tokenService.generateTokens({ sub, role })
  │   └─ sessionService.update(session.id, { refreshToken: sha256(novoToken), ipAddress, userAgent, expiresAt })
  └─ Response 200: { tokens }
```

### Logout

```
POST /auth/logout
  ├─ Lê refreshToken do header Authorization: Bearer
  ├─ AuthService.logout(token)
  │   ├─ sessionService.getByRefreshToken(sha256(token))
  │   └─ sessionService.delete(session.id)
  └─ Response 200: { message: 'Logged out' }
```

### Register

```
POST /auth/register
  ├─ Validação DTO (RegisterRequestDto)
  ├─ AuthService.register(dto)
  │   ├─ commonService.getByField('name', dto.globalRole) → resolve ID do role
  │   ├─ userService.create({ name, globalRoleId })
  │   ├─ credentialsService.create({ userId, email, password })
  │   └─ userService.getById(user.id) → retorna perfil completo
  └─ Response 201: { user }
```

---

## SOLID no Projeto

### S — Single Responsibility

Cada classe tem uma responsabilidade única e não faz o trabalho da outra.

`CompanyService` só orquestra regras de negócio — não sabe nada de Prisma:
```typescript
async delete(id: string): Promise<{ message: string }> {
  return this.repo.softDelete({ id })
}
```

`ErrorService` só mapeia erros — nenhum repository repete esse bloco. `BaseRepository` só acessa dados — nunca lança regra de negócio.

### O — Open/Closed

Aberto para extensão, fechado para modificação. `PlanRepository` e `CompanyBusinessCategoryRepository` estendem `BaseRepository` sem tocar nela — só passam o delegate:

```typescript
export class PlanRepository extends BaseRepository<Prisma.PlanDelegate> {
  constructor(prisma: PrismaService, errorService: ErrorService, paginationService: PaginationService) {
    super(errorService, prisma.plan, 'Plan', paginationService)
  }
}
```

Adicionar um novo domínio = novo repository, zero mudança na base.

### L — Liskov Substitution

`IBaseRepository` define o contrato. Qualquer repository que o implemente deve ser substituível sem quebrar o service. `BaseRepository` implementa `IBaseRepository` — todos os repositories concretos herdam esse contrato automaticamente.

### I — Interface Segregation

`CompanyBusinessCategoryService` é uma junction table — não faz sentido expor `create`/`update`/`delete` genéricos. O service expõe exatamente o que o domínio precisa:

```typescript
async link(companyId: string, businessCategoryId: string): Promise<...>
async unlink(companyId: string, businessCategoryId: string): Promise<...>
async setActive(companyId: string, businessCategoryId: string, isActive: boolean): Promise<...>
```

### D — Dependency Inversion

Services dependem de repositories (abstrações do domínio de dados), nunca de `PrismaService` diretamente. `BaseRepository` implementa `IBaseRepository` — se o ORM mudar, o contrato com o service não muda.

```typescript
// Service depende do repository, não do Prisma
constructor(private readonly repo: CompanyRepository) {}

// Nunca isso no service:
constructor(private readonly prisma: PrismaService) {}
```

---

## Checklist de Produção (não implementado)

### Observabilidade
- **Structured logging (JSON)** — logs com níveis (`info`, `warn`, `error`) para Datadog, Grafana Loki, CloudWatch
- **Correlation ID** — ID único por request propagado em todos os logs

```typescript
req.headers['x-correlation-id'] = req.headers['x-correlation-id'] ?? uuid()
```

### Segurança
- **Helmet** — headers HTTP de segurança com uma linha: `app.use(helmet())`
- **Validação de env no boot** — app não sobe se faltar variável crítica

```typescript
ConfigModule.forRoot({
  validationSchema: Joi.object({
    DB_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
  })
})
```

### Qualidade
- **Coverage mínimo no CI** — impede merge se cobertura cair abaixo do threshold

```typescript
coverageThreshold: { global: { lines: 80, functions: 80 } }
```

### Operacional
- **Graceful shutdown** — termina requests em andamento antes de morrer: `app.enableShutdownHooks()`
- **Versionamento de rota** — `app.enableVersioning({ type: VersioningType.URI })` → `/v1/companies`

---

## Trade-offs & Decisões

| Decisão | Escolha | Motivo | Alternativa |
|---|---|---|---|
| **Arquitetura** | Monolito | MVP — velocidade > escalabilidade prematura | Microsserviços (overkill) |
| **Multi-tenant** | Row-level isolation | Schema único com `tenantId` — isolamento no repository | Schema-per-tenant (mais complexo) |
| **ORM** | Prisma | Type-safety, migrations controladas, adapter nativo pg | TypeORM (mais complexo) |
| **Auth** | JWT stateless | Escala horizontal sem shared cache | Session-based |
| **Refresh token** | Hasheado no banco | Token plain nunca persiste | JWT de longa duração |
| **Error handling** | Service centralizado | Sem try/catch espalhado | Inline (repetitivo) |
| **Null handling** | No repository | Centralizado, sem duplicação | No service |
| **Validação** | class-validator | Declarativa, automática no pipe | Manual |
| **Credentials** | Módulo separado | Responsabilidade isolada, reutilizável pelo auth | Misturado com auth |
