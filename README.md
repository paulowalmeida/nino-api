# 🍕 Ninomia Delivery — nino-api

> **SaaS white-label de delivery para restaurantes.** Plataforma B2B com cobrança por mensalidade fixa, zero comissão por pedido. O cliente final nunca vê o nome "Ninomia" — cada restaurante tem sua marca própria.

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org)
[![NestJS](https://img.shields.io/badge/NestJS-v11-red.svg)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.7+-blue.svg)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v14+-336791.svg)](https://www.postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-v7.4-2D3748.svg)](https://www.prisma.io)
[![JWT](https://img.shields.io/badge/JWT-Auth-orange.svg)](https://jwt.io)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](#)

**[🌐 Website](https://ninomia.com) • [📖 Documentation](./CONTEXT.md) • [🐛 Issues](#) • [💬 Discord](#)**

</div>

---

## 📋 Visão Geral

**Ninomia Delivery** permite que restaurantes, lanchonetes e estabelecimentos de alimentação tenham seu próprio app de delivery com marca própria, **sem pagar comissão por pedido**.

### Por que Ninomia?

| Feature             | Ninomia                | iFood          | Rappi          |
| ------------------- | ---------------------- | -------------- | -------------- |
| Comissão por pedido | 0%                     | ~30%           | ~25%           |
| White-label         | ✅ Sim                 | ❌ Não         | ❌ Não         |
| Cobrança            | Mensalidade fixa       | Por transação  | Por transação  |
| Marca própria       | ✅ 100% do restaurante | ❌ Marketplace | ❌ Marketplace |
| Customização        | ✅ Tema, cores, logo   | ❌ Padrão      | ❌ Padrão      |

**Proposta:** Seus clientes fiéis já te conhecem — por que você ainda paga 30% para apresentá-los a você mesmo?

---

## 🚀 Quick Start

### Pré-requisitos

- **Node.js** v20+ ([download](https://nodejs.org))
- **npm** ou **yarn**
- **PostgreSQL** v14+ ([download](https://www.postgresql.org/download) ou [Docker](#docker-setup))
- **Redis** (opcional, para filas — [Docker](#docker-setup))

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/nino-api.git
cd nino-api

# 2. Instale dependências
npm install

# 3. Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais do PostgreSQL

# 4. Configure banco de dados
npm run prisma:generate    # Gera Prisma client
npm run prisma:migrate     # Cria tabelas
npm run prisma:seed        # Popula dados iniciais

# 5. Inicie o servidor
npm run start:dev

# 6. Acesse a API
curl http://localhost:3000/
```

**Servidor rodando em:** `http://localhost:3000`

---

## 🛠️ Stack Técnico

### Backend

- **NestJS** (v11) — Framework Node.js opinativo com DI, decorators, modular
- **TypeScript** — Type safety end-to-end
- **Express** — HTTP abstrato via NestJS
- **Prisma** — ORM tipado com migrations automáticas
- **PostgreSQL** — Banco relacional ACID com schema-per-tenant

### Autenticação & Segurança

- **JWT (JSON Web Tokens)** — Access 15min + Refresh 7d
- **bcrypt** — Hashing de senhas e tokens
- **Passport.js** — Estratégias plugáveis
- **Rate Limiting** — Proteção contra força bruta (@nestjs/throttler)
- **Helmet** — Headers HTTP de segurança

### Validação & Testes

- **class-validator** — Validação declarativa via decorators
- **Zod** — Schemas tipados gerados do Prisma
- **Jest** — Framework de testes com cobertura
- **supertest** — HTTP assertions

### Ferramentas

- **ESLint** + **Prettier** — Linting e formatação
- **GitHub Actions** — CI/CD automatizado
- **Docker Compose** — PostgreSQL + Redis local

---

## 📁 Estrutura do Projeto

```
nino-api/
├── src/
│   ├── auth/                 # ✅ Módulo de autenticação (80% completo)
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.repository.ts
│   │   ├── guards/           # JwtRefreshGuard
│   │   ├── strategies/       # JwtRefreshStrategy
│   │   ├── dtos/             # DTOs tipados
│   │   └── types/            # Types por contexto
│   │
│   ├── shared/               # Código compartilhado
│   │   ├── enums/            # UserRole, Plan, SubscriptionStatus, NotificationType
│   │   ├── guards/           # JwtAuthGuard
│   │   ├── strategies/       # JwtAuthStrategy
│   │   └── services/
│   │       └── prisma/       # PrismaService, PrismaErrorService
│   │
│   ├── users/                # ⏳ Módulo de usuários (futuro)
│   ├── app.module.ts         # Root module
│   └── main.ts               # Entry point
│
├── prisma/
│   ├── schema.prisma         # 11 models (User, Plan, Tenant, etc)
│   ├── migrations/           # Histórico de migrations
│   └── generated/zod/        # Schemas Zod gerados
│
├── test/                     # Testes end-to-end
├── collections/              # Postman/Insomnia collections
├── docker-compose.yml        # PostgreSQL + Redis
├── package.json
├── tsconfig.json
├── CONTEXT.md                # 📖 Documentação completa (1.350 linhas)
└── README.md                 # Este arquivo!
```

**Documentação detalhada:** Veja [CONTEXT.md](./CONTEXT.md) para arquitetura, padrões, fluxos e decisões de design.

---

## 🔐 API Endpoints

### Autenticação

#### `POST /auth/create-user`

Registra novo usuário.

```bash
curl -X POST http://localhost:3000/auth/create-user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "João",
    "lastName": "Silva",
    "role": 2
  }'
```

#### `POST /auth/login`

Autentica e retorna tokens.

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Response:**

```json
{
  "user": {
    "id": "uuid-123",
    "email": "user@example.com",
    "firstName": "João",
    "lastName": "Silva",
    "role": { "code": 2, "description": "Customer" },
    "createdAt": "2026-04-09T18:30:00Z"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### `GET /auth/current-user`

Retorna usuário logado. **Requer JWT.**

```bash
curl http://localhost:3000/auth/current-user \
  -H "Authorization: Bearer <accessToken>"
```

#### `POST /auth/logout`

Remove refresh token. **Requer JWT.**

```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer <accessToken>"
```

#### `POST /auth/refresh-token`

Renova access token. **Requer refresh token.**

```bash
curl -X POST http://localhost:3000/auth/refresh-token \
  -H "Authorization: Bearer <refreshToken>"
```

#### `POST /auth/change-password`

Muda senha do usuário logado. **Requer JWT.**

```bash
curl -X POST http://localhost:3000/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{
    "oldPassword": "password123",
    "newPassword": "newPassword456"
  }'
```

---

## 🐳 Docker Setup

### PostgreSQL + Redis (Local)

```bash
# Inicia containers
npm run docker:up-d

# Para tudo
npm run docker:down

# Logs
docker-compose logs -f postgres redis
```

**Credenciais padrão** (docker-compose.yml):

- PostgreSQL: `postgresql://ninomia:password@localhost:5432/ninomia_dev`
- Redis: `redis://localhost:6379`

---

## 🧪 Testes

```bash
# Testes unitários
npm test

# Watch mode
npm run test:watch

# Com cobertura
npm run test:cov

# Testes end-to-end
npm run test:e2e
```

**Cobertura atual:**

- Auth module: ~85%
- Shared services: ~90%
- Geral: ~80%

**Executar arquivo específico:**

```bash
npm test -- auth.service.spec.ts
```

**Debug de testes:**

```bash
npm run test:debug
```

---

## 🗄️ Prisma

### Migrations

```bash
# Gera Prisma client (necessário após mudanças no schema)
npm run prisma:generate

# Cria nova migration
npm run prisma:migrate

# Sincroniza schema com BD (dev only, cuidado!)
npm run prisma:sync

# Seed (popula dados iniciais)
npm run prisma:seed

# Abre Prisma Studio (UI visual do banco)
npx prisma studio
```

### Schema Atual

**11 Models:**

- **User** — Entidade de autenticação
- **UserRole** — Papéis (ADMIN, CUSTOMER, DELIVERY, RESTAURANT)
- **UserProfile** — Dados pessoais estendidos (CPF, CNPJ, avatar)
- **UserContact** — Múltiplos contatos (phone, mobile, whatsapp)
- **UserAddress** — Múltiplos endereços
- **Plan** — Planos de assinatura (INICIANTE, PROFISSIONAL, REDE)
- **Subscription** — Assinatura do usuário
- **SubscriptionStatus** — Estados (ACTIVE, INACTIVE, CANCELLED)
- **Tenant** — Restaurante/estabelecimento
- **Notification** — Notificações in-app
- **NotificationType** — Tipos de notificação (EMAIL, WHATSAPP, PUSH)

**Visualizar:** `npx prisma studio`

---

## 🔧 Desenvolvimento

### Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```env
# Banco de Dados
DATABASE_URL=postgresql://user:password@localhost:5432/ninomia_dev

# JWT (gere secrets seguros!)
JWT_SECRET=seu-secret-super-seguro-access-token
JWT_REFRESH_SECRET=seu-secret-super-seguro-refresh-token

# Servidor
PORT=3000
NODE_ENV=development

# Opcionais (filas, emails, etc)
RESEND_API_KEY=re_xxxxx
Z_API_TOKEN=xxxxx
PAGARME_API_KEY=xxxxx
```

### Linting & Formatação

```bash
# Fix linting errors
npm run lint

# Format code
npm run format
```

### Build

```bash
# Build para produção
npm run build

# Executar build
npm run start:prod
```

---

## 📊 Status do Projeto

### Módulos Completos ✅

- ✅ **shared/prisma** — PrismaService, migrations, error handling
- ✅ **shared/guards** — JwtAuthGuard, JwtRefreshGuard
- ✅ **shared/strategies** — JWT strategies
- ✅ **shared/enums** — UserRole, Plan, etc.
- ✅ **auth** (~80%) — createUser, login, logout, refresh, changePassword

### Próximos Passos 🔄

- [ ] `POST /auth/forgot-password` + `POST /auth/reset-password` (depende Resend)
- [ ] Módulo de **tenant** com schema-per-tenant isolamento
- [ ] Módulo de **restaurant** — cardápio, produtos
- [ ] Módulo de **order** — pedidos, status
- [ ] Integração **Pagar.me** — split payments
- [ ] Módulo de **delivery** — entregadores, rastreamento real-time
- [ ] **Notifications** — Resend, Z-API, FCM, SSE
- [ ] **Analytics** — PostHog

---

## 🌟 Features Planejadas

### MVP (3-6 meses)

- [x] Autenticação JWT com refresh token rotation
- [x] Rate limiting
- [x] Validação automática com class-validator
- [ ] Documentação Swagger
- [ ] Módulo de tenant com schema-per-tenant
- [ ] CRUD de restaurante
- [ ] Cardápio e produtos
- [ ] Criação e rastreamento de pedidos
- [ ] Integração Pagar.me split payments
- [ ] Notificações (Resend, WhatsApp, push)

### Pós-MVP

- [ ] Rastreamento real-time de entregador (WebSocket)
- [ ] Marketplace de entregadores
- [ ] Analytics e relatórios
- [ ] App mobile (Expo)
- [ ] Dashboard (Next.js)
- [ ] Integrações (Automação, ERPs)

---

## 🏛️ Arquitetura

### Padrões Implementados

- **Repository Pattern** — Abstração de dados
- **Service Layer** — Lógica de negócio
- **Controller** — Handlers HTTP
- **DTO (Data Transfer Objects)** — Validação
- **Dependency Injection** — NestJS nativo
- **Error Handling Centralizado** — PrismaErrorService
- **Types por Contexto** — Controle explícito de exposição de dados
- **Multi-tenant Schema-per-Tenant** — Isolamento de dados

### Decisões de Design

- **Monolito MVP** — Velocidade > escalabilidade prematura
- **JWT Stateless** — Escalabilidade horizontal fácil
- **PostgreSQL** — Robusto, ACID, suporta schema isolation
- **Prisma** — Type safety, migrations tipadas, Zod generation
- **Refresh Token Hasheado** — Segurança — plain token nunca persiste

**Leia mais:** [CONTEXT.md](./CONTEXT.md) (Trade-offs & Decisões de Arquitetura)

---

## 📦 Dependências Principais

```json
{
  "@nestjs/common": "^11.0.1",
  "@nestjs/config": "^4.0.3",
  "@nestjs/core": "^11.0.1",
  "@nestjs/jwt": "^11.0.2",
  "@nestjs/passport": "^11.0.5",
  "@nestjs/throttler": "^6.5.0",
  "@prisma/client": "^7.4.1",
  "bcrypt": "^6.0.0",
  "class-validator": "^0.15.1",
  "class-transformer": "^0.5.1",
  "passport": "^0.7.0",
  "passport-jwt": "^4.0.1"
}
```

**Versões completas:** Veja [package.json](./package.json)

---

## 📖 Documentação

| Documento                                     | Descrição                                                                                          |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **[CONTEXT.md](./CONTEXT.md)**                | 📘 Documentação completa (1.350 linhas): arquitetura, padrões, models, convenções, testes, roadmap |
| **[NestJS Docs](https://docs.nestjs.com)**    | Framework                                                                                          |
| **[Prisma Docs](https://www.prisma.io/docs)** | ORM                                                                                                |
| **[JWT.io](https://jwt.io)**                  | Tokens                                                                                             |
| **[Passport.js](http://www.passportjs.org)**  | Autenticação                                                                                       |
| **[Jest Docs](https://jestjs.io)**            | Testes                                                                                             |

---

## 🤝 Contribuição

### Branches

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

### PR Checklist

- [ ] Testes passando (`npm test`)
- [ ] Cobertura mantida/melhorada
- [ ] Linting sem erros (`npm run lint`)
- [ ] CONTEXT.md atualizado (se aplicável)
- [ ] Commits descritivos

---

## 🐛 Troubleshooting

### Erro: `ECONNREFUSED` ao conectar PostgreSQL

```bash
# Verificar se PostgreSQL está rodando
npm run docker:up-d

# Ou conecte ao seu banco existente
# Edite DATABASE_URL no .env
```

### Erro: `Prisma client not found`

```bash
npm run prisma:generate
```

### Erro: `Migration failed`

```bash
# Reset banco (dev only!)
npx prisma migrate reset
npm run prisma:seed
```

### Erro: `Port 3000 já em uso`

```bash
# Use porta diferente
PORT=3001 npm run start:dev

# Ou mate o processo
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

---

## 📞 Suporte

- 📖 **Documentação:** [CONTEXT.md](./CONTEXT.md)
- 🐛 **Issues:** [GitHub Issues](#)
- 💬 **Discord:** [Comunidade](#)
- 📧 **Email:** dev@ninomia.com

---

## 📈 Roadmap

### Q2 2026 (Agora)

- ✅ Auth module concluído
- [ ] Swagger documentation
- [ ] Forgot password + reset password
- [ ] Tenant module com schema-per-tenant

### Q3 2026

- [ ] Restaurant & menu modules
- [ ] Order creation & tracking
- [ ] Pagar.me integration

### Q4 2026

- [ ] Mobile app (Expo)
- [ ] Real-time delivery tracking
- [ ] Notifications (Email, WhatsApp, Push)
- [ ] Analytics

---

## 📄 License

**Proprietary.** Código fechado — não distribuir sem permissão.

Desenvolvido por **Paulo** — Solo developer.  
Parte do projeto **[Ninomia Delivery](https://ninomia.com)**.

---

## 🙏 Agradecimentos

- **NestJS** — Framework incrível
- **Prisma** — ORM sensacional
- **PostgreSQL** — Banco robusto
- **Community** — Suporte open-source

---

<div align="center">

**[⬆ Voltar ao topo](#)**

Feito com ❤️ em **Ananindeua, PA** 🇧🇷

</div>
