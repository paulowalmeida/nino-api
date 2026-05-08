# Architecture Decisions

## Repository Pattern — Interfaces + Abstract Base

### Por que interfaces nos repositórios?

Cada repositório terá uma interface que define o contrato:

```typescript
// business-category.repository.interface.ts
export interface IBusinessCategoryRepository {
  getAll(query: BusinessCategoryQueryDto): Promise<BusinessCategoryPaginatedResponse>
  getById(id: string): Promise<BusinessCategory>
  create(data: CreateBusinessCategoryDto): Promise<BusinessCategory>
  update(id: string, data: UpdateBusinessCategoryDto): Promise<BusinessCategory>
  delete(id: string): Promise<{ message: string }>
}
```

A implementação concreta respeita o contrato:

```typescript
export class BusinessCategoryRepository
  implements IBusinessCategoryRepository { ... }
```

O módulo registra a implementação sob o token da interface:

```typescript
{ provide: 'IBusinessCategoryRepository', useClass: BusinessCategoryPrismaRepository }
```

O service injeta pelo token — nunca conhece o Prisma:

```typescript
constructor(
  @Inject('IBusinessCategoryRepository')
  private readonly repo: IBusinessCategoryRepository,
) {}
```

**Benefício:** trocar de ORM = criar nova implementação + mudar `useClass` no módulo. Service e controller não tocam.

### Onde aplicar interfaces no projeto

Em tudo que depende de infraestrutura externa ou que pode trocar:

- **Repositórios** — ORM pode mudar
- **Serviços de e-mail** — SendGrid, Resend, SES
- **Gateway de pagamento** — Stripe, PagSeguro, Asaas
- **Storage** — S3, Cloudflare R2, local
- **Cache** — Redis para sessões ou rate limiting

O que **não** precisa de interface: services de domínio (`BusinessCategoryService`, `CompanyService`) — são lógica de negócio, não dependência externa.

### Estrutura de arquivos sugerida

```
business-category/
  interfaces/
    business-category.repository.interface.ts
  repositories/
    business-category.prisma.repository.ts   ← implementação Prisma
    business-category.drizzle.repository.ts  ← futura implementação
  business-category.service.ts
  business-category.controller.ts
  business-category.module.ts
```

---

## Abstract Base Repository — eliminando try/catch repetido

Todo repositório hoje repete o mesmo bloco em cada método. A base centraliza isso:

```typescript
export abstract class BaseRepository {
  constructor(protected readonly errorService: ErrorService) {}

  protected async execute<R>(fn: () => Promise<R>): Promise<R> {
    try {
      return await fn()
    } catch (error) {
      this.errorService.handle(error)
    }
  }
}
```

Repositórios concretos estendem e usam `execute`:

```typescript
export class BusinessCategoryRepository extends BaseRepository {
  async getById(id: string): Promise<BusinessCategory> {
    return this.execute(() =>
      this.prisma.businessCategory.findFirst({ where: { id, deletedAt: null } })
    )
  }
}
```

---

## Métodos genéricos com Prisma GetPayload

Para métodos comuns entre repositórios (ex: `findById`), usar generics com tipos do Prisma no call site mantém a tipagem:

```typescript
protected async findById<T>(
  model: { findFirst: (args: any) => Promise<T | null> },
  id: string,
): Promise<T> {
  return this.execute(async () => {
    const found = await model.findFirst({ where: { id, deletedAt: null } })
    if (!found) throw new NotFoundException('Not found')
    return found
  })
}
```

Uso no repositório concreto:

```typescript
async getById(id: string): Promise<BusinessCategory> {
  return this.findById<BusinessCategory>(this.prisma.businessCategory, id)
}
```

O tipo é garantido pelo call site — sem `any` exposto.

---

## SOLID aplicado ao projeto

### S — Single Responsibility
Cada classe tem uma responsabilidade clara:
- **Controller** — recebe requisição e delega
- **Service** — orquestra regra de negócio
- **Repository** — acessa dados

Nenhum dos três faz o trabalho do outro. Com a `BaseRepository`, o repositório deixa de ter a responsabilidade de tratar erros — isso fica na base.

### O — Open/Closed
Aberto para extensão, fechado para modificação.

A `BaseRepository` com `execute` permite que repositórios concretos estendam o comportamento sem modificar a base. Ao trocar de ORM, cria-se uma nova implementação sem tocar na existente.

### L — Liskov Substitution
Qualquer implementação da interface deve poder substituir a outra sem quebrar a aplicação.

`BusinessCategoryPrismaRepository` e `BusinessCategoryDrizzleRepository` são intercambiáveis porque ambas respeitam `IBusinessCategoryRepository` — mesmos parâmetros, mesmos retornos, mesmo comportamento esperado.

### I — Interface Segregation
Não force uma classe a implementar métodos que ela não usa.

`CompanyBusinessCategoryRepository` não tem `getAll`/`getById`/`create` como os CRUD comuns — é uma junction table com `link`/`unlink`/`activate`/`deactivate`. Por isso cada repositório tem sua própria interface, com exatamente os métodos que precisa.

### D — Dependency Inversion
Dependa de abstrações, não de implementações concretas.

O service não depende do `BusinessCategoryPrismaRepository` — depende do `IBusinessCategoryRepository`. Quem decide qual implementação usar é o módulo, não o service. É o princípio que amarra todos os outros.

---

## Ordem de implementação sugerida

1. Criar `BaseRepository` em `src/shared/repositories/base.repository.ts`
2. Aplicar no `TenantType` (primeiro módulo do core) como template
3. Retroativamente migrar os demais repositórios

---

## Boas práticas de projeto profissional

### Observabilidade

**Structured logging (JSON)**
Logs em formato JSON com níveis (`info`, `warn`, `error`) — facilita parsing em ferramentas como Datadog, Grafana Loki, CloudWatch. Logs de negócio explícitos: "pedido criado", "pagamento falhou".

**Correlation ID**
Um ID único por request propagado em todos os logs daquela requisição. Facilita rastrear o caminho completo de uma falha em produção.

```typescript
// middleware que injeta X-Correlation-ID em cada request
req.headers['x-correlation-id'] = req.headers['x-correlation-id'] ?? uuid()
```

### Segurança

**Rate limiting**
Especialmente crítico em `/auth/login` para prevenir brute force. NestJS tem `@nestjs/throttler` pronto para uso.

**Helmet**
Headers HTTP de segurança (XSS protection, content-type sniffing, etc) com uma linha:
```typescript
app.use(helmet())
```

**Validação de variáveis de ambiente no boot**
A aplicação não sobe se faltar um `.env` crítico — evita erros silenciosos em produção.
```typescript
// usando Joi ou Zod no app.module.ts
ConfigModule.forRoot({
  validationSchema: Joi.object({
    DB_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
  })
})
```

### Qualidade

**Coverage mínimo no CI**
Impede merge se a cobertura de testes cair abaixo de um threshold definido (ex: 80%). Configurável no `jest.config.ts`:
```typescript
coverageThreshold: {
  global: { lines: 80, functions: 80 }
}
```

**Conventional commits + CHANGELOG automático**
`commitlint` + `release-it` ou `semantic-release` geram CHANGELOG e bumping de versão automaticamente a partir dos commits.

### API

**Versionamento de rota**
Quando o contrato de uma rota precisa mudar, versionar evita quebrar clientes antigos:
```typescript
app.enableVersioning({ type: VersioningType.URI })
// resulta em /v1/companies, /v2/companies
```

**Swagger/OpenAPI**
Documentação automática dos endpoints gerada a partir dos decorators NestJS. Essencial para times e para consumidores externos da API.

### Operacional

**Graceful shutdown**
A aplicação termina requisições em andamento antes de morrer — evita requests cortados em deploys:
```typescript
app.enableShutdownHooks()
```

**Health check com verificação real do banco**
O endpoint `/health` deve verificar se o Prisma responde de verdade, não só se a app está de pé.
