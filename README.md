# Ninomia Delivery — nino-api
## 1. 📋 Visão Geral e Modelo de Negócio (Business Core)

### 1.1 Identidade e Conceito do Produto
O **Nino** (anteriormente referido como Ninomia) é uma plataforma de Software as a Service (SaaS) voltada para o mercado de alimentação (restaurantes, lanchonetes, padarias e similares). O sistema opera sob o modelo **White-Label B2B**, o que define as seguintes premissas obrigatórias:
- **Invisibilidade da Marca:** O cliente final (o consumidor que pede a comida) nunca interage com a marca "Nino". Toda a interface, comunicação e domínio são personalizados com a identidade visual do restaurante contratante.
- **Isolamento de Marca:** Cada `Company` (Empresa) possui sua própria configuração de identidade, permitindo que o sistema se comporte como um aplicativo proprietário para cada cliente.
- **Origem e Propósito:** O nome é uma homenagem afetiva aos pets da família fundadora (Nino e Mia), trazendo uma identidade de proximidade e cuidado para um produto tecnológico de alta performance.
---

### 1.2 Modelo de Monetização e Estratégia Comercial
O Nino rompe com o padrão de mercado de marketplaces de delivery (como iFood ou Rappi) ao abandonar a cobrança de comissões por transação.
- **Zero Comissão:** O restaurante retém 100% do valor das vendas realizadas através da plataforma. Não existem taxas ocultas sobre o faturamento.
- **Assinatura Fixa:** A receita da plataforma é gerada exclusivamente através de mensalidades fixas, permitindo previsibilidade de custos para o dono do restaurante e escalabilidade para a plataforma.
- **Foco Regional:** A estratégia inicial de penetração de mercado é focada no **Norte do Brasil (Estado do Pará)**, visando atender as particularidades logísticas e de consumo da região antes da expansão nacional.
---

### 1.3 Detalhamento Exaustivo dos Planos e Limites (Hard Logic)
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

### 2.1 Estratégia Multi-Tenant Absoluta (Schema-per-Tenant)
O coração arquitetural do Nino. Abandonamos o uso de IDs compartilhados (`tenantId` em tabelas únicas) para dados sensíveis em favor de schemas independentes no PostgreSQL. Se o código falhar, o banco de dados fisicamente impede que um restaurante veja a venda de outro.

#### 2.1.1 A Divisão de Schemas
O ecossistema divide as tabelas em dois universos:
- **Schema Central (`public`):** O cérebro do SaaS. Gerencia quem são os clientes e os acessos.
  - *Entidades Residentes:* `Company` (O cliente pagante), `CompanyResponsible` (O dono), `Plan` (Catálogo de preços), `User` (Operadores globais ou locais), `AuthCredential` (Segurança), `Session` (Controle de dispositivos), `Role` (Permissões) e domínios estáticos (Status, Notificações).
- **Schemas Dinâmicos (`tenant_<slug>` ou `tenant_<id>`):** O motor operacional de cada restaurante. Estes schemas são criados programaticamente durante o Onboarding de uma nova `Company`.
  - *Entidades Residentes:* `Tenant` (A vitrine whitelabel da unidade), `Product`, `Category`, `Order`, `Customer` (O consumidor final que pede a comida).

#### 2.1.2 O Motor de Roteamento Dinâmico (Tenant Injection)
Para que a API saiba de onde ler ou gravar dados sem precisar de dezoito bancos de dados rodando, usamos injeção de contexto em tempo de execução:
1. Toda requisição para rotas operacionais (ex: criar produto, listar pedidos) exige a identificação do Tenant alvo (via Header `X-Tenant-ID` no app do restaurante, ou subdomínio na visão do cliente final).
2. Um `Middleware` ou `Interceptor` do NestJS captura esse identificador e valida sua existência no schema `public`.
3. O sistema injeta o comando `SET search_path TO tenant_<id>` diretamente na transação do **TypeORM** antes da execução da regra de negócio, forçando o PostgreSQL a rotear a query para a gaveta certa.
---

### 2.2 Padrão de Camadas Estrito (Strict 3-Tier Layering)
A separação de responsabilidades é inegociável. Nenhuma regra de negócio deve conhecer o ORM, e nenhum roteamento deve calcular dados.

#### 2.2.1 **Controller Layer (`*.controller.ts`)**: 
- **Única função:** Roteamento HTTP, extração de Headers/Cookies, aplicação de Guards (Segurança) e sanitização de entrada via DTOs.
- **Regra:** Proibido o uso de IF/ELSE para lógicas de negócio. Só delega para o Service e devolve a resposta.
#### 2.2.2 **Service Layer (`*.service.ts`)**: 
- **Única função:** O coração da aplicação. Executa cálculos, regras financeiras, orquestra fluxos complexos (ex: Onboarding cria 4 entidades diferentes).
- **Regra:** Nunca importa decoradores do TypeORM. Depende exclusivamente dos Repositories, o que permite criar Mocks perfeitos para os testes unitários.
#### 2.2.3   **Repository Layer (`*.repository.ts`)**: 
- **Única função:** A ponte de infraestrutura com o banco de dados. 
- É o único lugar do código autorizado a usar `@InjectRepository()` e construir `QueryBuilders`.
- **Tratamento de Erros:** Captura códigos de erro nativos do Postgres (ex: violação de Unique Key `23505`) e traduz para exceções HTTP do NestJS (ex: `ConflictException`), blindando o Service.
---

### 2.3 Estrutura de Diretórios e Modularização
O projeto utiliza **Feature Modules** (Modularização por Domínio), facilitando a manutenção e a injeção de dependências.

- **`/src`**: Raiz da aplicação.
    - **`/auth`, `/company`, `/user`**: Módulos do nível B2B (operam no schema `public`).
    - **`/shared`**: O núcleo de utilidades globais.
        - **`/shared/database`**: Configurações do TypeORM, instâncias de `DataSource` e serviços de erro genéricos.
        - **`/shared/middlewares`**: A lógica de captura e injeção do contexto do Tenant.
        - Guardiões, Validadores de CNPJ/CPF e Serviços de Criptografia de Senha.
- **`/migrations`**: Arquivos TypeScript auto-gerados ou manuais contendo o DDL (Data Definition Language) do banco.

### 2.4 Defesas na Borda (Edge Configuration)
Configurações fixadas no `AppModule` e `main.ts` que afetam globalmente o tráfego:
- **Filtros de Exceção Globais (`ExceptionFilter`):** Impedem que erros brutos de SQL vazem no JSON de resposta.
- **Pipes de Validação Rigorosos:** Remoção passiva de campos extras (whitelist) e bloqueio ativo (forbidNonWhitelisted).

## 3. 🧰 Stack Tecnológica Oficial
Para suportar a arquitetura acima, especialmente o requisito crítico de Schema-per-Tenant e injeção dinâmica em tempo real, a stack do Nino foi definida com as seguintes tecnologias e dependências:

### 3.1 Motor e Linguagem
- **Linguagem:** TypeScript v5.7 (Tipagem estrita obrigatória, evitando `any` a todo custo).
- **Runtime:** Node.js (Versão LTS atual).
- **Framework Core:** NestJS v11 (`@nestjs/core: ^11.0.1`).
  - *Motivo:* Fornece um ecossistema maduro com Inversão de Controle (IoC) via injeção de dependência nativa, forçando uma arquitetura limpa desde o dia 1.

### 3.2 Persistência de Dados e ORM
- **Banco de Dados:** PostgreSQL v16 (Ambiente de desenvolvimento provisionado via Docker & Docker Compose).
- **ORM Principal:** TypeORM (`typeorm`, `@nestjs/typeorm`).
  - *Motivo da migração (Antigo Prisma):* O TypeORM suporta nativamente a manipulação dinâmica de schemas no Postgres e execução de lógicas customizadas por requisição (via QueryRunners e EntityManagers). O Prisma ORM é engessado e não suporta DDL dinâmico em tempo de execução sem severas gambiarras arquiteturais.
- **Driver Nativo:** `pg` (Cliente PostgreSQL puramente escrito em JS).

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
- **Testes E2E:** Supertest (`supertest: ^7.0.0`) para validar fluxos HTTP completos, desde a rota HTTP, passando pelas injeções de TypeORM até o banco de testes.
- **Padronização:** ESLint estrito e Prettier.

### 3.5 Tabela de Componentes Core

| Camada / Responsabilidade | Tecnologia Base | Descrição e Função no Ecossistema Nino |
| :--- | :--- | :--- |
| **Engine / Core** | NestJS v11 + TypeScript | Framework principal operando como um monolito modular RESTful. Fornece a base de injeção de dependências (IoC), roteamento e arquitetura em camadas. |
| **Persistência Relacional** | PostgreSQL v16 | Banco de dados central. Adota o modelo de `Schema-per-Tenant` para isolamento físico de dados entre os restaurantes, garantindo segurança extrema. |
| **Object-Relational Mapping** | TypeORM | ORM escolhido por sua flexibilidade na injeção dinâmica de *schemas* em tempo de execução via `search_path`, viabilizando a arquitetura Multi-Tenant sem gambiarras. |
| **Segurança e Autenticação** | Passport.js + JWT + bcrypt | O motor de acesso. `bcrypt` realiza o *hash* das senhas. O JWT (JSON Web Token) emite *Access Tokens* de vida curta, enquanto um sistema customizado com `Passport` valida os *Refresh Tokens* persistidos no banco. |
| **Sanitização na Borda** | class-validator + class-transformer | Barreira de entrada HTTP. Valida os DTOs (Data Transfer Objects) e rejeita propriedades não mapeadas (*forbidNonWhitelisted*), protegendo a API de injeções de *payload*. |
| **Proteção de Rede** | @nestjs/throttler | Sistema de *Rate Limiting* (limitador de requisições) configurado globalmente para evitar ataques de negação de serviço (DDoS) e força bruta em endpoints sensíveis (ex: login). |
| **Qualidade e Testes Unitários** | Jest v30 + ts-jest | Suíte de testes unitários com foco exclusivo nas regras de negócio (Services) e infraestrutura (Repositories). O *coverage* ignora ficheiros anémicos (DTOs, Enums). |
| **Testes E2E (Integração)** | Supertest | Validação dos fluxos completos da API de ponta a ponta, simulando requisições HTTP reais contra um banco de dados de teste (via Docker). |
| **Gestão de Ambiente / Local** | Docker + Docker Compose | Infraestrutura como código para o ambiente de desenvolvimento. Sobe a instância do PostgreSQL localmente sem poluir o sistema operativo do programador. |
| **Linting e Formatação** | ESLint + Prettier | Ferramentas estritas de análise estática e padronização visual do código TypeScript, garantindo consistência entre os ficheiros. |

### 3.6 Omissões Deliberadas (Out of Scope)
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

- **PostgreSQL** (v14+) — Banco relacional com suporte a Row Level Security (RLS)
- **Prisma ORM** (v7.4.1) — Query builder tipado; migrations automáticas
- **`@prisma/adapter-pg` + `pg`** — Driver adapter nativo para PostgreSQL; substitui o client padrão do Prisma para conexão direta sem camada intermediária

### Autenticação & Segurança

- **JWT (JSON Web Tokens)** — Stateless; access token 15min + refresh token 7 dias via cookie HttpOnly
- **Passport.js** (v0.7) — Estratégias de autenticação plugáveis
- **bcrypt** (v6) — Hashing de senhas e refresh tokens
- **@nestjs/jwt** + **@nestjs/passport** — Integração nativa NestJS
- **cookie-parser** — Parsing de cookies HTTP; essencial para leitura do refreshToken HttpOnly
- **Rate limiting** (@nestjs/throttler v6.5) — Proteção contra força bruta e abuse

### Documentação

- **@nestjs/swagger** + **swagger-ui-express** — Documentação interativa disponível em `/api/docs`

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
  "@nestjs/throttler": "^6.5.0",
  "@prisma/adapter-pg": "^7.4.1",
  "@prisma/client": "^7.4.1",
  "bcrypt": "^6.0.0",
  "class-transformer": "^0.5.1",
  "class-validator": "^0.15.1",
  "cookie-parser": "^1.4.7",
  "passport": "^0.7.0",
  "passport-jwt": "^4.0.1",
  "pg": "^8.18.0",
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
│   ├── app.module.ts                    # Root module orquestrador (Importa todos os Feature Modules)
│   ├── app.controller.ts                # Healthcheck e rotas base globais
│   ├── app.service.ts                   # Lógicas globais base
│   │
│   ├── auth/                            # 🔐 Módulo Central de Autenticação
│   │   ├── auth.module.ts               # Injeção de JwtModule, Passport e Token/Password Services
│   │   ├── auth.controller.ts           # POST /auth/register, /login, /refresh, /logout
│   │   ├── auth.service.ts              # Orquestração do fluxo de login e emissão de tokens
│   │   ├── auth.repository.ts           # Acesso focado nas transações de autenticação
│   │   ├── jwt-refresh.guard.ts         # Proteção específica para a rota de Refresh Token
│   │   ├── jwt-refresh.strategy.ts      # Estratégia Passport para decodificar o Refresh Token
│   │   ├── dtos/                        # Validadores: login-request, register-request, change-password
│   │   └── types/                       # Contratos: tokens.type, login-response.type
│   │
│   ├── company/                         # 🏢 Módulo Core B2B (Clientes do SaaS)
│   │   ├── company.module.ts
│   │   ├── company.controller.ts        # CRUD de Empresas e controle de ativação
│   │   ├── company.service.ts           # Regras de onboarding e verificação de conflitos (CNPJ)
│   │   ├── company.repository.ts        # Interação estrita com o schema `public` via TypeORM
│   │   ├── dto/                         # create-company.dto, update-company.dto
│   │   └── types/                       # company.type
│   │
│   ├── company-responsible/             # 👤 Dados do Dono da Empresa (Representante Legal)
│   │   ├── company-responsible.module.ts
│   │   ├── company-responsible.controller.ts
│   │   ├── company-responsible.service.ts
│   │   ├── company-responsible.repository.ts
│   │   ├── dto/                         # create e update DTOs (Validação de CPF/Telefone)
│   │   └── type/                        # company-responsible.type
│   │
│   ├── session/                         # 📱 Controle de Dispositivos e Rotação de Tokens
│   │   ├── session.module.ts
│   │   ├── session.controller.ts        # Revogação manual de sessões ativas
│   │   ├── session.service.ts           # Lógica de expiração (7 dias) e tracking de IP/User-Agent
│   │   ├── session.repository.ts        # Hard-delete e upsert de refresh tokens
│   │   ├── dtos/                        # create-session.dto, update-session.dto
│   │   └── types/                       # session.type
│   │
│   ├── user/                            # 👥 Operadores do Sistema (Admins e Funcionários)
│   │   ├── user.module.ts
│   │   ├── user.controller.ts           # CRUD de usuários e vinculação com Roles
│   │   ├── user.service.ts              # Validação de regras SetNull para companyId
│   │   ├── user.repository.ts           # Acesso aos dados do usuário (ignora senhas)
│   │   ├── dtos/                        # create-user, update-user, user.dto
│   │   └── types/                       # user.type, user-token.data.type
│   │
│   ├── credential/                      # 🔑 Segurança Isolada (Preparado para OAuth)
│   │   ├── credential.module.ts
│   │   ├── credential.controller.ts
│   │   ├── credential.service.ts
│   │   ├── credential.repository.ts     # Gerencia a tupla única [userId + provider]
│   │   ├── dto/                         # create-credential (hash bcrypt embutido), update
│   │   └── types/                       # credential.type, credential-repository.type
│   │
│   ├── plan/                            # 💳 Catálogo Comercial (Limites e Preços)
│   │   ├── plan.module.ts
│   │   ├── plan.controller.ts
│   │   ├── plan.service.ts              # Lógica de controle de limites (maxTenants, maxOrders)
│   │   ├── plan.repository.ts
│   │   ├── dtos/                        # create-plan, update-plan
│   │   └── types/                       # plan.type
│   │
│   ├── plan-type/                       # 🏷️ Categorização de Planos (Mensal, Anual)
│   │   ├── plan-type.module.ts
│   │   ├── plan-type.controller.ts
│   │   ├── plan-type.service.ts
│   │   ├── plan-type.repository.ts
│   │   ├── dtos/
│   │   └── types/
│   │
│   ├── role/                            # 🛡️ RBAC (Cargos e Permissões)
│   │   ├── role.module.ts
│   │   ├── role.controller.ts
│   │   ├── role.service.ts
│   │   ├── role.repository.ts
│   │   ├── dtos/
│   │   └── types/
│   │
│   ├── Módulos de Dicionário (Status e Tipos) # Tabelas estáticas auxiliares
│   │   ├── invoice-status/              # PENDING, PAID, VOID
│   │   ├── notification-type/           # SYSTEM, BILLING, ORDER
│   │   ├── subscription-status/         # TRIAL, ACTIVE, SUSPENDED
│   │   └── tenant-status/               # CONFIGURING, ACTIVE, MAINTENANCE
│   │
│   ├── mocks/                           # 🧪 Utilitários para Desenvolvimento e Testes
│   │   ├── mocks.module.ts
│   │   ├── cnpj/                        # Mock de geração e validação de CNPJ
│   │   ├── user/                        # Mock de injeção de usuários para E2E
│   │   └── data/                        # user.data.mock.ts
│   │
│   └── shared/                          # 🛠️ Core Transversal (Recursos Globais)
│       ├── database/                    # [TypeORM] Conexões, DataSources e Configurações base
│       ├── middlewares/                 # [TypeORM] Interceptor para injetar o `search_path` (Tenant)
│       ├── guards/                      # jwt-auth.guard.ts (Proteção global de rotas)
│       ├── strategies/                  # jwt-auth.strategy.ts (Validação de Access Token)
│       ├── validators/                  # cnpj.validator.ts (Custom class-validator decorators)
│       ├── enums/                       # role.enum, plan.enum, subscription-status.enum
│       ├── types/                       # auth-request.type.ts
│       └── services/
│           ├── password/                # password.service.ts (Wrapper isolado do bcrypt)
│           ├── token/                   # token.service.ts (Wrapper do JwtService)
│           └── helpers/cnpj/            # Lógica de formatação de CNPJ
│
├── migrations/                          # 📜 [Substitui prisma/] DDLs e TypeORM Migrations 
│   ├── 1710000000000-InitialPublic.ts   # Migrações globais do schema B2B
│   └── tenants/                         # Migrações dinâmicas para instanciar novos clientes
│
├── test/                                # 🚥 Suíte de Testes End-to-End
│   ├── app.e2e-spec.ts                  # Testes integrados batendo na API via Supertest
│   └── jest-e2e.json                    # Configuração para levantar banco em memória ou Docker
│
├── collections/                         🗂️ Documentação Viva de API (Insomnia/Postman)
│   ├── auth.collection.yaml             
│   ├── company.collection.yaml          
│   ├── user.collection.yaml             
│   ├── plan.collection.yaml
│   └── (e coleções para todos os outros domínios)
│
├── Infraestrutura e Configurações       ⚙️ Raiz do Projeto
│   ├── docker-compose.yml               Provisionamento do PostgreSQL v16
│   ├── .env / .env.example             Chaves JWT, Database URIs e Secrets
│   ├── package.json                    Scripts e dependências TypeORM/NestJS
│   ├── tsconfig.json / tsconfig.build.json
│   ├── eslint.config.mjs              Regras estritas de Linting
│   ├── .prettierrc                      Formatação visual de código
│   ├── nest-cli.json                    Configuração do compilador Nest
│   └── README.md / CONTEXT.md           A Bíblia do Projeto (Você está aqui)
```
---

## 6. 🗄️ Topologia do Banco de Dados e Entidades

Com a migração para TypeORM para suportar o isolamento físico Multi-Tenant, a modelagem de dados passa a ser definida por classes TypeScript (`Entities`). Abaixo está o detalhamento exaustivo de cada entidade do sistema, seu propósito de negócio e como elas se relacionam na arquitetura de schemas separados.

*(Nota: Colunas de infraestrutura padrão como `id`, `description`, `createdAt` e `updatedAt` são omitidas desta documentação por já estarem padronizadas em todas as entidades nas camadas base do código).*

### 6.1 Schema Global B2B (`public`)
Este schema centraliza o motor do SaaS. Ele gerencia assinaturas, empresas, segurança e o roteamento de lojas. Consumidores finais nunca interagem com os dados armazenados aqui.

#### 6.1.1 Entidades de Domínio e Status (Auxiliares de Negócio)
Estas tabelas definem as regras de estado e permissões do sistema.
- **`Role`**: Define a hierarquia de controle de acesso (RBAC). Controla se o usuário associado é um `ADMIN_NINO` (acesso global), `OWNER` (dono da empresa), `MANAGER` (gerente de loja), ou funções operacionais (`KITCHEN`, `WAITER`, `DELIVERY_MAN`).
- **`TenantStatus`**: Dita o estado operacional de uma unidade whitelabel. Regras de roteamento dependem disso (ex: bloquear pedidos se estiver `MAINTENANCE` ou `SUSPENDED`, permitir edição livre se `CONFIGURING`).
- **`SubscriptionStatus`**: O motor de billing consulta esta entidade para liberar ou bloquear o acesso ao dashboard. Define se a empresa está em `TRIAL`, `ACTIVE`, `PAST_DUE` (inadimplente com tolerância) ou `CANCELED`.
- **`InvoiceStatus`**: Rastreia o ciclo de vida de uma cobrança específica (`PENDING`, `PAID`, `VOID`). A mudança para `PAID` via webhook do gateway de pagamento é o que renova a assinatura.
- **`PlanType`**: Categoriza a periodicidade da cobrança comercial (ex: `MONTHLY`, `YEARLY`), influenciando o cálculo de datas de expiração na renovação.
- **`NotificationType`**: Classifica os alertas disparados no painel (`SYSTEM`, `BILLING`, `ORDER`), permitindo que os usuários filtrem notificações críticas de faturamento das operacionais.

#### 6.1.2 Entidades do Core B2B (Clientes e Faturamento)
- **`Company`**: A raiz de um cliente pagante.
  - *Campos de Negócio:* `companyName`, `cnpj` (Unique), `legalName`, `stateRegistration`.
  - *Comportamento:* A coluna `isActive` funciona como um Master Switch (Soft-Delete). Se for `false`, toda a árvore de usuários e lojas atreladas a esta empresa perde o acesso à API simultaneamente.
  - *Relacionamentos:* Única dona da `Subscription` e do `CompanyResponsible`. Agrupa múltiplos `User` e `Tenant`.
- **`CompanyResponsible`**: O representante legal perante o SaaS.
  - *Campos de Negócio:* `name`, `cpf` (Unique), `email`, `phone`.
  - *Comportamento:* Entidade estritamente vinculada 1:1 com a `Company`. Deletada em cascata (`CASCADE`) se o registro da empresa for fisicamente destruído.
- **`Plan`**: O catálogo de produtos do SaaS.
  - *Campos de Negócio:* `name`, `slug` (Unique), `price`.
  - *Travas Lógicas de Arquitetura:* `maxTenants` (limite de lojas whitelabel permitidas), `maxProducts` e `maxOrders`. O `PlanService` lê estes inteiros para barrar ações no painel B2B (ex: impedir o dono de criar a 4ª loja no Plano Profissional).

#### 6.1.3 Entidades de Segurança, Autenticação e Acesso
- **`User`**: O operador humano (ou de sistema).
  - *Campos de Negócio:* `isActive`, `lastLoginAt`, `locale`, `timezone`.
  - *Relação Crítica:* Possui chave estrangeira `roleId`. 
  - *A Regra SetNull:* A ligação com `Company` (`companyId`) é **opcional**. Isso permite a existência de usuários do tipo "Suporte Nino" que podem transitar no sistema sem estarem presos ao banco de dados de um restaurante específico.
- **`AuthCredential`**: A blindagem de acesso.
  - *Campos de Negócio:* `email` (Unique), `password` (Hashed), `provider` (padrão: `local`), `providerId`.
  - *Restrição:* A chave única é composta por `userId` + `provider`. Isso isola os dados sensíveis da tabela de `User` e deixa o sistema pronto para receber OAuth (login com Google) anexando novas credenciais ao mesmo usuário sem quebrar o banco.
- **`Session`**: O rastreio ativo de segurança.
  - *Campos de Negócio:* `refreshToken` (Unique e criptografado), `ipAddress`, `userAgent`, `expiresAt`.
  - *Comportamento:* A cada login é gerado um novo registro. Permite expiração forçada, auditoria de acesso e token rotation (substituição do token antigo por um novo a cada refresh).

#### 6.1.4 Entidades do Produto SaaS (White-Label)
- **`Tenant`**: A vitrine operacional (A "Loja" em si).
  - *Campos Visuais/Identidade:* `slug` (Unique), `logoUrl`, `favicon`, `primaryColor`, `secondaryColor`.
  - *Configuração de Rede:* `customDomain` (Unique, Nullable).
  - *Arquitetura:* Fica no schema global (`public`) para que o middleware do NestJS possa ler o `customDomain` ou `slug` da requisição HTTP inicial e saber para qual schema dinâmico ele deve injetar o `search_path`.
- **`Subscription`**: O contrato vigente.
  - *Campos de Negócio:* `startedAt`, `expiresAt`.
  - *Relacionamentos:* Amarração 1:1 com `Company`. Liga-se a um `Plan` e a um `SubscriptionStatus`.

---

### 6.2 Schemas Dinâmicos Operacionais (`tenant_<id>`)
Este é o universo isolado do TypeORM. Os schemas são criados via código (Data Definition Language Dinâmico) durante a ativação de um novo `Tenant`. **Nenhuma tabela abaixo se mistura com dados de outros restaurantes.**

- **`Product`**: A base comercial da loja.
  - *Campos:* `name`, `price`, `promotionalPrice`, `description`, `imageUrl`, `isActive`.
- **`Category`**: A estrutura de vitrine.
  - *Campos:* `name`, `sortOrder` (define a posição no front-end do restaurante).
- **`Customer`**: O cliente do restaurante.
  - *Campos:* `name`, `whatsapp`, `email`. 
  - *Isolamento:* Fica trancado no schema do Tenant. A lanchonete A não tem acesso aos clientes da lanchonete B.
- **`Order`**: O registro da transação.
  - *Campos:* `totalAmount`, `status` (preparando, a caminho, entregue), `deliveryAddress`.
  - *Rastreio:* Vinculado ao `Customer`.
- **`OrderItem`**: A quebra do pedido.
  - *Campos:* Quantidade, preço congelado no momento da compra (evita que a mudança de preço do `Product` altere o histórico financeiro do `Order`), observações ("sem cebola").

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
  sub: string,      // Identificador único do Usuário (UUID)
  email: string,    // E-mail atrelado à credencial para logs fáceis
  role: string,     // O nome/código do cargo (ex: 'OWNER', 'MANAGER') para RBAC
  iat: number,      // Issued At (Timestamp de geração - Injetado pelo Passport)
  exp: number       // Expiration Time (Injetado pelo Passport)
}
```

## 8. 🛣️ Endpoints da API
Este tópico cataloga cada endpoint funcional encontrado nos controladores do projeto `nino-api`. Não há agrupamentos genéricos; cada método de cada classe Controller é detalhado abaixo.

### 7.1 Módulo de Autenticação (`src/auth/auth.controller.ts`)
* **POST `/auth/register`**
  - Chama: `authService.register(registerRequestDto)`
  - Descrição: Cria um novo usuário e suas credenciais iniciais.
* **POST `/auth/login`**
  - Chama: `authService.login(dto, req.ip, req.headers['user-agent'])`
  - Descrição: Valida credenciais, seta cookie HttpOnly com o refreshToken e retorna `{ user, accessToken }`.
* **POST `/auth/refresh`**
  - Chama: `authService.refresh(token, req.ip, req.headers['user-agent'])`
  - Descrição: Lê o refreshToken do cookie HttpOnly, emite novo par de tokens e atualiza o cookie. Retorna `{ accessToken }`.
* **POST `/auth/logout`**
  - Chama: `authService.logout(token)`
  - Descrição: Invalida o refreshToken no banco e limpa o cookie.

### 7.2 Módulo de Empresas (`src/company/company.controller.ts`)
* **GET `/companies`**
  - Chama: `companyService.getAll()`
* **GET `/companies/:id`**
  - Chama: `companyService.getById(id)`
* **GET `/companies/cnpj/:cnpj`**
  - Chama: `companyService.getByCnpj(cnpj)`
* **POST `/companies`**
  - Chama: `companyService.create(createCompanyDto)`
* **PUT `/companies/:id`**
  - Chama: `companyService.update(id, updateCompanyDto)`
* **DELETE `/companies/:id`**
  - Chama: `companyService.delete(id)`
* **PATCH `/companies/:id/activate`**
  - Chama: `companyService.activate(id)`
* **PATCH `/companies/:id/deactivate`**
  - Chama: `companyService.deactivate(id)`

### 7.3 Módulo de Responsável pela Empresa (`src/company-responsible/company-responsible.controller.ts`)
* **GET `/company-responsibles`**
  - Chama: `companyResponsibleService.getAll()`
* **GET `/company-responsibles/id/:id`**
  - Chama: `companyResponsibleService.getById(id)`
* **GET `/company-responsibles/doc/:id`**
  - Chama: `companyResponsibleService.getById(id)` — busca por documento (CPF/CNPJ)
* **POST `/company-responsibles`**
  - Chama: `companyResponsibleService.create(createDto)`
* **PUT `/company-responsibles/:id`**
  - Chama: `companyResponsibleService.update(id, updateDto)`
* **DELETE `/company-responsibles/:id`**
  - Chama: `companyResponsibleService.delete(id)` — retorna HTTP 204

### 7.4 Módulo de Usuários (`src/user/user.controller.ts`)
* **POST `/users`**
  - Guard: `JwtAuthGuard`
  - Chama: `userService.create(createUserDto)`
* **GET `/users/:id`**
  - Guard: `JwtAuthGuard`
  - Chama: `userService.getById(id)`
* **GET `/users/company/:companyId`**
  - Guard: `JwtAuthGuard`
  - Chama: `userService.getByCompanyId(companyId)`
* **PATCH `/users/:id`**
  - Guard: `JwtAuthGuard`
  - Chama: `userService.update(id, updateUserDto)`
* **DELETE `/users/:id`**
  - Guard: `JwtAuthGuard`
  - Chama: `userService.delete(id)`

### 7.5 Módulo de Credenciais (`src/credential/credential.controller.ts`)
* **GET `/credentials/list/:id`**
  - Guard: `JwtAuthGuard`
  - Chama: `credentialsService.getAll(userId)` — lista credenciais de um usuário
* **GET `/credentials/:id`**
  - Guard: `JwtAuthGuard`
  - Chama: `credentialsService.getById(id)`
* **PATCH `/credentials/:id`**
  - Guard: `JwtAuthGuard`
  - Chama: `credentialsService.update(id, updateDto)` — atualiza email
* **PATCH `/credentials/change-password`**
  - Guard: `JwtAuthGuard`
  - Chama: `credentialsService.changePassword(userId, oldPassword, newPassword)` — userId extraído do JWT
* **DELETE `/credentials/:id`**
  - Guard: `JwtAuthGuard`
  - Chama: `credentialsService.delete(id)`

### 7.6 Módulo de Planos (`src/plan/plan.controller.ts`)
* **GET `/plans`**
  - Chama: `planService.getAll()`
* **GET `/plans/:id`**
  - Chama: `planService.getById(id)`
* **POST `/plans`**
  - Chama: `planService.create(createPlanDto)`
* **PATCH `/plans/:id`**
  - Chama: `planService.update(id, updatePlanDto)`
* **DELETE `/plans/:id`**
  - Chama: `planService.delete(id)`

### 7.7 Módulo de Tipo de Plano (`src/plan-type/plan-type.controller.ts`)
* **GET `/plan-types`**
  - Chama: `planTypeService.getAll()`
* **GET `/plan-types/:id`**
  - Chama: `planTypeService.getById(id)`
* **POST `/plan-types`**
  - Chama: `planTypeService.create(createDto)`
* **PUT `/plan-types/:id`**
  - Chama: `planTypeService.update(id, updateDto)`
* **DELETE `/plan-types/:id`**
  - Chama: `planTypeService.delete(id)`

### 7.8 Módulo de Roles (`src/role/role.controller.ts`)
* **GET `/roles`**
  - Chama: `roleService.getAll()`
* **GET `/roles/:id`**
  - Chama: `roleService.getById(id)`
* **POST `/roles`**
  - Chama: `roleService.create(createRoleDto)`
* **PUT `/roles/:id`**
  - Chama: `roleService.update(id, updateRoleDto)`
* **DELETE `/roles/:id`**
  - Chama: `roleService.delete(id)`

### 7.9 Módulo de Status do Tenant (`src/tenant-status/tenant-status.controller.ts`)
* **GET `/tenant-statuses`**
  - Chama: `tenantStatusService.getAll()`
* **GET `/tenant-statuses/:id`**
  - Chama: `tenantStatusService.getById(id)`
* **POST `/tenant-statuses`**
  - Chama: `tenantStatusService.create(createDto)`
* **PUT `/tenant-statuses/:id`**
  - Chama: `tenantStatusService.update(id, updateDto)`
* **DELETE `/tenant-statuses/:id`**
  - Chama: `tenantStatusService.delete(id)`

### 7.10 Módulo de Status de Assinatura (`src/subscription-status/subscription-status.controller.ts`)
* **GET `/subscription-statuses`**
  - Chama: `subscriptionStatusService.getAll()`
* **GET `/subscription-statuses/:id`**
  - Chama: `subscriptionStatusService.getById(id)`
* **POST `/subscription-statuses`**
  - Chama: `subscriptionStatusService.create(createDto)`
* **PUT `/subscription-statuses/:id`**
  - Chama: `subscriptionStatusService.update(id, updateDto)`
* **DELETE `/subscription-statuses/:id`**
  - Chama: `subscriptionStatusService.delete(id)`

### 7.11 Módulo de Status de Fatura (`src/invoice-status/invoice-status.controller.ts`)
* **GET `/invoice-statuses`**
  - Chama: `invoiceStatusService.getAll()`
* **GET `/invoice-statuses/:id`**
  - Chama: `invoiceStatusService.getById(id)`
* **POST `/invoice-statuses`**
  - Chama: `invoiceStatusService.create(createDto)`
* **PUT `/invoice-statuses/:id`**
  - Chama: `invoiceStatusService.update(id, updateDto)`
* **DELETE `/invoice-statuses/:id`**
  - Chama: `invoiceStatusService.delete(id)`

### 7.12 Módulo de Tipo de Notificação (`src/notification-type/notification-type.controller.ts`)
* **GET `/notification-types`**
  - Chama: `notificationTypeService.getAll()`
* **GET `/notification-types/:id`**
  - Chama: `notificationTypeService.getById(id)`
* **POST `/notification-types`**
  - Chama: `notificationTypeService.create(createDto)`
* **PUT `/notification-types/:id`**
  - Chama: `notificationTypeService.update(id, updateDto)`
* **DELETE `/notification-types/:id`**
  - Chama: `notificationTypeService.delete(id)`

### 7.13 Módulo de Sessão (`src/session/session.controller.ts`)
* **POST `/sessions`**
  - Chama: `sessionsService.create(createSessionDto)`
* **GET `/sessions/list-by-user-id/:userId`**
  - Guard: `JwtAuthGuard`
  - Chama: `sessionsService.getListByUserId(userId)`
* **GET `/sessions/:id`**
  - Guard: `JwtAuthGuard`
  - Chama: `sessionsService.getById(id)`
* **PATCH `/sessions/:id`**
  - Guard: `JwtAuthGuard`
  - Chama: `sessionsService.update(id, updateSessionDto)`
* **DELETE `/sessions/:id`**
  - Guard: `JwtAuthGuard`
  - Chama: `sessionsService.delete(id)`

### 7.14 Módulo de Mock de CNPJ (`src/mocks/cnpj/cnpj.mock.controller.ts`)
* **GET `/mock/cnpjs`**
  - Gera um CNPJ aleatório válido.
* **GET `/mock/cnpjs/:quantity`**
  - Gera N CNPJs aleatórios válidos.

### 7.15 Módulo de Mock de Usuário (`src/mocks/user/user.mock.controller.ts`)
* **GET `/mock/users`**
  - Gera dados de um usuário aleatório.
* **GET `/mock/users/:quantity`**
  - Gera dados de N usuários aleatórios.
---

## 9. 🏛️ Padrões Arquiteturais

### 1. **Repository Pattern**

Camada de abstração entre Service e Prisma. **Tratamento de null centralizado no repository.**

```typescript
// ✅ Repository — trata erros Prisma + null
async getById(id: string): Promise<Role> {
  try {
    const found = await this.prisma.role.findUnique({ where: { id } })

    if (!found) throw new NotFoundException('Role not found')

    return found
  } catch (error) {
    this.prismaErrorService.handleError(error)
  }
}

// ✅ Service — delegação pura
async getById(id: string): Promise<Role> {
  return await this.roleRepository.getById(id)
}

// ✅ Controller — delegação HTTP
async getById(@Param('id') id: string): Promise<Role> {
  return await this.roleService.getById(id)
}
```

### 2. **PrismaErrorService — Centralização de Erros**

Mapeia códigos de erro Prisma para exceções NestJS. Erros `HttpException` são relançados diretamente sem transformação.

```typescript
// Suportados:
// P2025 — NotFoundException (recurso não encontrado)
// P2002 — ConflictException (unique constraint)
// P2003 — BadRequestException (foreign key constraint)

// Uso:
try {
  await this.prisma.role.delete({ where: { id } })
} catch (error) {
  this.prismaErrorService.handleError(error)
}
```

### 3. **Types com Prisma.GetPayload**

Tipos gerados diretamente do schema Prisma via `GetPayload`. O genérico vazio `<{}>` retorna o tipo completo da entidade conforme definida no schema.

```typescript
import { Prisma } from '@prisma/client'

export type Role = Prisma.RoleGetPayload<{}>
export type User = Prisma.UserGetPayload<{}>
```

### 4. **Remoção de campos sensíveis via destructuring**

Campos como `password` são removidos via destructuring no controller/service, não via `omit` do Prisma.

```typescript
// ✅ No controller (credential.controller.ts)
const { password, ...credential } = await this.credentialsService.getById(id)
return credential
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

Valida e transforma payloads automaticamente.

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

### 8. **Middleware de Tenant (Futuro)**

A cada requisição, identifica o restaurante (via JWT) e conecta ao schema correto.

```typescript
// Após implementação schema-per-tenant:
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.profile.tenantId // Extraído do JWT
    // Conecta Prisma ao schema "tenant_<tenantId>"
    this.prisma.$queryRaw`SET search_path TO tenant_${tenantId}`
    next()
  }
}
```

### 9. **Path Aliases**

Imports sem relativos confusos.

```typescript
// ✅
import { AuthService } from '@auth/auth.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

// ❌ Evitar
import { AuthService } from '../../../../auth/auth.service'
```

---

## 10. ✍️ Convenções de Escrita

### Funções Pequenas & Responsabilidade Única

Cada função faz **uma coisa só**. Se ficou grande, extrai método privado.

### Early Return — Sem Else

Falha rápido, retorna cedo. Evita nesting profundo.

```typescript
// ✅
if (!credential.email || !credential.password)
  throw new UnauthorizedException('Invalid credentials')

await this.passwordService.validate(payload.password, credential.password)

// ❌
if (credential.email && credential.password) {
  await this.passwordService.validate(...)
} else {
  throw new UnauthorizedException(...)
}
```

### Nomes Descritivos & Sufixos de Contexto

- Variáveis: `credentialRepository`, `hashedRefreshToken`, `userTokenData`
- Sem abreviações: `usr`, `pwd`, `repo` → evitar
- Sufixos que indicam contexto: `...Repository`, `...DTO`, `...Type`, `...Guard`, `...Strategy`

### Separação de Dados Sensíveis

Nunca retornar `password` para o cliente. Remoção feita via destructuring no controller.

```typescript
// ✅ Destructuring no controller
const { password, ...credential } = await this.credentialsService.getById(id)
return credential
```

### Try/Catch Apenas no Repository

Service e Controller não tratam erros Prisma diretamente — delegam.

```typescript
// ✅ Repository
async getById(id: string): Promise<User> {
  try {
    return await this.prisma.user.findUnique({ ... })
  } catch (error) {
    this.prismaErrorService.handleError(error)
  }
}

// ✅ Service — propaga naturalmente
async getById(id: string): Promise<User> {
  return await this.userRepository.getById(id)
  // Se erro → automático do repository
}
```

---

## 11. 🧪 Padrões de Teste

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
- Erros Prisma → PrismaErrorService chamado

**DTO** — testa validações class-validator

---

## 12. 🔄 Fluxos Principais

### Fluxo 1: Login

```
POST /auth/login
  ├─ Validação DTO (LoginRequestDto)
  ├─ AuthService.login(dto, ipAddress, userAgent)
  │   ├─ credentialsService.getByEmail(dto.email)
  │   ├─ passwordService.compare(dto.password, credential.password)
  │   ├─ userService.getById(credential.id)
  │   ├─ tokenService.generateTokens({ sub: user.id, role: user.roleId })
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

### Fluxo 3: Mudança de Senha

```
PATCH /credentials/change-password (+ JwtAuthGuard)
  ├─ userId extraído do JWT (req.user.sub)
  ├─ credentialsService.changePassword(userId, oldPassword, newPassword)
  │   ├─ Busca credencial do usuário
  │   ├─ passwordService.compare(oldPassword, credential.password)
  │   └─ Atualiza password com hash bcrypt
  └─ Response 200: { message: "Password changed successfully" }
```

### Fluxo 4: Registro de Conta

```
POST /auth/register
  ├─ Validação DTO (RegisterRequestDto)
  ├─ AuthService.register(dto)
  │   ├─ userService.create({ name, roleId })
  │   └─ credentialsService.create({ userId, email, password })
  └─ Response 201: { user }
```

### Fluxo 5: Atualizar Usuário

```
PATCH /users/:id (+ JwtAuthGuard)
  ├─ UserService.update(id, updateUserDto)
  └─ Response 200: { user atualizado }
```

---

## 13. 🔧 Trade-offs & Decisões Arquiteturais

| Decisão                | Escolha                     | Motivo                                                    | Alternativa                                                    |
| ---------------------- | --------------------------- | --------------------------------------------------------- | -------------------------------------------------------------- |
| **Arquitetura**        | Monolito                    | MVP — velocidade > escalabilidade prematura               | Microsserviços (overkill para MVP)                             |
| **Multi-tenant**       | Schema-per-tenant           | Isolamento real sem custo de múltiplos bancos             | Database-per-tenant (mais caro), Row-per-tenant (menos seguro) |
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

## 14. 📊 Status dos Módulos

| Módulo                    | Status        | Endpoints | Progresso |
| ------------------------- | ------------- | --------- | --------- |
| **auth**                  | ✅ Concluído  | 4         | 100%      |
| **user**                  | ✅ Concluído  | 5         | 100%      |
| **credential**            | ✅ Concluído  | 5         | 100%      |
| **company**               | ✅ Concluído  | 8         | 100%      |
| **company-responsible**   | ✅ Concluído  | 6         | 100%      |
| **session**               | ✅ Concluído  | 5         | 100%      |
| **role**                  | ✅ Concluído  | 5         | 100%      |
| **plan**                  | ✅ Concluído  | 5         | 100%      |
| **plan-type**             | ✅ Concluído  | 5         | 100%      |
| **subscription-status**   | ✅ Concluído  | 5         | 100%      |
| **invoice-status**        | ✅ Concluído  | 5         | 100%      |
| **tenant-status**         | ✅ Concluído  | 5         | 100%      |
| **notification-type**     | ✅ Concluído  | 5         | 100%      |
| **mocks**                 | ✅ Concluído  | 4         | 100%      |
| **shared/prisma**         | ✅ Concluído  | —         | 100%      |
| **shared/guards**         | ✅ Concluído  | —         | 100%      |
| **shared/strategies**     | ✅ Concluído  | —         | 100%      |
| **tenant**                | ⏳ Futuro     | —         | 0%        |
| **restaurant**            | ⏳ Futuro     | —         | 0%        |
| **order**                 | ⏳ Futuro     | —         | 0%        |
| **payment**               | ⏳ Futuro     | —         | 0%        |
| **delivery**              | ⏳ Futuro     | —         | 0%        |
| **notification**          | ⏳ Futuro     | —         | 0%        |

---

## 15. 🚀 Próximas Features (Roadmap)

### Curto Prazo (1-2 semanas)

- [x] Swagger documentation (`@nestjs/swagger`) — disponível em `/api/docs`
- [ ] Implementar `POST /auth/forgot-password` + `POST /auth/reset-password`
  - Depende integração com Resend (email transacional)
  - Token de reset com TTL curto (30 min)
- [ ] Testes completos para todos os módulos

### Médio Prazo (3-4 semanas)

- [ ] Módulo de Tenant
  - CRUD: create, read, update, delete restaurante
  - Schema-per-tenant isolamento no PostgreSQL
  - Middleware de tenant identificação
- [ ] Rate limiting refinado com Redis (ao invés de em-memory)
- [ ] BullMQ + filas assíncronas
  - Emails via Resend
  - WhatsApp via Z-API
  - Push notifications via FCM

### Longo Prazo (MVP completo)

- [ ] Módulo Restaurant: cardápio, produtos, categorias
- [ ] Módulo Order: criar, rastrear, histórico de pedidos
- [ ] Integração Pagar.me: split payments, webhooks
- [ ] Módulo Delivery: entregadores, rastreamento real-time (SSE)
- [ ] Notifications: Resend, Z-API, FCM, SSE
- [ ] Analytics: PostHog integration

---

## 16. 🛠️ Variáveis de Ambiente

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
R2_BUCKET_NAME=ninomia-files
```

**Arquivo `.env.example`:** Sempre atualizado com as variáveis necessárias.

---

## 17. 🐳 Docker & Local Development

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

## 18. 📚 Referências & Documentação

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

## 19. 🤝 Contribuição & Commits

### Padrão de Branches

- `main` → Produção
- `develop` → Staging
- `feature/nome-feature` → Feature branches

### Padrão de Commits

```
feat(auth): implementar login com JWT
fix(user): corrigir validação de role
test(credentials): adicionar testes para updatePassword
docs: atualizar CONTEXT.md
refactor(repository): extrair queries em helpers
```

### Pull Request Checklist

- [ ] Testes passando (`npm test`)
- [ ] Cobertura mantida/melhorada
- [ ] Linting sem erros (`npm run lint`)
- [ ] CONTEXT.md atualizado (se aplicável)
- [ ] Mensagens de commit descritivas

---

## 20. 📞 Suporte & Dúvidas

Dúvidas sobre código? Consulte:

1. Este Readme.md
2. Tests (`.spec.ts` files)
3. Comments inline no código
4. Issue no repositório

---

**Última atualização:** Abril 2026  
**Desenvolvedor:** Paulo (Solo)  
**Status:** MVP em desenvolvimento — ~55% concluído

**77 endpoints implementados em 14 módulos funcionais e modulares!** 🎉
