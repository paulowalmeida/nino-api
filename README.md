# Nino Delivery — nino-api

## 📋 Sumário

* [1. 📋 Visão Geral e Modelo de Negócio (Business Core)](#1--visão-geral-e-modelo-de-negócio-business-core)
* [2. 🏗️ Arquitetura Geral](#2-️-arquitetura-geral)
* [3. 🧰 Stack Tecnológica Oficial](#3--stack-tecnológica-oficial)
* [4. 🖥️ Stack Técnico Detalhado](#4-️-stack-técnico-detalhado)
* [5. 📁 Estrutura de Pastas e Arquitetura de Módulos](#5--estrutura-de-pastas-e-arquitetura-de-módulos)
* [6. 🗄️ Topologia do Banco de Dados e Entidades](#6-️-topologia-do-banco-de-dados-e-entidades)
* [7. 🔐 Segurança, Autenticação e Autorização](#7--segurança-autenticação-e-autorização)
* [8. 🛡️ Guards por Role (RBAC)](#8-️-guards-por-role-rbac)
* [9. 🛣️ Endpoints da API](#9-️-endpoints-da-api)
* [10. 🏛️ Padrões Arquiteturais](#10-️-padrões-arquiteturais)
* [11. ✍️ Convenções de Escrita](#11-️-convenções-de-escrita)
* [12. 🧪 Padrões de Teste](#12--padrões-de-teste)
* [13. 🔄 Fluxos Principais](#13--fluxos-principais)
* [14. 🔧 Trade-offs & Decisões Arquiteturais](#14--trade-offs--decisões-arquiteturais)
* [15. 📊 Status dos Módulos](#15--status-dos-módulos)
* [16. 🚀 Próximas Features (Roadmap)](#16--próximas-features-roadmap)
* [17. 🛠️ Variáveis de Ambiente](#17-️-variáveis-de-ambiente)
* [18. 🐳 Docker & Local Development](#18--docker--local-development)
* [19. 📚 Referências & Documentação](#19--referências--documentação)
* [20. 🤝 Contribuição & Commits](#20--contribuição--commits)
* [21. 📞 Suporte & Dúvidas](#21--suporte--dúvidas)

## 1. 📋 Visão Geral e Modelo de Negócio (Business Core)

### 1.1 Identidade e Conceito do Produto
O **Nino** é uma plataforma de Software as a Service (SaaS) voltada para o mercado de alimentação (restaurantes, lanchonetes, padarias e similares). O sistema opera sob o modelo **White-Label B2B**, o que define as seguintes premissas obrigatórias:
- **Invisibilidade da Marca:** O cliente final (o consumidor que pede a comida) nunca interage com a marca "Nino". Toda a interface, comunicação e domínio são personalizados com a identidade visual do restaurante contratante.
- **Isolamento de Marca:** Cada `Company` (Empresa) possui sua própria configuração de identidade, permitindo que o sistema se comporte como um aplicativo proprietário para cada cliente.
- **Origem e Propósito:** O nome é uma homenagem afetiva ao pet da família fundadora, trazendo uma identidade de proximidade e cuidado para um produto tecnológico de alta performance.
---

### 1.2 Modelo de Monetização e Estratégia Comercial
O Nino rompe com o padrão de mercado de marketplaces de delivery (como iFood ou Rappi) ao abandonar a cobrança de comissões por transação.
- **Zero Comissão:** O restaurante retém 100% do valor das vendas realizadas através da plataforma. Não existem taxas ocultas sobre o faturamento.
- **Assinatura Fixa:** A receita da plataforma é gerada exclusivamente através de mensalidades fixas, permitindo previsibilidade de custos para o dono do restaurante e escalabilidade para a plataforma.
- **Foco Regional:** A estratégia inicial de penetração de mercado é focada no **Norte do Brasil (Estado do Pará)**, visando atender as particularidades logísticas e de consumo da região antes da expansão nacional.
---

### 1.3 Detalhamento dos Planos e Limites (Hard Logic)
O sistema deve validar os limites impostos pelos planos em todas as camadas de criação de recursos. Os dados são persistidos na tabela `Plan` e controlados via `Subscription`.

#### 1.3.1 Plano Iniciante
- **Valor:** R$ 97,00 mensais.
- **Limites Físicos:**
    - **Unidades (Tenants):** Máximo de 1 unidade ativa. O sistema deve impedir a criação de um segundo `Tenant` se a `Subscription` estiver vinculada a este plano.
    - **Pedidos Mensais:** Limite de até 200 pedidos processados por mês.
- **Suporte:** Suporte padrão via canais digitais (não prioritário).
- **Indicado para:** Microempreendedores e pequenos estabelecimentos em fase de digitalização.

#### 1.3.2 Plano Profissional
- **Valor:** R$ 197,00 mensais.
- **Limites Físicos:**
    - **Unidades (Tenants):** Até 3 unidades (filiais) geridas sob a mesma `Company`.
    - **Pedidos Mensais:** Ilimitados. Não há trava de volume de vendas.
- **Diferenciais:**
    - **Suporte Prioritário:** Acesso direto via WhatsApp (identificado pela flag `hasPrioritySupport` na lógica de atendimento).
    - **Gestão Multiloja:** Painel administrativo preparado para alternar entre unidades.
- **Indicado para:** Restaurantes em crescimento e pequenas redes locais.

#### 1.3.3 Plano Rede
- **Valor:** Sob consulta (negociação direta com o time de vendas).
- **Limites Físicos:**
    - **Unidades (Tenants):** 4 ou mais unidades.
    - **Personalização:** Possibilidade de módulos customizados e integrações específicas.
- **Indicado para:** Franquias e grandes redes de alimentação.
---

### 1.4 Regras de Negócio do Ciclo de Vida do Cliente
O estado operacional de uma empresa no sistema é determinado pela combinação das tabelas `Company`, `Subscription` e `Invoice`.

#### 1.4.1 Período de Degustação (Trial)
- **Duração:** 30 dias de uso gratuito e irrestrito (baseado no plano escolhido).
- **Sem Cartão:** O registro não exige dados de pagamento imediatos, reduzindo a fricção no onboarding.
- **Conversão:** O sistema deve disparar gatilhos de renovação nos dias 15, 25 e 29 do período de trial.

#### 1.4.2 Status de Pagamento e Suspensão (Billing Workflow)
As regras de suspensão são rigorosas para garantir a saúde financeira do SaaS:
- **Adimplência (Status ACTIVE):** Acesso total ao Dashboard e ao site de vendas do restaurante.
- **Atraso Nível 1 (3 dias):** Suspensão imediata do acesso ao Dashboard administrativo. O site de vendas continua operando, mas o dono não consegue gerir pedidos novos.
- **Atraso Nível 2 (5 dias):** Suspensão total. O site de vendas (Tenant) entra em modo "MAINTENANCE" (Manutenção Técnica), exibindo uma mensagem genérica para o consumidor final.
- **Inatividade (Status INACTIVE):** Após um período definido de inadimplência, a `Company` é marcada como `isActive = false`, o que resulta na invalidação de todos os tokens JWT de seus usuários via `AuthGuard`.
---

### 1.5 Diferenciais Competitivos e Proposta de Valor
- **Independência Digital:** O restaurante deixa de ser refém de algoritmos de terceiros e constrói sua própria base de dados de clientes.
- **Facilidade de Uso:** Foco em UX (User Experience) simplificada para o dono do restaurante, que muitas vezes não é um usuário avançado de tecnologia.
- **Infraestrutura Robusta:** Isolamento rigoroso garantido na arquitetura de banco de dados, assegurando que operações e dados de uma Unidade nunca sejam expostos ou interceptados por outra.
---

## 2. 🏗️ Arquitetura Geral
A arquitetura do Nino é desenhada para suportar um modelo SaaS B2B Multi-Tenant com garantia absoluta de não vazamento de dados entre clientes. Para isso, adotamos uma estrutura de isolamento físico a nível de banco de dados, orquestrada por padrões de projeto estritos no back-end.

### 2.1 Estratégia Multi-Tenant (Row-Level Isolation)
O isolamento de dados entre restaurantes é garantido por **row-level isolation**: todas as entidades operacionais carregam um `tenantId` como chave estrangeira, e toda query é filtrada por ele na camada de repositório. O banco de dados é um schema `public` único.

#### 2.1.1 Organização das Entidades
- **Entidades de plataforma (SaaS):** `Company`, `CompanyResponsible`, `Plan`, `Subscription`, `User`, `Credential`, `Session`, `GlobalRole`, `TenantRole` e domínios estáticos.
- **Entidades operacionais (por tenant):** `Tenant`, `Product`, `ProductCategory`, `ProductModifier`, `Order`, `Customer`, `CustomerAddress`, `CustomerTenant` — todas filtradas por `tenantId`.

#### 2.1.2 Roteamento de Contexto
1. Rotas operacionais exigem identificação do Tenant alvo (Header `X-Tenant-ID` ou subdomínio).
2. Um Guard/Interceptor do NestJS extrai e valida o identificador.
3. O `tenantId` é injetado no contexto da requisição e repassado ao repositório, que aplica o filtro em todas as queries.
---

### 2.2 Padrão de Camadas Estrito (Strict 3-Tier Layering)
A separação de responsabilidades é inegociável. Nenhuma regra de negócio deve conhecer o ORM, e nenhum roteamento deve calcular dados.

#### 2.2.1 **Controller Layer (`*.controller.ts`)**: 
- **Única função:** Roteamento HTTP, extração de Headers/Cookies, aplicação de Guards (Segurança) e sanitização de entrada via DTOs.
- **Regra:** Proibido o uso de IF/ELSE para lógicas de negócio. Só delega para o Service e devolve a resposta.
#### 2.2.2 **Service Layer (`*.service.ts`)**: 
- **Única função:** O coração da aplicação. Executa cálculos, regras financeiras, orquestra fluxos complexos (ex: Onboarding cria 4 entidades diferentes).
- **Regra:** Nunca importa o Prisma Client diretamente. Depende exclusivamente dos Repositories, o que permite criar Mocks perfeitos para os testes unitários.
#### 2.2.3   **Repository Layer (`*.repository.ts`)**: 
- **Única função:** A ponte de infraestrutura com o banco de dados. 
- É o único lugar do código autorizado a usar o `PrismaService` e construir queries Prisma.
- **Tratamento de Erros:** Captura códigos de erro nativos do Postgres (ex: violação de Unique Key `23505`) e traduz para exceções HTTP do NestJS (ex: `ConflictException`), blindando o Service.
---

### 2.3 Estrutura de Diretórios e Modularização
O projeto utiliza **Feature Modules** (Modularização por Domínio), facilitando a manutenção e a injeção de dependências.

- **`/src`**: Raiz da aplicação.
    - **`/modules`**: Todos os Feature Modules (auth, company, user, plan, tenant, etc.).
    - **`/config/database`**: PrismaService e configurações base de conexão.
    - **`/shared`**: O núcleo de utilidades globais.
        - **`/shared/interceptors`**: A lógica de captura e injeção do contexto do Tenant.
        - Guardiões, Validadores de CNPJ/CPF e Serviços de Criptografia de Senha.
- **`/prisma`**: Schema declarativo e migrations gerenciadas pelo Prisma.

### 2.4 Defesas na Borda (Edge Configuration)
Configurações fixadas no `AppModule` e `main.ts` que afetam globalmente o tráfego:
- **Filtros de Exceção Globais (`ExceptionFilter`):** Impedem que erros brutos de SQL vazem no JSON de resposta.
- **Pipes de Validação Rigorosos:** Remoção passiva de campos extras (whitelist) e bloqueio ativo (forbidNonWhitelisted).

## 3. 🧰 Stack Tecnológica Oficial
Para suportar a arquitetura acima, a stack do Nino foi definida com as seguintes tecnologias e dependências:

### 3.1 Motor e Linguagem
- **Linguagem:** TypeScript v5.7 (Tipagem estrita obrigatória, evitando `any` a todo custo).
- **Runtime:** Node.js (Versão LTS atual).
- **Framework Core:** NestJS v11 (`@nestjs/core: ^11.0.1`).
  - *Motivo:* Fornece um ecossistema maduro com Inversão de Controle (IoC) via injeção de dependência nativa, forçando uma arquitetura limpa desde o dia 1.

### 3.2 Persistência de Dados e ORM
- **Banco de Dados:** PostgreSQL v16 (Ambiente de desenvolvimento provisionado via Docker & Docker Compose).
- **ORM Principal:** Prisma ORM v7.8 (`prisma`, `@prisma/client`, `@prisma/adapter-pg`).
  - *Motivo:* Com a adoção de row-level isolation (em vez de schema-per-tenant), o Prisma passa a ser a escolha ideal — type safety completo gerado a partir do schema, migrações declarativas e client zero-overhead.
- **Driver Nativo:** `pg` — conectado via `@prisma/adapter-pg` (driver adapter oficial).

### 3.3 Autenticação, Segurança e Acesso
- **Gestão de Tokens:** `@nestjs/jwt` acoplado ao `@nestjs/passport` utilizando a estratégia de "Access Token" (vida curta) via Header Bearer, e "Refresh Token" salvo no banco de dados para revogação instantânea de sessões de dispositivos.
- **Criptografia:** `bcrypt` para hashing de senhas. Nenhuma credencial crua é armazenada no banco.
- **Proteção de Redes:** `@nestjs/throttler` configurado globalmente para rate limiting (ex: bloqueia IPs que superam 10 requisições por minuto na API de login, prevenindo ataques de força bruta).

### 3.4 Sanitização e Validação de Dados
- **Ferramentas:** `class-validator` e `class-transformer` (`^0.15.1` e `^0.5.1`).
  - *Uso:* Acoplados aos DTOs (Data Transfer Objects) na camada de Controller. Eles realizam a limpeza de dados e cast de tipos primitivos (ex: converter string numéricas para inteiros) antes que a requisição encoste na camada de Service.

### 3.5 Ecossistema de Qualidade de Código e Testes
- **Testes Unitários e de Integração:** Jest v30 (`jest: ^30.0.0`, `ts-jest: ^29.2.5`).
  - *Padrão de Cobertura:* Focado em Services e Repositories isolados. DTOs e entidades passivas não afetam o cálculo de métrica de cobertura.
- **Testes E2E:** Supertest (`supertest: ^7.0.0`) para validar fluxos HTTP completos contra o banco de testes via Docker.
- **Padronização:** ESLint estrito e Prettier.

### 3.6 Tabela de Componentes Core

| Camada / Responsabilidade | Tecnologia Base | Descrição e Função no Ecossistema Nino |
| :--- | :--- | :--- |
| **Engine / Core** | NestJS v11 + TypeScript | Framework principal operando como um monolito modular RESTful. Fornece a base de injeção de dependências (IoC), roteamento e arquitetura em camadas. |
| **Persistência Relacional** | PostgreSQL v16 | Banco de dados central. Adota row-level isolation via `tenantId` FK em schema `public` único. Isolamento garantido na camada de repositório. |
| **Object-Relational Mapping** | Prisma ORM v7.8 | ORM com type safety gerado a partir do schema declarativo. Migrações versionadas, client zero-overhead e adapter nativo via `@prisma/adapter-pg`. |
| **Segurança e Autenticação** | Passport.js + JWT + bcrypt | O motor de acesso. `bcrypt` realiza o *hash* das senhas. O JWT emite *Access Tokens* de vida curta, enquanto `Passport` valida os *Refresh Tokens* persistidos no banco. |
| **Sanitização na Borda** | class-validator + class-transformer | Barreira de entrada HTTP. Valida os DTOs e rejeita propriedades não mapeadas (*forbidNonWhitelisted*), protegendo a API de injeções de *payload*. |
| **Proteção de Rede** | @nestjs/throttler | Sistema de *Rate Limiting* configurado globalmente para evitar ataques de força bruta em endpoints sensíveis (ex: login). |
| **Health Check** | @nestjs/terminus | Endpoint de verificação de saúde da API e conexão com o banco de dados. |
| **Qualidade e Testes Unitários** | Jest v30 + ts-jest | Suíte de testes unitários com foco nas regras de negócio (Services) e infraestrutura (Repositories). O *coverage* ignora arquivos anêmicos (DTOs, Enums). |
| **Testes E2E (Integração)** | Supertest | Validação dos fluxos completos da API, simulando requisições HTTP reais contra banco de dados de teste via Docker. |
| **Gestão de Ambiente / Local** | Docker + Docker Compose | Infraestrutura como código para o ambiente de desenvolvimento. Sobe a instância do PostgreSQL localmente. |
| **Linting e Formatação** | ESLint + Prettier | Ferramentas de análise estática e padronização visual do código TypeScript. |

### 3.7 Omissões Deliberadas (Out of Scope)
Para clareza dos agentes de IA e programadores, os seguintes componentes **não** fazem parte da `nino-api`, embora possam compor o ecossistema Nino como um todo:
- **Front-ends:** Painéis de restaurante, Landing Pages e Web Apps whitelabel (geridos em repositórios separados, atualmente focados em HTML/JS puro ou Next.js).
- **Filas e Cache:** Redis e BullMQ não estão integrados no estado atual (MVP) para evitar *over-engineering* prematuro. O processamento atual é síncrono.
- **Storage de Imagens:** O upload de logótipos e *assets* ainda não está implementado na API e não possui dependências ativas no `package.json` (como drivers da AWS S3 ou Cloudflare R2).
---

## 4. 🖥️ Stack Técnico Detalhado

### Runtime & Framework

- **Node.js** + **TypeScript** — Type safety end-to-end
- **NestJS** (v11) — Framework opinionado com injeção de dependência, decorators, estrutura modular
- **express** (abstrato via NestJS)

### Banco de Dados & ORM

- **PostgreSQL** (v16) — Banco relacional com row-level isolation via `tenantId`
- **Prisma ORM** (v7.8) — ORM com type safety gerado a partir do schema declarativo e migrações versionadas
- **`pg`** + **`@prisma/adapter-pg`** — Driver nativo PostgreSQL conectado via adapter oficial do Prisma

### Autenticação & Segurança

- **JWT (JSON Web Tokens)** — Stateless; access token 15min + refresh token 7 dias via cookie HttpOnly
- **Passport.js** (v0.7) — Estratégias de autenticação plugáveis
- **bcrypt** (v6) — Hashing de senhas e refresh tokens
- **@nestjs/jwt** + **@nestjs/passport** — Integração nativa NestJS
- **cookie-parser** — Parsing de cookies HTTP; essencial para leitura do refreshToken HttpOnly
- **Rate limiting** (@nestjs/throttler v6.5) — Proteção contra força bruta e abuse

### Documentação

- **@nestjs/swagger** + **swagger-ui-express** — Documentação interativa disponível em `/api/docs`
- **@nestjs/terminus** — Health check endpoint para monitoramento da API e banco de dados

### Validação de Dados

- **class-validator** + **class-transformer** — DTOs com validação declarativa
- **ValidationPipe global** — `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`

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
  "@nestjs/swagger": "^11.2.7",
  "@nestjs/terminus": "^11.1.1",
  "@nestjs/throttler": "^6.5.0",
  "@prisma/adapter-pg": "^7.8.0",
  "@prisma/client": "^7.8.0",
  "bcrypt": "^6.0.0",
  "class-transformer": "^0.5.1",
  "class-validator": "^0.15.1",
  "cookie-parser": "^1.4.7",
  "dotenv-cli": "^11.0.0",
  "passport": "^0.7.0",
  "passport-jwt": "^4.0.1",
  "pg": "^8.20.0",
  "swagger-ui-express": "^5.0.1"
}
```

---

## 5. 📁 Estrutura de Pastas e Arquitetura de Módulos

O projeto adota uma arquitetura estrita de **Feature Modules** (Modularização por Domínio). Cada diretório dentro de `src/` opera como um micro-ecossistema auto-contido, encapsulando seu próprio Controller, Service, Repository, DTOs e Tipos. Navegações relativas confusas (`../../../`) são evitadas através de Path Aliases configurados no TypeScript.

Abaixo está a radiografia completa e exaustiva do repositório:

```text
nino-api/
├── src/
│   ├── main.ts                          # Entry point (Bootstrap, Global Pipes, Swagger, Throttler)
│   ├── app.module.ts                    # Root module (importa todos os Feature Modules)
│   ├── app.controller.ts                # Rotas base globais
│   ├── app.service.ts                   # Lógicas globais base
│   │
│   ├── config/
│   │   └── database/                    # PrismaService e seed
│   │
│   ├── mocks/                           # 🧪 Utilitários para Desenvolvimento e Testes
│   │   ├── cnpj/                        # Mock de geração e validação de CNPJ
│   │   ├── user/                        # Mock de injeção de usuários para E2E
│   │   └── data/                        # user.data.mock.ts
│   │
│   ├── modules/                         # Feature Modules (domínios da aplicação)
│   │   │
│   │   ├── auth/                        # 🔐 Autenticação
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts       # GET /auth/me, POST /login, /register, /refresh, /logout
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt-refresh.guard.ts
│   │   │   ├── jwt-refresh.strategy.ts
│   │   │   ├── dtos/                    # login-request, register-request, change-password
│   │   │   └── types/                   # tokens.type, login-response.type
│   │   │
│   │   ├── company/                     # 🏢 Empresas (Clientes do SaaS)
│   │   │   ├── company.module.ts
│   │   │   ├── company.controller.ts    # CRUD + activate/deactivate
│   │   │   ├── company.service.ts
│   │   │   ├── company.repository.ts
│   │   │   ├── dto/
│   │   │   ├── types/
│   │   │   └── modules/
│   │   │       ├── business-category/           # Categorias de negócio
│   │   │       ├── company-business-category/   # Vínculo empresa ↔ categoria
│   │   │       └── company-responsible/         # Representante legal da empresa
│   │   │
│   │   ├── credential/                  # 🔑 Credenciais (Preparado para OAuth)
│   │   │   ├── credential.module.ts
│   │   │   ├── credential.controller.ts
│   │   │   ├── credential.service.ts
│   │   │   ├── credential.repository.ts
│   │   │   ├── dto/
│   │   │   └── types/
│   │   │
│   │   ├── health/                      # ❤️ Health Check
│   │   │   └── health.controller.ts
│   │   │
│   │   ├── invoice/                     # 🧾 Faturas
│   │   │   └── modules/
│   │   │       └── invoice-status/      # PENDING, PAID, VOID
│   │   │
│   │   ├── notification/                # 🔔 Notificações
│   │   │   └── modules/
│   │   │       └── notification-type/   # SYSTEM, BILLING, ORDER
│   │   │
│   │   ├── plan/                        # 💳 Catálogo Comercial
│   │   │   ├── plan.module.ts
│   │   │   ├── plan.controller.ts
│   │   │   ├── plan.service.ts
│   │   │   ├── plan.repository.ts
│   │   │   ├── dtos/
│   │   │   ├── types/
│   │   │   └── modules/
│   │   │       └── plan-type/           # MONTHLY, YEARLY
│   │   │
│   │   ├── role/                        # 🛡️ RBAC
│   │   │   └── modules/
│   │   │       ├── global-role/         # Roles de plataforma (ADMIN_NINO, OWNER, ...)
│   │   │       └── tenant-role/         # Roles operacionais (MANAGER, KITCHEN, ...)
│   │   │
│   │   ├── session/                     # 📱 Sessões e Refresh Tokens
│   │   │   ├── session.module.ts
│   │   │   ├── session.controller.ts
│   │   │   ├── session.service.ts
│   │   │   ├── session.repository.ts
│   │   │   ├── dtos/
│   │   │   └── types/
│   │   │
│   │   ├── subscription/                # 📑 Assinaturas
│   │   │   └── modules/
│   │   │       └── subscription-status/ # TRIAL, ACTIVE, PAST_DUE, CANCELED
│   │   │
│   │   ├── tenant/                      # 🏪 Lojas Whitelabel
│   │   │   └── modules/
│   │   │       └── tenant-status/       # CONFIGURING, ACTIVE, MAINTENANCE
│   │   │
│   │   └── user/                        # 👥 Usuários Operadores
│   │       ├── user.module.ts
│   │       ├── user.controller.ts
│   │       ├── user.service.ts
│   │       ├── user.repository.ts
│   │       ├── dtos/
│   │       ├── types/
│   │       └── modules/
│   │           └── user-tenant/         # Vínculo usuário ↔ tenant
│   │
│   └── shared/                          # 🛠️ Core Transversal (Recursos Globais)
│       ├── decorators/                  # @Roles e outros decorators customizados
│       ├── dtos/                        # DTOs compartilhados (ex: paginação)
│       ├── enums/                       # GlobalRole, TenantRole, enums de status
│       ├── guards/                      # JwtAuthGuard, RolesGuard
│       ├── interceptors/                # Interceptor de contexto do Tenant
│       ├── interfaces/                  # IBaseRepository e contratos compartilhados
│       ├── repositories/                # BaseRepository<T>
│       ├── services/                    # ErrorService, PasswordService, TokenService
│       ├── strategies/                  # jwt-auth.strategy.ts
│       ├── types/                       # AuthRequest e types globais
│       └── validators/                  # CnpjValidator (custom class-validator)
│
├── prisma/                              # 📜 Schema e migrations Prisma
│   ├── schema.prisma
│   └── migrations/
│
├── test/                                # 🚥 Testes End-to-End
│   ├── app.e2e-spec.ts
│   └── jest-e2e.json
│
├── collections/                         # 🗂️ Coleções de API (Insomnia/Postman)
│   ├── auth.collection.yaml
│   ├── business-category.collection.yaml
│   ├── company-business-category.collection.yaml
│   ├── company-responsible.collection.yaml
│   ├── company.collection.yaml
│   ├── global-role.collection.yaml
│   ├── invoice-status.collection.yaml
│   ├── notification-type.collection.yaml
│   ├── onboarding.collection.yaml
│   ├── plan-type.collection.yaml
│   ├── plan.collection.yaml
│   ├── session.collection.yaml
│   ├── subscription-status.collection.yaml
│   ├── tenant-role.collection.yaml
│   ├── tenant-status.collection.yaml
│   ├── user-tenant.collection.yaml
│   └── user.collection.yaml
│
└── (raiz)                               # docker-compose.yml, .env, package.json,
                                         # tsconfig.json, eslint.config.mjs, nest-cli.json
```
---

## 6. 🗄️ Topologia do Banco de Dados e Entidades

A modelagem de dados é definida no `prisma/schema.prisma`. Abaixo está o detalhamento de cada entidade do sistema, seu propósito de negócio e como elas se relacionam.

*(Nota: Colunas de infraestrutura padrão como `id`, `description`, `createdAt` e `updatedAt` são omitidas desta documentação por já estarem padronizadas em todas as entidades nas camadas base do código).*

### 6.1 Schema Global B2B (`public`)
Este schema centraliza o motor do SaaS. Ele gerencia assinaturas, empresas, segurança e o roteamento de lojas. Consumidores finais nunca interagem com os dados armazenados aqui.

#### 6.1.1 Entidades de Domínio e Status (Auxiliares de Negócio)
Estas tabelas definem as regras de estado e permissões do sistema.
- **`GlobalRole`**: Roles de plataforma (ex: `ADMIN_NINO`, `OWNER`). Vinculado ao `User` para controle de acesso B2B.
- **`TenantRole`**: Roles operacionais por loja (ex: `MANAGER`, `KITCHEN`, `WAITER`, `DELIVERY_MAN`). Vinculado ao `UserTenant`.
- **`TenantStatus`**: Dita o estado operacional de uma unidade whitelabel (`CONFIGURING`, `ACTIVE`, `MAINTENANCE`, `SUSPENDED`).
- **`TenantType`**: Categoriza o tipo de estabelecimento (ex: restaurante, padaria, lanchonete).
- **`SubscriptionStatus`**: Define se a empresa está em `TRIAL`, `ACTIVE`, `PAST_DUE` ou `CANCELED`.
- **`InvoiceStatus`**: Rastreia o ciclo de vida de uma cobrança (`PENDING`, `PAID`, `VOID`).
- **`PaymentStatus`**: Estado de um pagamento específico (ex: `PENDING`, `APPROVED`, `FAILED`).
- **`PaymentMethod`**: Métodos de pagamento disponíveis na plataforma (ex: `PIX`, `CREDIT_CARD`).
- **`PlanType`**: Periodicidade da cobrança (`MONTHLY`, `YEARLY`).
- **`NotificationType`**: Classifica alertas do painel (`SYSTEM`, `BILLING`, `ORDER`).

#### 6.1.2 Entidades do Core B2B (Clientes e Faturamento)
- **`Company`**: A raiz de um cliente pagante.
  - *Campos de Negócio:* `companyName`, `cnpj` (Unique), `legalName`, `stateRegistration`.
  - *Comportamento:* A coluna `isActive` funciona como um Master Switch. Se for `false`, toda a árvore de usuários e lojas perde acesso à API.
  - *Relacionamentos:* Única dona da `Subscription` e do `CompanyResponsible`. Agrupa múltiplos `User`, `Tenant` e `CompanyBusinessCategory`.
- **`CompanyResponsible`**: O representante legal perante o SaaS.
  - *Campos de Negócio:* `name`, `cpf` (Unique), `email`, `phone`.
  - *Comportamento:* Vinculada 1:1 com a `Company`. Deletada em cascata se a empresa for destruída.
- **`BusinessCategory`**: Categorias de segmento de negócio disponíveis na plataforma (ex: Restaurante, Pizzaria, Padaria).
- **`CompanyBusinessCategory`**: Tabela de junção entre `Company` e `BusinessCategory`. Permite que uma empresa seja classificada em múltiplas categorias.
- **`Plan`**: O catálogo de produtos do SaaS.
  - *Campos de Negócio:* `name`, `slug` (Unique), `price`.
  - *Travas Lógicas:* `maxTenants`, `maxProducts` e `maxOrders`. O `PlanService` lê estes valores para barrar criação de recursos além do limite do plano.

#### 6.1.3 Entidades de Segurança, Autenticação e Acesso
- **`User`**: O operador humano (ou de sistema).
  - *Campos de Negócio:* `isActive`, `lastLoginAt`, `locale`, `timezone`.
  - *Relação Crítica:* Possui chave estrangeira `globalRoleId`.
  - *A Regra SetNull:* A ligação com `Company` (`companyId`) é **opcional**, permitindo usuários "Suporte Nino" sem vínculo a uma empresa específica.
- **`Credential`**: A blindagem de acesso.
  - *Campos de Negócio:* `email` (Unique), `password` (Hashed), `provider` (padrão: `local`), `providerId`.
  - *Restrição:* Chave única composta por `userId` + `provider`. Pronto para OAuth sem quebrar o banco.
- **`Session`**: O rastreio ativo de segurança.
  - *Campos de Negócio:* `refreshToken` (Unique e criptografado), `ipAddress`, `userAgent`, `expiresAt`.
  - *Comportamento:* Gerado a cada login. Permite expiração forçada, auditoria e token rotation.
- **`UserTenant`**: Vínculo entre `User` e `Tenant`. Carrega o `tenantRoleId` do operador naquela loja específica.
- **`Invite`**: Convite para um usuário ingressar em um `Tenant`.

#### 6.1.4 Entidades do Produto SaaS (White-Label)
- **`Tenant`**: A vitrine operacional (a "Loja" em si).
  - *Campos Visuais/Identidade:* `slug` (Unique), `logoUrl`, `favicon`, `primaryColor`, `secondaryColor`.
  - *Configuração de Rede:* `customDomain` (Unique, Nullable).
  - *Arquitetura:* O interceptor lê o `customDomain` ou `slug` da requisição HTTP para resolver o `tenantId` antes de qualquer operação.
- **`TenantPhone`**: Telefones de contato do Tenant.
- **`TenantSettings`**: Configurações operacionais do Tenant (ex: tempo de entrega, raio de entrega, taxa mínima).
- **`TenantPaymentMethod`**: Métodos de pagamento habilitados por Tenant.
- **`OpeningHours`**: Horários de funcionamento do Tenant por dia da semana.
- **`Subscription`**: O contrato vigente.
  - *Campos de Negócio:* `startedAt`, `expiresAt`.
  - *Relacionamentos:* Amarração 1:1 com `Company`. Liga-se a um `Plan` e a um `SubscriptionStatus`.

---

### 6.2 Entidades Operacionais (isoladas por `tenantId`)
Todas as entidades abaixo residem no schema `public` mas são sempre filtradas por `tenantId` na camada de repositório. **Nenhuma query retorna dados de outro Tenant.**

- **`ProductCategory`**: Categorias do cardápio da loja.
- **`Product`** / **`ProductImage`**: Produto do cardápio e suas imagens.
- **`ProductModifier`** / **`ProductModifierOption`** / **`ProductModifierMap`**: Opcionais do produto (ex: tamanho, borda) e o vínculo com cada produto.
- **`Customer`** / **`CustomerAddress`** / **`CustomerTenant`**: O consumidor final e seus endereços. `CustomerTenant` registra o vínculo com cada loja visitada (e pontos de fidelidade).
- **`Order`** / **`OrderItem`** / **`OrderItemModifier`**: O pedido e seus itens. O `unitPrice` é congelado no momento da compra para preservar o histórico financeiro.
- **`OrderStatus`** / **`OrderStatusHistory`**: Rastreio do ciclo de vida do pedido.
- **`Payment`** / **`PaymentStatus`** / **`PaymentMethod`**: Ciclo de vida financeiro de um pagamento.
- **`Invoice`**: Fatura gerada para a `Company` referente à assinatura do SaaS.
- **`Notification`**: Alertas disparados para usuários (classificados por `NotificationType`).

---
## 7. 🔐 Segurança, Autenticação e Autorização

O ecossistema de acesso do Nino foi desenhado sob uma arquitetura *Stateless* para rotas operacionais, combinada com uma validação *Stateful* para renovação de credenciais. Todo o fluxo de autenticação ocorre no schema global (`public`), garantindo que o acesso B2B seja validado antes de qualquer roteamento dinâmico para os schemas de Tenants.

### 7.1 Arquitetura de Tokens (Dual-Token System)
O sistema não utiliza sessões baseadas em memória ou cookies monolíticos. O controle de acesso é inteiramente gerido por JWT (JSON Web Tokens) através de um par de chaves:

1.  **Access Token (JWT de Vida Curta):**
    - **TTL (Time-To-Live):** 15 minutos.
    - **Finalidade:** Trafegado no header `Authorization: Bearer <token>` em todas as requisições autenticadas. Se for interceptado, o dano é contido a uma janela de 15 minutos.
2.  **Refresh Token (JWT Oculto e Persistente):**
    - **TTL (Time-To-Live):** 7 dias.
    - **Finalidade:** Utilizado exclusivamente no endpoint `/auth/refresh` para emitir um novo par de tokens.
    - **Segurança Física:** Sofre hash (via `bcrypt`) e é persistido na entidade `Session` no banco de dados. Isso viabiliza a funcionalidade de "Logout de todos os dispositivos", pois a deleção física do registro de sessão invalida o Refresh Token imediatamente.

### 7.2 Estrutura do JWT (Payload)
A interface interna do sistema (`user-token.data.type.ts`) define o contrato estrito do payload injetado no Access Token. Nenhum dado sensível (como senhas ou CPFs) trafega aqui.

```typescript
{
  sub: string,               // Identificador único do Usuário (UUID)
  role: string,              // Nome do GlobalRole (ex: 'ADMIN_NINO', 'OWNER')
  hashedRefreshToken?: string, // Presente apenas na estratégia de refresh
  iat: number,               // Issued At (injetado pelo Passport)
  exp: number                // Expiration Time (injetado pelo Passport)
}
```

## 8. 🛡️ Guards por Role (RBAC)

O acesso a cada endpoint é controlado pela combinação de `JwtAuthGuard` + `RolesGuard`. O role do usuário é extraído diretamente do payload do JWT (`role`), sem consulta adicional ao banco.

### 8.1 Matriz de Permissões

Roles: `ADMIN` = `GlobalRole.ADMIN`, `SUPPORT` = `GlobalRole.SUPPORT`, `MERCHANT` = `GlobalRole.MERCHANT`

| Endpoint | ADMIN | SUPPORT | MERCHANT |
|---|:---:|:---:|:---:|
| `GET /users` | ✓ | ✓ | — |
| `GET /users/:id` | ✓ | ✓ | ✓ |
| `GET /users/company/:companyId` | ✓ | ✓ | ✓ |
| `POST /users` | ✓ | — | — |
| `PATCH /users/:id` | ✓ | ✓ | ✓ |
| `DELETE /users/:id` | ✓ | — | — |
| `GET /companies` | ✓ | ✓ | — |
| `GET /companies/:id` | ✓ | ✓ | ✓ |
| `GET /companies/cnpj/:cnpj` | ✓ | ✓ | ✓ |
| `POST /companies` | ✓ | ✓ | — |
| `PUT /companies/:id` | ✓ | ✓ | — |
| `DELETE /companies/:id` | ✓ | — | — |
| `PATCH /companies/:id/activate` | ✓ | ✓ | — |
| `PATCH /companies/:id/deactivate` | ✓ | ✓ | — |
| `* /company-responsibles` | ✓ | ✓ | — |
| `GET /business-categories` | ✓ | ✓ | ✓ |
| `GET /business-categories/:id` | ✓ | ✓ | ✓ |
| `POST/PUT/DELETE /business-categories` | ✓ | — | — |
| `GET /companies/:companyId/business-categories` | ✓ | ✓ | ✓ |
| `POST /companies/:companyId/business-categories` | ✓ | ✓ | — |
| `DELETE/PATCH /companies/:companyId/business-categories/:id` | ✓ | ✓ | — |
| `GET /plans` | ✓ | ✓ | ✓ |
| `GET /plans/:id` | ✓ | ✓ | ✓ |
| `POST/PATCH/DELETE /plans` | ✓ | — | — |
| `GET /plan-types` | ✓ | ✓ | ✓ |
| `GET /plan-types/:id` | ✓ | ✓ | ✓ |
| `POST/PUT/DELETE /plan-types` | ✓ | — | — |
| `GET /global-roles` | ✓ | ✓ | — |
| `GET /global-roles/:id` | ✓ | ✓ | — |
| `POST/PUT/DELETE /global-roles` | ✓ | — | — |
| `GET /tenant-roles` | ✓ | ✓ | ✓ |
| `GET /tenant-roles/:id` | ✓ | ✓ | ✓ |
| `POST/PUT/DELETE /tenant-roles` | ✓ | — | ✓ |
| `GET /tenant-statuses` | ✓ | ✓ | ✓ |
| `GET /tenant-statuses/:id` | ✓ | ✓ | ✓ |
| `POST/PUT/DELETE /tenant-statuses` | ✓ | — | — |
| `GET /subscription-statuses` | ✓ | ✓ | ✓ |
| `GET /subscription-statuses/:id` | ✓ | ✓ | ✓ |
| `POST/PUT/DELETE /subscription-statuses` | ✓ | — | — |
| `GET /invoice-statuses` | ✓ | ✓ | ✓ |
| `GET /invoice-statuses/:id` | ✓ | ✓ | ✓ |
| `POST/PUT/DELETE /invoice-statuses` | ✓ | — | — |
| `GET /notification-types` | ✓ | ✓ | ✓ |
| `GET /notification-types/:id` | ✓ | ✓ | ✓ |
| `POST/PUT/DELETE /notification-types` | ✓ | — | — |
| `POST /user-tenants` | ✓ | ✓ | — |
| `GET /user-tenants/user/:userId` | ✓ | ✓ | ✓ |
| `GET /user-tenants/tenant/:tenantId` | ✓ | ✓ | ✓ |
| `DELETE /user-tenants/:userId/:tenantId` | ✓ | ✓ | — |
| `POST /sessions` | ✓ | — | — |
| `GET /sessions/list-by-user-id/:userId` | ✓ | ✓ | — |
| `GET /sessions/:id` | ✓ | ✓ | — |
| `PATCH /sessions/:id` | ✓ | — | — |
| `DELETE /sessions/:id` | ✓ | ✓ | — |

### 8.2 Implementação

```typescript
// src/shared/decorators/roles.decorator.ts
export const Roles = (...roles: GlobalRole[]) => SetMetadata(ROLES_KEY, roles)

// src/shared/guards/roles.guard.ts
canActivate(context: ExecutionContext): boolean {
  const roles = this.reflector.getAllAndOverride<GlobalRole[]>(ROLES_KEY, [
    context.getHandler(),
    context.getClass(),
  ])
  if (!roles?.length) return true
  const { user } = context.switchToHttp().getRequest<AuthRequest>()
  return roles.includes(user.role as GlobalRole)
}

// Uso no controller
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  @Get()
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT)
  getAll() { ... }
}
```

---

## 9. 🛣️ Endpoints da API
Todos os endpoints (exceto auth e mocks) usam `@UseGuards(JwtAuthGuard, RolesGuard)`. As permissões por endpoint estão detalhadas na seção 8.

### 9.1 Autenticação (`src/modules/auth/auth.controller.ts`)
* **GET `/auth/me`** — retorna dados do usuário autenticado via JWT
* **POST `/auth/login`** — valida credenciais, seta cookie HttpOnly com refreshToken, retorna `{ user, accessToken }`
* **POST `/auth/register`** — cria novo usuário e credencial
* **POST `/auth/refresh`** — lê refreshToken do cookie, emite novo par de tokens
* **POST `/auth/logout`** — invalida refreshToken no banco e limpa o cookie

### 9.2 Empresas (`src/modules/company/company.controller.ts`)
* **GET `/companies`** — `companyService.getAll()`
* **GET `/companies/:id`** — `companyService.getById(id)`
* **GET `/companies/cnpj/:cnpj`** — `companyService.getByCnpj(cnpj)`
* **POST `/companies`** — `companyService.create(dto)`
* **PUT `/companies/:id`** — `companyService.update(id, dto)`
* **DELETE `/companies/:id`** — `companyService.delete(id)`
* **PATCH `/companies/:id/activate`** — `companyService.activate(id)`
* **PATCH `/companies/:id/deactivate`** — `companyService.deactivate(id)`

### 9.3 Responsável pela Empresa (`src/modules/company/modules/company-responsible/`)
* **GET `/company-responsibles`** — `companyResponsibleService.getAll()`
* **GET `/company-responsibles/id/:id`** — `companyResponsibleService.getById(id)`
* **GET `/company-responsibles/doc/:doc`** — busca por CPF/CNPJ
* **POST `/company-responsibles`** — `companyResponsibleService.create(dto)`
* **PUT `/company-responsibles/:id`** — `companyResponsibleService.update(id, dto)`
* **DELETE `/company-responsibles/:id`** — `companyResponsibleService.delete(id)`

### 9.4 Categorias de Negócio (`src/modules/company/modules/business-category/`)
* **GET `/business-categories`** — `businessCategoryService.getAll()`
* **GET `/business-categories/:id`** — `businessCategoryService.getById(id)`
* **POST `/business-categories`** — `businessCategoryService.create(dto)`
* **PUT `/business-categories/:id`** — `businessCategoryService.update(id, dto)`
* **DELETE `/business-categories/:id`** — `businessCategoryService.delete(id)`

### 9.5 Categorias por Empresa (`src/modules/company/modules/company-business-category/`)
* **GET `/companies/:companyId/business-categories`** — lista categorias da empresa
* **POST `/companies/:companyId/business-categories`** — vincula categoria à empresa
* **DELETE `/companies/:companyId/business-categories/:businessCategoryId`** — remove vínculo
* **PATCH `/companies/:companyId/business-categories/:businessCategoryId/activate`** — ativa vínculo
* **PATCH `/companies/:companyId/business-categories/:businessCategoryId/deactivate`** — desativa vínculo

### 9.6 Usuários (`src/modules/user/user.controller.ts`)
* **POST `/users`** — `userService.create(dto)`
* **GET `/users`** — `userService.getAll()`
* **GET `/users/:id`** — `userService.getById(id)`
* **GET `/users/company/:companyId`** — `userService.getByCompanyId(companyId)`
* **PATCH `/users/:id`** — `userService.update(id, dto)`
* **DELETE `/users/:id`** — `userService.delete(id)`

### 9.7 Vínculo Usuário-Tenant (`src/modules/user/modules/user-tenant/`)
* **POST `/user-tenants`** — `userTenantService.create(dto)`
* **GET `/user-tenants/user/:userId`** — `userTenantService.getByUserId(userId)`
* **GET `/user-tenants/tenant/:tenantId`** — `userTenantService.getByTenantId(tenantId)`
* **DELETE `/user-tenants/:userId/:tenantId`** — `userTenantService.delete(userId, tenantId)`

### 9.8 Planos (`src/modules/plan/plan.controller.ts`)
* **POST `/plans`** — `planService.create(dto)`
* **GET `/plans`** — `planService.getAll()`
* **GET `/plans/:id`** — `planService.getById(id)`
* **PATCH `/plans/:id`** — `planService.update(id, dto)`
* **DELETE `/plans/:id`** — `planService.delete(id)`

### 9.9 Tipo de Plano (`src/modules/plan/modules/plan-type/`)
* **GET `/plan-types`** — `planTypeService.getAll()`
* **GET `/plan-types/:id`** — `planTypeService.getById(id)`
* **POST `/plan-types`** — `planTypeService.create(dto)`
* **PUT `/plan-types/:id`** — `planTypeService.update(id, dto)`
* **DELETE `/plan-types/:id`** — `planTypeService.delete(id)`

### 9.10 Global Roles (`src/modules/role/modules/global-role/`)
* **GET `/global-roles`** — `globalRoleService.getAll()`
* **GET `/global-roles/:id`** — `globalRoleService.getById(id)`
* **POST `/global-roles`** — `globalRoleService.create(dto)`
* **PUT `/global-roles/:id`** — `globalRoleService.update(id, dto)`
* **DELETE `/global-roles/:id`** — `globalRoleService.delete(id)`

### 9.11 Tenant Roles (`src/modules/role/modules/tenant-role/`)
* **GET `/tenant-roles`** — `tenantRoleService.getAll()`
* **GET `/tenant-roles/:id`** — `tenantRoleService.getById(id)`
* **POST `/tenant-roles`** — `tenantRoleService.create(dto)`
* **PUT `/tenant-roles/:id`** — `tenantRoleService.update(id, dto)`
* **DELETE `/tenant-roles/:id`** — `tenantRoleService.delete(id)`

### 9.12 Status do Tenant (`src/modules/tenant/modules/tenant-status/`)
* **GET `/tenant-statuses`** — `tenantStatusService.getAll()`
* **GET `/tenant-statuses/:id`** — `tenantStatusService.getById(id)`
* **POST `/tenant-statuses`** — `tenantStatusService.create(dto)`
* **PUT `/tenant-statuses/:id`** — `tenantStatusService.update(id, dto)`
* **DELETE `/tenant-statuses/:id`** — `tenantStatusService.delete(id)`

### 9.13 Status de Assinatura (`src/modules/subscription/modules/subscription-status/`)
* **GET `/subscription-statuses`** — `subscriptionStatusService.getAll()`
* **GET `/subscription-statuses/:id`** — `subscriptionStatusService.getById(id)`
* **POST `/subscription-statuses`** — `subscriptionStatusService.create(dto)`
* **PUT `/subscription-statuses/:id`** — `subscriptionStatusService.update(id, dto)`
* **DELETE `/subscription-statuses/:id`** — `subscriptionStatusService.delete(id)`

### 9.14 Status de Fatura (`src/modules/invoice/modules/invoice-status/`)
* **GET `/invoice-statuses`** — `invoiceStatusService.getAll()`
* **GET `/invoice-statuses/:id`** — `invoiceStatusService.getById(id)`
* **POST `/invoice-statuses`** — `invoiceStatusService.create(dto)`
* **PUT `/invoice-statuses/:id`** — `invoiceStatusService.update(id, dto)`
* **DELETE `/invoice-statuses/:id`** — `invoiceStatusService.delete(id)`

### 9.15 Tipo de Notificação (`src/modules/notification/modules/notification-type/`)
* **GET `/notification-types`** — `notificationTypeService.getAll()`
* **GET `/notification-types/:id`** — `notificationTypeService.getById(id)`
* **POST `/notification-types`** — `notificationTypeService.create(dto)`
* **PUT `/notification-types/:id`** — `notificationTypeService.update(id, dto)`
* **DELETE `/notification-types/:id`** — `notificationTypeService.delete(id)`

### 9.16 Sessões (`src/modules/session/session.controller.ts`)
* **POST `/sessions`** — `sessionService.create(dto)`
* **GET `/sessions/list-by-user-id/:userId`** — `sessionService.getListByUserId(userId)`
* **GET `/sessions/:id`** — `sessionService.getById(id)`
* **PATCH `/sessions/:id`** — `sessionService.update(id, dto)`
* **DELETE `/sessions/:id`** — `sessionService.delete(id)`

### 9.17 Health Check (`src/modules/health/health.controller.ts`)
* **GET `/health`** — verifica saúde da API e conexão com o banco de dados

### 9.18 Mocks (`src/mocks/`)
* **GET `/mock/cnpjs`** — gera um CNPJ aleatório válido
* **GET `/mock/cnpjs/:quantity`** — gera N CNPJs aleatórios válidos
* **GET `/mock/users`** — gera dados de um usuário aleatório
* **GET `/mock/users/:quantity`** — gera dados de N usuários aleatórios

---

## 10. 🏛️ Padrões Arquiteturais

### 1. **Repository Pattern**

Camada de abstração entre Service e Prisma via `BaseRepository<T>`. Tratamento de null e erros centralizado no repository.

```typescript
// ✅ Repository — herda BaseRepository, delega erros ao ErrorService
async getById(id: string): Promise<GlobalRole> {
  return this.getByField('id', id)
}

// ✅ Service — delegação pura
async getById(id: string): Promise<GlobalRole> {
  return this.globalRoleRepository.getById(id)
}

// ✅ Controller — delegação HTTP
async getById(@Param('id') id: string): Promise<GlobalRole> {
  return this.globalRoleService.getById(id)
}
```

### 2. **ErrorService — Centralização de Erros**

Mapeia códigos de erro Prisma para exceções NestJS. Erros `HttpException` são relançados diretamente sem transformação.

```typescript
// Códigos Prisma suportados:
// P2025 — NotFoundException (record not found)
// P2002 — ConflictException (unique constraint violation)
// P2003 — BadRequestException (foreign key constraint violation)
// P2014 — BadRequestException (relation violation)
```

O `BaseRepository` já encapsula o try/catch via `executeFnWithTryCatch`. Não é necessário try/catch manual nos métodos do repository.

### 3. **Tipos gerados pelo Prisma**

Tipos derivados diretamente do `prisma/schema.prisma` via `prisma generate`. O client é sempre sincronizado com o schema declarativo.

```typescript
import { GlobalRole } from '@prisma/client'

const role: GlobalRole = await this.prisma.globalRole.findUniqueOrThrow({
  where: { id },
})
```

### 4. **Remoção de campos sensíveis via destructuring**

Campos sensíveis são removidos via destructuring, não via ORM omit.

```typescript
// ✅ Omitir FK e expor relação
const { typeId: _, ...rest } = entity
return { ...rest, type: { name: type.name } }
```

### 5. **ConfigModule Global**

Todas as variáveis de ambiente via `ConfigService`. A variável de conexão com o banco é `DB_URL`.

```typescript
// ✅ Injeta automaticamente
constructor(private configService: ConfigService) {}

const url = this.configService.get<string>('DB_URL')
const port = this.configService.get<number>('PORT', 3000)  // com default
```

### 6. **ValidationPipe Global**

Valida e transforma payloads automaticamente via DTOs com class-validator.

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
@Throttle({ default: { ttl: 3600000, limit: 5 } })
@Post('login')
async login(...) { ... }
```

### 8. **Middleware e Interceptors para Tenant**

A cada requisição, resolve o `tenantId` (via Header `X-Tenant-ID`, subdomínio ou JWT) e injeta no contexto da requisição para uso nos repositórios.

```typescript
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const tenantId = request.headers['x-tenant-id'] ?? request.user?.tenantId
    request.tenantId = tenantId
    return next.handle()
  }
}
```

### 10. **BaseRepository**

Classe abstrata genérica em `src/shared/repositories/base/base.repository.ts`. Todo repository herda dela passando o delegate Prisma correspondente.

```typescript
export class PlanRepository extends BaseRepository<Prisma.PlanDelegate> {
  constructor(
    prisma: PrismaService,
    errorService: ErrorService,
    paginationService: PaginationService,
  ) {
    super(errorService, prisma.plan, paginationService)
  }
}
```

**Métodos disponíveis:**

| Método | Descrição |
|---|---|
| `findMany(params?)` | Lista sem paginação. Adiciona `deletedAt: null` automaticamente |
| `findMany(params com page+size)` | Lista paginada — retorna `PaginatedResponse<R>` |
| `getByField(field, value)` | Busca por campo. Lança `NotFoundException` se não encontrar |
| `insert(query)` | Cria registro. Recebe a query completa do Prisma (`{ data, include, ... }`) |
| `updateItem(id, data)` | Atualiza por ID |
| `softDelete(id)` | Soft delete. Valida existência internamente via ErrorService |
| `executeFnWithTryCatch(fn)` | Wrapper de try/catch com ErrorService |

**Interface:** `src/shared/interfaces/base-repository.interface.ts` — contrato que o `BaseRepository` implementa. Garante que uma troca de ORM não impacta as camadas acima.

### 11. **Path Aliases**

Imports sem relativos confusos. Aliases configurados no `tsconfig.json`:

```typescript
// ✅
import { AuthService } from '@auth/auth.service'
import { GlobalRoleService } from '@role/modules/global-role/global-role.service'
import { ErrorService } from '@shared/services/error/error.service'
import { UserTenantService } from '@user-tenant/user-tenant.service'

// ❌ Evitar
import { AuthService } from '../../../../modules/auth/auth.service'
```

Aliases disponíveis: `@auth`, `@company`, `@company-responsible`, `@business-category`, `@credential`, `@health`, `@invoice-status`, `@mocks`, `@notification-type`, `@plan`, `@plan-type`, `@role`, `@session`, `@shared`, `@subscription-status`, `@tenant-status`, `@user`, `@user-tenant`.

---

## 11. ✍️ Convenções de Escrita

### Complexidade Ciclomática Máxima 5

Nenhum método em services, repositories ou controllers pode ter complexidade ciclomática acima de 5. Se passar, extrai método privado.

### Retorno Explícito

Todo método declara seu tipo de retorno explicitamente — sem inferência implícita.

```typescript
// ✅
async getAll(): Promise<Plan[]> {
  return this.findMany()
}

// ❌
async getAll() {
  return this.findMany()
}
```

### Sem `any` / `unknown`

Tipos reais em todo lugar. Mocks parciais em specs usam `Partial<T>` ou `Pick<T, ...>`, nunca `as any`.

### Types em Arquivos Próprios

Nunca declarar types inline em arquivos de classe. Cada type fica em seu próprio arquivo dentro de `types/`, um por arquivo.

### Ordem de Imports

```typescript
// 1. NestJS
import { Controller, Get } from '@nestjs/common'

// 2. Libs terceiras
import { GlobalRole } from '@prisma/client'

// 3. Módulos do projeto / aliases
import { PlanService } from '@plan/plan.service'

// 4. Arquivos da mesma pasta
import { CreatePlanDto } from './dtos/create-plan.dto'
```

### Funções Pequenas & Responsabilidade Única

Cada função faz **uma coisa só**. Se ficou grande, extrai método privado.

### Early Return — Sem Else

Falha rápido, retorna cedo. Evita nesting profundo.

```typescript
// ✅
if (!dto.email || !dto.password)
  throw new UnauthorizedException('Invalid credentials')

await this.passwordService.compare(dto.password, credential.password)

// ❌
if (dto.email && dto.password) {
  await this.passwordService.compare(...)
} else {
  throw new UnauthorizedException(...)
}
```

### Nomes Descritivos & Sufixos de Contexto

- Variáveis: `credentialRepository`, `hashedRefreshToken`, `userTokenData`
- Sem abreviações: `usr`, `pwd`, `repo` → evitar
- Sufixos que indicam contexto: `...Repository`, `...DTO`, `...Type`, `...Guard`, `...Strategy`

### Separação de Dados Sensíveis

Nunca retornar campos sensíveis para o cliente. Remoção feita via destructuring.

```typescript
// ✅ Omitir FK e expor relação no lugar
const { statusId: _, ...rest } = entity
return { ...rest, status: { name: status.name } }
```

### Try/Catch Apenas no Repository

Service e Controller não tratam erros Prisma diretamente — delegam. Com `BaseRepository`, o try/catch é herdado via `executeFnWithTryCatch`; não é escrito manualmente.

```typescript
// ✅ Repository — BaseRepository já encapsula o try/catch
async create(data: CreatePlanDto): Promise<Plan> {
  const exists = await this.model.findFirst({ where: { slug: data.slug } })
  if (exists) throw new ConflictException('Slug already exists')
  return this.insert<Plan>({ data })
}

// ✅ Service — propaga naturalmente
async create(dto: CreatePlanDto): Promise<Plan> {
  return this.planRepository.create(dto)
}
```

---

## 12. 🧪 Padrões de Teste

### Estrutura: AAA (Arrange, Act, Assert)

Todo teste segue: monta dados → executa → verifica.

### Cobertura Obrigatória por Camada

**Controller** — testa delegação, não lógica

- Happy path: retorna o que o service retornou
- Error path: propaga erro do service

**Service** — testa lógica de negócio

- Happy path completo
- Cada validação que pode falhar
- Que os métodos corretos foram chamados

**Repository** — testa queries Prisma

- Happy path: query chamada com parâmetros exatos
- Erros Prisma → `ErrorService` chamado corretamente

**DTO** — testa validações class-validator

### Mocks

- Mocks em specs **sempre** usam types existentes do projeto — nunca objetos literais sem tipo declarado
- Mocks parciais em specs: `Partial<T>` ou `Pick<T, 'prop'>` conforme necessário
- Mocks parciais no source (ex: injeção de dependência): `Pick<T, 'method'>`
- Jamais usar `any` ou objetos anônimos para simular entidades

---

## 13. 🔄 Fluxos Principais

### Fluxo 1: Login

```
POST /auth/login
  ├─ Validação DTO (LoginRequestDto)
  ├─ AuthService.login(dto, ipAddress, userAgent)
  │   ├─ credentialsService.getByEmail(dto.email)
  │   ├─ passwordService.compare(dto.password, credential.password)
  │   ├─ userService.getById(credential.userId)
  │   ├─ tokenService.generateTokens({ sub: user.id, role: user.globalRole })
  │   │   ├─ accessToken (15min, JWT_SECRET)
  │   │   └─ refreshToken (7d, JWT_REFRESH_SECRET)
  │   └─ sessionService.create({ userId, refreshToken, ipAddress, userAgent, expiresAt })
  ├─ Cookie HttpOnly: refreshToken (7d, secure, sameSite: strict)
  └─ Response 200: { user, accessToken }
```

### Fluxo 2: Renovação de Token (Refresh)

```
POST /auth/refresh
  ├─ Lê refreshToken do cookie HttpOnly
  ├─ AuthService.refresh(token, ipAddress, userAgent)
  │   ├─ tokenService.verifyRefreshToken(token) → valida assinatura JWT
  │   ├─ sessionService.getByRefreshToken(token) → confirma sessão ativa
  │   ├─ tokenService.generateTokens({ sub, role }) → novo par de tokens
  │   └─ sessionService.update(session.id, { refreshToken, expiresAt }) → rotaciona token
  ├─ Cookie HttpOnly: novo refreshToken
  └─ Response 200: { accessToken }
```

### Fluxo 3: Registro de Conta

```
POST /auth/register
  ├─ Validação DTO (RegisterRequestDto)
  ├─ AuthService.register(dto)
  │   ├─ userService.create({ name, globalRoleId })
  │   └─ credentialService.create({ userId, email, password })
  └─ Response 201: { user }
```

### Fluxo 4: Atualizar Usuário

```
PATCH /users/:id (+ JwtAuthGuard + RolesGuard)
  ├─ UserService.update(id, updateUserDto)
  └─ Response 200: { user atualizado }
```

---

## 14. 🔧 Trade-offs & Decisões Arquiteturais

| Decisão                | Escolha                     | Motivo                                                    | Alternativa                                                    |
| ---------------------- | --------------------------- | --------------------------------------------------------- | -------------------------------------------------------------- |
| **Arquitetura**        | Monolito                    | MVP — velocidade > escalabilidade prematura               | Microsserviços (overkill para MVP)                             |
| **Multi-tenant**       | Row-level isolation         | Schema `public` único com `tenantId` em todas as entidades operacionais — isolamento garantido na camada de repositório | Schema-per-tenant (mais complexo), Database-per-tenant (mais caro) |
| **ORM**                | Prisma                      | Type-safety, migrations controladas, adapter nativo pg    | Sequelize (menos tipado), TypeORM (mais complexo)              |
| **Auth**               | JWT stateless               | Sem sessão server-side — escala horizontal fácil          | Session-based (precisa de shared cache)                        |
| **Refresh token**      | Hasheado no banco           | Segurança — token plain nunca persiste                    | JWT de longa duração (risco de vazamento)                      |
| **Error handling**     | Service centralizado        | Evita try/catch espalhado, mensagens consistentes         | Erros inline (código repetido)                                 |
| **Types por contexto** | Prisma.GetPayload           | Tipo seguro automaticamente, sempre sincronizado          | Type manual (pode ficar desatualizado)                         |
| **Null handling**      | No repository               | Centralizado, sem duplicação de validação                 | No service (repetitivo)                                        |
| **Validação**          | class-validator (decorator) | Declarativa, reutilizável, automática no pipe             | Validação manual (repetitivo)                                  |
| **Credentials**        | Módulo separado             | Responsabilidade isolada, reutilizável pelo auth          | Misturado com auth (difícil de testar)                         |
| **Repository**         | Sempre trata null/erros     | Evita if checks nos services                              | Deixar para o service (código repetido)                        |

---

## 15. 📊 Status dos Módulos

| Módulo                        | Status           | Endpoints | Progresso |
| ----------------------------- | ---------------- | --------- | --------- |
| **auth**                      | ✅ Concluído     | 5         | 100%      |
| **user**                      | ✅ Concluído     | 6         | 100%      |
| **credential**                | ✅ Concluído     | service   | 100%      |
| **session**                   | ✅ Concluído     | 5         | 100%      |
| **global-role**               | ✅ Concluído     | 5         | 100%      |
| **tenant-role**               | ✅ Concluído     | 5         | 100%      |
| **user-tenant**               | ✅ Concluído     | 4         | 100%      |
| **company**                   | ✅ Concluído     | 8         | 100%      |
| **company-responsible**       | ✅ Concluído     | 6         | 100%      |
| **business-category**         | ✅ Concluído     | 5         | 100%      |
| **company-business-category** | ✅ Concluído     | 5         | 100%      |
| **plan**                      | ✅ Concluído     | 5         | 100%      |
| **plan-type**                 | ✅ Concluído     | 5         | 100%      |
| **subscription-status**       | ✅ Concluído     | 5         | 100%      |
| **invoice-status**            | ✅ Concluído     | 5         | 100%      |
| **tenant-status**             | ✅ Concluído     | 5         | 100%      |
| **notification-type**         | ✅ Concluído     | 5         | 100%      |
| **health**                    | ✅ Concluído     | 1         | 100%      |
| **mocks**                     | ✅ Concluído     | —         | 100%      |
| **shared/prisma**             | ✅ Concluído     | —         | 100%      |
| **shared/guards**             | ✅ Concluído     | —         | 100%      |
| **shared/strategies**         | ✅ Concluído     | —         | 100%      |
| **tenant**                    | ⏳ Futuro        | —         | 0%        |
| **tenant-type**               | ⏳ Futuro        | —         | 0%        |
| **tenant-settings**           | ⏳ Futuro        | —         | 0%        |
| **opening-hours**             | ⏳ Futuro        | —         | 0%        |
| **invite**                    | ⏳ Futuro        | —         | 0%        |
| **product-category**          | ⏳ Futuro        | —         | 0%        |
| **product**                   | ⏳ Futuro        | —         | 0%        |
| **product-modifier**          | ⏳ Futuro        | —         | 0%        |
| **order**                     | ⏳ Futuro        | —         | 0%        |
| **order-status**              | ⏳ Futuro        | —         | 0%        |
| **customer**                  | ⏳ Futuro        | —         | 0%        |
| **subscription**              | ⏳ Futuro        | —         | 0%        |
| **payment**                   | ⏳ Futuro        | —         | 0%        |
| **payment-method**            | ⏳ Futuro        | —         | 0%        |
| **notification**              | ⏳ Futuro        | —         | 0%        |

---

## 16. 🚀 Próximas Features (Roadmap)

### Curto Prazo (1-2 semanas)

- [x] Swagger documentation (`@nestjs/swagger`) — disponível em `/api/docs`
- [ ] Implementar `POST /auth/forgot-password` + `POST /auth/reset-password`
  - Depende integração com Resend (email transacional)
  - Token de reset com TTL curto (30 min)
- [ ] Testes completos para todos os módulos

### Médio Prazo (3-4 semanas)

- [ ] Módulo de Tenant
  - CRUD: create, read, update, delete restaurante
  - Row-level isolation via `tenantId` no PostgreSQL
  - Middleware de identificação do tenant
- [ ] Rate limiting refinado com Redis (ao invés de em-memory)
- [ ] BullMQ + filas assíncronas
  - Emails via Resend
  - WhatsApp via Z-API
  - Push notifications via FCM

### Longo Prazo (MVP completo)

- [ ] Módulo Tenant completo: cardápio, produtos, categorias, modificadores
- [ ] Módulo Order: criar, rastrear, histórico de pedidos
- [ ] Integração Pagar.me: split payments, webhooks
- [ ] Módulo Delivery: entregadores, rastreamento real-time (SSE)
- [ ] Notifications: Resend, Z-API, FCM, SSE
- [ ] Analytics: PostHog integration

---

## 17. 🛠️ Variáveis de Ambiente

```env
# Docker
CONTAINER_NAME=container_name

# Banco de Dados (variáveis individuais usadas no docker-compose)
DB_USER=username_db
DB_PASSWORD=password_db
DB_NAME=database_name
DB_HOST=127.0.0.1
DB_PORT=5432

# Prisma (connection string montada a partir das vars acima)
DB_URL=postgresql://DB_USER:DB_PASSWORD@DB_HOST:DB_PORT/DB_NAME?schema=public

# JWT Secrets
JWT_SECRET=seu-secret-super-seguro-access-token
JWT_REFRESH_SECRET=seu-secret-super-seguro-refresh-token

# Servidor
PORT=3000
NODE_ENV=development

# Resend (email) — Planejado
RESEND_API_KEY=re_xxxxx

# Z-API (WhatsApp) — Planejado
Z_API_TOKEN=xxxxx

# Pagar.me — Planejado
PAGARME_API_KEY=xxxxx

# Firebase (push notifications) — Planejado
FIREBASE_CREDENTIALS_JSON={ ... }

# Cloudflare R2 (storage) — Planejado
R2_USER_ID=xxxxx
R2_ACCESS_KEY_ID=xxxxx
R2_SECRET_ACCESS_KEY=xxxxx
R2_BUCKET_NAME=nino-files
```

**Arquivo `.env.example`:** Sempre atualizado com as variáveis necessárias.

---

## 18. 🐳 Docker & Local Development

### Docker Compose (PostgreSQL + Redis)

```bash
npm run docker:up-d         # Inicia BD em background
npm run docker:up           # Inicia BD com logs
npm run docker:down-d       # Para BD em background
npm run docker:down         # Para BD
```

### Prisma Migrations

```bash
npm run prisma:generate     # Gera Prisma client
npm run prisma:migrate      # Cria migration
npm run prisma:seed         # Popula dados iniciais (roles, plans, statuses)
npm run prisma:sync         # Sync schema sem migration (dev only)
npm run prisma:reset        # Reset completo do banco (apaga tudo)
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

## 19. 📚 Referências & Documentação

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

## 20. 🤝 Contribuição & Commits

### Padrão de Branches

- `main` → Produção
- `develop` → Staging
- `feature/nome-feature` → Feature branches

### Padrão de Commits

```
feat(auth): implementar login com JWT
fix(user): corrigir validação de role
test(credentials): adicionar testes para updatePassword
refactor(repository): extrair queries em helpers
```

### Pull Request Checklist

- [ ] Testes passando (`npm test`)
- [ ] Cobertura mantida/melhorada
- [ ] Linting sem erros (`npm run lint`)
- [ ] Mensagens de commit descritivas

---

## 21. 📞 Suporte & Dúvidas

Dúvidas sobre código? Consulte:

1. Este Readme.md
2. Tests (`.spec.ts` files)
3. Comments inline no código
4. Issue no repositório

---

**Última atualização:** Maio 2026  
**Desenvolvedor:** Paulo (Solo)  
**Status:** MVP em desenvolvimento — ~55% concluído

**85 endpoints implementados em 17 módulos funcionais e modulares!** 🎉
