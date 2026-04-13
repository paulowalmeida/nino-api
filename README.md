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
- **PostgreSQL** — Banco relacional ACID com schema-per-tenant (planejado)

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

## 📊 Endpoints da API

### **Total: 31 Endpoints em 7 Módulos**

#### **Auth** (4 endpoints)
```
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh-token
POST   /auth/change-password
```

#### **Account** (9 endpoints)
```
POST   /accounts
GET    /accounts
GET    /accounts/:id
GET    /accounts/email/:email
GET    /accounts/:id/login-history
PATCH  /accounts/:id/preferences
PATCH  /accounts/:id/role
PATCH  /accounts/:id/deactivate
PATCH  /accounts/:id/activate
```

#### **Credentials** (5 endpoints)
```
GET    /credentials/:id
GET    /credentials/account/:accountId
PATCH  /credentials/:id
PATCH  /credentials/:id/password
DELETE /credentials/:id
```

#### **Role, Plan, SubscriptionStatus, NotificationType** (10 endpoints)
```
GET /roles | /plans | /subscription-statuses | /notification-types
GET /roles/:id | /plans/:id | ...
GET /roles/code/:code | /plans/code/:code | ...
```

---

## 🔐 Exemplos de Requisição

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Criar Conta

```bash
curl -X POST http://localhost:3000/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "roleId": "uuid-role-customer"
  }'
```

### Listar Contas (requer JWT)

```bash
curl http://localhost:3000/accounts \
  -H "Authorization: Bearer <accessToken>"
```

---

## 🐳 Docker Setup

### PostgreSQL + Redis (Local)

```bash
# Inicia containers
docker-compose up -d

# Para tudo
docker-compose down

# Logs
docker-compose logs -f postgres redis
```

**Credenciais padrão:**
- PostgreSQL: `postgresql://ninomia:password@localhost:5432/ninomia_dev`
- Redis: `redis://localhost:6379`

---

## 🧪 Testes

```bash
npm test              # Testes unitários
npm run test:watch    # Watch mode
npm run test:cov      # Com cobertura
npm run test:e2e      # Testes end-to-end
```

---

## 🗄️ Prisma

```bash
npm run prisma:generate    # Gera Prisma client
npm run prisma:migrate     # Cria migration
npm run prisma:seed        # Popula dados iniciais
npx prisma studio         # UI visual do banco
```

---

## 🔧 Desenvolvimento

### Variáveis de Ambiente

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ninomia_dev
JWT_SECRET=seu-secret-super-seguro-access-token
JWT_REFRESH_SECRET=seu-secret-super-seguro-refresh-token
PORT=3000
NODE_ENV=development
```

### Linting & Build

```bash
npm run lint          # Fix linting errors
npm run format        # Format code
npm run build         # Build para produção
npm run start:prod    # Executar em produção
```

---

## 📊 Status do Projeto

### ✅ Módulos Implementados

| Módulo | Endpoints | Status |
|--------|-----------|--------|
| **auth** | 4 | ✅ 100% |
| **account** | 9 | ✅ 100% |
| **credential** | 5 | ✅ 100% |
| **role** | 3 | ✅ 100% |
| **plan** | 4 | ✅ 100% |
| **subscription-status** | 3 | ✅ 100% |
| **notification-type** | 3 | ✅ 100% |

**Total:** 31 endpoints implementados ✨

### 🔄 Próximos Passos

- [ ] Swagger documentation
- [ ] Forgot password + reset password
- [ ] Tenant module com schema-per-tenant
- [ ] Restaurant module
- [ ] Order module

---

## 🏛️ Arquitetura

### Padrões Implementados

- **Repository Pattern** — Abstração de dados com null/error handling centralizado
- **Service Layer** — Lógica de negócio
- **Dependency Injection** — NestJS nativo
- **Error Handling Centralizado** — PrismaErrorService
- **Types com Prisma.GetPayload** — Tipos seguros e sincronizados
- **Módulos Independentes** — Cada entidade tem seu módulo

### Decisões de Design

- **Monolito MVP** — Velocidade > escalabilidade prematura
- **JWT Stateless** — Escalabilidade horizontal fácil
- **PostgreSQL** — Robusto, ACID, suporta schema isolation
- **Prisma** — Type safety, migrations tipadas
- **Null Handling no Repository** — Evita duplicação nos services

**Leia mais:** [CONTEXT.md](./CONTEXT.md)

---

## 📚 Documentação Completa

- **[CONTEXT.md](./CONTEXT.md)** — Arquitetura, padrões, modelos, convenções, roadmap (2.000+ linhas)
- **[NestJS Docs](https://docs.nestjs.com)** — Framework
- **[Prisma Docs](https://www.prisma.io/docs)** — ORM

---

## 🤝 Contribuição

### Padrão de Commits

```
feat(auth): implementar login com JWT
fix(account): corrigir validação de role
test(credentials): adicionar testes
docs: atualizar CONTEXT.md
refactor(repository): centralizar tratamento de null
```

### PR Checklist

- [ ] Testes passando
- [ ] Cobertura mantida
- [ ] Linting sem erros
- [ ] CONTEXT.md atualizado
- [ ] Commits descritivos

---

## 🐛 Troubleshooting

### PostgreSQL não conecta

```bash
docker-compose up -d
```

### Prisma client não encontrado

```bash
npm run prisma:generate
```

### Port 3000 já em uso

```bash
PORT=3001 npm run start:dev
```

---

## 📄 License

**Proprietary.** Código fechado — não distribuir sem permissão.

Desenvolvido por **Paulo** — Solo developer.

---

<div align="center">

**[⬆ Voltar ao topo](#)**

Feito com ❤️ em **Ananindeua, PA** 🇧🇷

**45% do MVP concluído — 31 endpoints em 7 módulos modularizados! 🚀**

</div>
