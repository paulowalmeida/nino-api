# Status da Aplicação

Última revisão: 2026-04-29

## Resolvido

| Item | Detalhe |
|---|---|
| Arquitetura (NestJS + Repository pattern + migrações) | Sólida |
| Validação de DTOs | `ValidationPipe` global com `whitelist` e `forbidNonWhitelisted` |
| Dependência unidirecional de entidades | OK |
| `ErrorService` centralizado | Mapeia códigos PG para exceções HTTP |
| RBAC | `RolesGuard` + `@Roles` em todos os controllers |
| Auth dual-token | Access token via Bearer + refresh token via JSON |
| Testes | 394/394 passando — specs atualizados para fluxo de Authorization header |
| Rate limiting no login | `@Throttle` no `POST /auth/login`: 5 req/min (global: 10 req/min) |
| Token reuse detection | `refresh` detecta token rotacionado reutilizado → revoga todas as sessões do usuário |
| Sessions RBAC | `RolesGuard` + `@Roles` em todos os endpoints — POST/PATCH: ADMIN; GET/DELETE: ADMIN, SUPPORT |
| Paginação | `PaginationService` com `page`, `limit`, `orderBy`, `orderDir` em todos os `getAll` |
| Types isolados | Cada type/DTO em arquivo próprio; `XxxPaginatedResponse` por módulo |
| Health check | `GET /health` com TypeORM ping via `@nestjs/terminus` |

## Pendente

| Item | Prioridade | Detalhe |
|---|---|---|
| CORS + Helmet | Média | Sem nenhuma configuração visível |
| ~~Logging estruturado~~ | ~~Média~~ | Interceptor global loga método, rota, status e latência |
