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

## Pendente

| Item | Prioridade | Detalhe |
|---|---|---|
| CORS + Helmet | Média | Sem nenhuma configuração visível |
| Logging estruturado | Média | Só logger padrão do NestJS, sem rastreabilidade de requests |
| Health check | Baixa | Sem endpoint `/health` |
| Paginação | Baixa | Todos os `getAll` retornam tudo sem limite |
