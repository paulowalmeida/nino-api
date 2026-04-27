# nino-api

API do **Nino** — SaaS white-label de delivery para restaurantes. B2B, mensalidade fixa, zero comissão por pedido.

Para arquitetura, regras de negócio e convenções, veja [`context.md`](./context.md).

---

## Quick Start

**Pré-requisitos:** Node.js v20+, PostgreSQL v14+

```bash
npm install
cp .env.example .env          # configure DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev             # http://localhost:3000
```

Docker (PostgreSQL local):

```bash
docker-compose up -d
```

---

## Stack

- **NestJS** v11 + TypeScript
- **Prisma** + PostgreSQL (schema-per-tenant)
- **JWT** — access 15min / refresh 7d
- **bcrypt**, **Helmet**, **@nestjs/throttler**

---

## Scripts

```bash
npm test                   # unitários
npm run test:cov           # cobertura
npm run test:e2e           # e2e
npm run prisma:migrate     # nova migration
npm run prisma:seed        # seed
npx prisma studio          # UI do banco
npm run lint
npm run build
npm run start:prod
```

---

## Variáveis de Ambiente

```env
DATABASE_URL=postgresql://user:password@localhost:5432/ninomia_dev
JWT_SECRET=...
JWT_REFRESH_SECRET=...
PORT=3000
NODE_ENV=development
```

---

**Proprietary.** Desenvolvido por Paulo Weskley.
