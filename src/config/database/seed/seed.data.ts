import { InvoiceStatus } from '@shared/enums/invoice-status.enum'
import { NotificationType } from '@shared/enums/notification-type.enum'
import { PlanType } from '@shared/enums/plan-type.enum'
import { Plan } from '@shared/enums/plan.enum'
import { Role } from '@shared/enums/role.enum'
import { SubscriptionStatus } from '@shared/enums/subscription-status.enum'
import { TenantStatus } from '@shared/enums/tenant-status.enum'

export const planTypes = [
  { name: PlanType.MONTHLY, description: 'Plano Mensal' },
  { name: PlanType.YEARLY, description: 'Plano Anual' },
]

export const roles = [
  { name: Role.UNRECOGNIZED, description: 'UNRECOGNIZED' },
  { name: Role.UNSPECIFIED, description: 'PROFILE_ROLE_UNSPECIFIED' },
  { name: Role.ADMIN, description: 'Dono da Plataforma' },
  { name: Role.SUPPORT, description: 'Suporte Técnico' },
  { name: Role.MERCHANT, description: 'Dono do Restaurante' },
  { name: Role.CUSTOMER, description: 'Cliente Final' },
  { name: Role.COURIER, description: 'Entregador' },
  { name: Role.GUEST, description: 'Usuário Convidado' },
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

// typeId é resolvido em runtime pelo seed runner após upsert de planTypes
export const plans = [
  {
    name: 'Starter',
    slug: Plan.STARTER,
    price: 89.9,
    maxTenants: 1,
    maxProducts: 50,
    maxOrders: 300,
  },
  {
    name: 'Pro',
    slug: Plan.PRO,
    price: 149.9,
    maxTenants: 1,
    maxProducts: 200,
    maxOrders: 1000,
  },
  {
    name: 'Business',
    slug: Plan.BUSINESS,
    price: 249.9,
    maxTenants: 3,
    maxProducts: 500,
    maxOrders: 5000,
  },
  {
    name: 'Rede',
    slug: Plan.REDE,
    price: 0,
    maxTenants: 999,
    maxProducts: 999,
    maxOrders: 999,
  },
]
