# TODO

Lista de itens pendentes sem ordem de prioridade.

## API

- [x] Tornar endpoints de browse públicos — `GET /tenants/slug/:slug` e `GET /tenants/:id/products` sem JWT (necessário para o fluxo guest funcionar de ponta a ponta)
- [ ] Mock services — abstract class para pagamento e notificação, permitindo desenvolvimento e testes sem integração real
- [ ] Forgot/reset password — fluxo de recuperação de senha por e-mail
- [ ] CORS + Helmet — configuração de segurança mínima para produção
- [ ] Integração Pagar.me — gateway de pagamento real (depende do mock pronto)
- [ ] Integração Resend — e-mail transacional (depende do mock pronto)
- [ ] Integração Z-API — notificações WhatsApp (depende do mock pronto)
- [ ] Integração FCM — push notifications mobile (depende do mock pronto)
- [ ] Billing / invoices — geração e gestão de faturas de assinatura
- [ ] Invite — convidar usuários para um tenant (staff, manager)
- [ ] Sugestão de descrição de produto via LLM — `POST /tenants/:tenantId/products/suggest-description`, integração com API da Anthropic

## Tooling / DX

- [ ] Claude Code hook (`PostToolUse`) — detecta modificação em DTO/controller/service e injeta lembrete na conversa para revisar docs, collections e testes
- [ ] Geração automática de Insomnia collections — script que lê metadados do NestJS e gera os YAMLs (depende da API estabilizar)

## Frontend (nino-app)

- [x] @nino/lib — interfaces e enums gerados a partir dos DTOs/types do backend
- [ ] @nino/ui — componentes base com Radix UI e tokens CSS para white-label
- [ ] nino-consumer — app do consumidor (Next.js SSR)
- [ ] nino-manager — app do gestor (Next.js)
- [ ] nino-courier — app do entregador (Next.js)
- [ ] nino-backoffice — app administrativo (Next.js)
