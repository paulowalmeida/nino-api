# Backoffice — Configurações e Regras

## Ciclo de Vida da Subscription

### Periodicidade e desconto

MVP: somente plano mensal. Plano anual (15% de desconto) será adicionado quando o módulo `billing` estiver maduro.

### Trial

- Duração: 30 dias sem cartão
- Gatilhos de notificação: dias **15**, **25** e **29**

### Gatilhos de renovação (assinatura ativa)

Avisos enviados **10 e 5 dias antes** do vencimento mensal.

### Suspensão por inadimplência

| Dia após vencimento | Consequência |
|---|---|
| Dia 3 | Dashboard suspenso — loja continua operando |
| Dia 5 | Loja entra em `MAINTENANCE` — consumidor vê mensagem genérica |
| Dia 10 | `Company.isActive = false` — todos os tokens JWT da empresa são invalidados |

---

## Configurações do Tenant (`TenantSettings`)

### Compartilhamento de colaboradores

`allowSharedStaff` — controla se um colaborador pode estar vinculado a múltiplos tenants simultaneamente.

- `true` (padrão) — colaborador pode trabalhar em mais de um estabelecimento
- `false` — ao aceitar um invite, o sistema verifica se o usuário já tem vínculo ativo em outro tenant e bloqueia se houver

Configurado via upsert em `PUT /tenants/:tenantId/settings` no campo `allowSharedStaff`.

---

## Limites por Plano e Faturamento

### MVP — somente mensal
Plano anual não está disponível no MVP. Será adicionado quando houver volume suficiente de clientes e o módulo `billing` estiver maduro.

### Ciclo de faturamento

- **Dia da assinatura** — primeira fatura proporcional até o dia 1 do mês seguinte
- **Todo dia 1** — nova fatura gerada para o ciclo do mês
- **Fechamento do ciclo** — verifica excedente de pedidos; se houver, fatura já vem com valor ajustado pelo plano superior

### Limites de tenants

Ao criar um novo tenant, o sistema verifica se a empresa atingiu `Plan.maxTenants`. Se sim:
- Recusa a criação
- Informa que o limite do plano foi atingido
- Sugere upgrade de plano

### Limites de produtos

- Conta apenas produtos ativos (`deletedAt: null`)
- Produto deletado não pode ser restaurado e sai do contador imediatamente

### Limites de pedidos (por mês)

- Contador reseta todo dia 1
- **80% do limite** — aviso preventivo ao merchant
- **100% do limite** — aviso de limite atingido, pedidos **não** são bloqueados
- **Excedente** — fatura do mês seguinte é cobrada com base no plano superior proporcional ao volume excedido
- **Reincidência** — mesmo aviso, mesma cobrança. Sem bloqueio automático

### Upgrade de plano com crédito proporcional

Ao fazer upgrade no meio do ciclo:
- Calcula os dias não utilizados do plano atual: `valor pago ÷ dias do período × dias restantes`
- Crédito abatido na fatura do novo plano
- Novo plano entra em vigor imediatamente

Downgrade só é permitido ao fim do período pago. Sem crédito.

### Módulo `billing` (futuro)

Módulo de infraestrutura financeira responsável por:
- Cálculo de excedente de pedidos no fechamento do mês
- Geração de faturas
- Cálculo e aplicação de crédito proporcional em upgrades
- Integração com Pagar.me (split payments, webhooks)
