import { Prisma } from '@prisma/client'
import { NotificationType } from '@shared/enums/notification-type.enum'
import { Plan } from '@shared/enums/plan.enum'
import { SubscriptionStatus } from '@shared/enums/subscription-status.enum'
import { Role } from '@shared/enums/role.enum'

export const roles: Prisma.RoleCreateInput[] = [
  { code: Role.UNRECOGNIZED, description: 'UNRECOGNIZED' },
  { code: Role.UNSPECIFIED, description: 'USER_ROLE_UNSPECIFIED' },
  { code: Role.ADMIN, description: 'ADMIN' },
  { code: Role.SUPPORT, description: 'SUPPORT' },
  { code: Role.MERCHANT, description: 'MERCHANT' },
  { code: Role.CUSTOMER, description: 'CUSTOMER' },
  { code: Role.COURIER, description: 'COURIER' },
  { code: Role.GUEST, description: 'GUEST' },
]

export const plans: Prisma.PlanCreateInput[] = [
  {
    code: Plan.STARTER,
    name: 'Starter',
    slug: 'starter',
    price: 89.9,
    maxTenants: 1,
    maxProducts: 50,
    maxOrders: 300,
  },
  {
    code: Plan.PRO,
    name: 'Pro',
    slug: 'pro',
    price: 149.9,
    maxTenants: 1,
    maxProducts: 200,
    maxOrders: 1000,
  },
  {
    code: Plan.BUSINESS,
    name: 'Business',
    slug: 'business',
    price: 249.9,
    maxTenants: 3,
    maxProducts: 500,
    maxOrders: 5000,
  },
  {
    code: Plan.REDE,
    name: 'Rede',
    slug: 'rede',
    price: 0, // sob consulta — ajusta depois
    maxTenants: 999,
    maxProducts: 999,
    maxOrders: 999,
  },
]

export const subscriptionStatuses: Prisma.SubscriptionStatusCreateInput[] = [
  { code: SubscriptionStatus.ACTIVE, description: 'ACTIVE' },
  { code: SubscriptionStatus.INACTIVE, description: 'INACTIVE' },
  { code: SubscriptionStatus.TRIAL, description: 'TRIAL' },
  { code: SubscriptionStatus.CANCELLED, description: 'CANCELLED' },
  { code: SubscriptionStatus.PAST_DUE, description: 'PAST_DUE' }, // pagamento atrasado
]

export const notificationTypes: Prisma.NotificationTypeCreateInput[] = [
  { code: NotificationType.SYSTEM, description: 'SYSTEM' },
  { code: NotificationType.PROMOTION, description: 'PROMOTION' },
  { code: NotificationType.ORDER, description: 'ORDER' },
  { code: NotificationType.PAYMENT, description: 'PAYMENT' },
  { code: NotificationType.ACCOUNT, description: 'ACCOUNT' },
]
