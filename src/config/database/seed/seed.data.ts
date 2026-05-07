import { GlobalRole } from '@shared/enums/global-role.enum'
import { InvoiceStatus } from '@shared/enums/invoice-status.enum'
import { NotificationType } from '@shared/enums/notification-type.enum'
import { PlanType } from '@shared/enums/plan-type.enum'
import { Plan } from '@shared/enums/plan.enum'
import { SubscriptionStatus } from '@shared/enums/subscription-status.enum'
import { TenantRole } from '@shared/enums/tenant-role.enum'
import { TenantStatus } from '@shared/enums/tenant-status.enum'

export const globalRoles = [
  { name: GlobalRole.ADMIN, description: 'Dono da Plataforma' },
  { name: GlobalRole.SUPPORT, description: 'Suporte Técnico' },
  { name: GlobalRole.MERCHANT, description: 'Dono do Restaurante' },
  { name: GlobalRole.CUSTOMER, description: 'Cliente Final' },
  { name: GlobalRole.COURIER, description: 'Entregador' },
  { name: GlobalRole.GUEST, description: 'Usuário Convidado' },
]

export const tenantRoles = [
  { name: TenantRole.OWNER, description: 'Proprietário da unidade' },
  { name: TenantRole.MANAGER, description: 'Gerente' },
  { name: TenantRole.CASHIER, description: 'Operador de caixa' },
  { name: TenantRole.STAFF, description: 'Funcionário' },
]

export const tenantStatuses = [
  { name: TenantStatus.ACTIVE, description: 'Ativo' },
  { name: TenantStatus.INACTIVE, description: 'Inativo' },
  { name: TenantStatus.SUSPENDED, description: 'Suspenso' },
  { name: TenantStatus.PENDING, description: 'Pendente de ativação' },
]

export const subscriptionStatuses = [
  { name: SubscriptionStatus.ACTIVE, description: 'Ativo' },
  { name: SubscriptionStatus.INACTIVE, description: 'Inativo' },
  { name: SubscriptionStatus.TRIAL, description: 'Em avaliação' },
  { name: SubscriptionStatus.CANCELLED, description: 'Cancelado' },
  { name: SubscriptionStatus.PAST_DUE, description: 'Pagamento em atraso' },
]

export const invoiceStatuses = [
  { name: InvoiceStatus.PENDING, description: 'Pendente' },
  { name: InvoiceStatus.PAID, description: 'Pago' },
  { name: InvoiceStatus.OVERDUE, description: 'Vencida' },
  { name: InvoiceStatus.CANCELLED, description: 'Cancelada' },
]

export const notificationTypes = [
  { name: NotificationType.SYSTEM, description: 'Sistema' },
  { name: NotificationType.PROMOTION, description: 'Promoção' },
  { name: NotificationType.ORDER, description: 'Pedido' },
  { name: NotificationType.PAYMENT, description: 'Pagamento' },
  { name: NotificationType.USER, description: 'Usuário' },
]

export const planTypes = [
  { name: PlanType.MONTHLY, description: 'Plano Mensal' },
  { name: PlanType.YEARLY, description: 'Plano Anual' },
]

// typeId resolvido em runtime após upsert de planTypes
// maxOrders: null = ilimitado
export const plans = [
  {
    name: 'Starter',
    slug: Plan.STARTER,
    price: 97,
    maxTenants: 1,
    maxProducts: 50,
    maxOrders: 200,
    hasPrioritySupport: false,
  },
  {
    name: 'Pro',
    slug: Plan.PRO,
    price: 197,
    maxTenants: 3,
    maxProducts: 200,
    maxOrders: null,
    hasPrioritySupport: true,
  },
  {
    name: 'Business',
    slug: Plan.BUSINESS,
    price: 297,
    maxTenants: 10,
    maxProducts: 500,
    maxOrders: null,
    hasPrioritySupport: true,
  },
  {
    name: 'Rede',
    slug: Plan.REDE,
    price: 0,
    maxTenants: null,
    maxProducts: null,
    maxOrders: null,
    hasPrioritySupport: true,
  },
]
