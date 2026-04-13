import { Prisma } from '@prisma/client'
import { NotificationType } from '@shared/enums/notification-type.enum'
import { Plan } from '@shared/enums/plan.enum'
import { Role } from '@shared/enums/role.enum'
import { SubscriptionStatus } from '@shared/enums/subscription-status.enum'

export const roles: Prisma.RoleCreateInput[] = [
  { id: Role.UNRECOGNIZED, description: 'UNRECOGNIZED' },
  { id: Role.UNSPECIFIED, description: 'USER_ROLE_UNSPECIFIED' },
  { id: Role.ADMIN, description: 'ADMIN' },
  { id: Role.SUPPORT, description: 'SUPPORT' },
  { id: Role.MERCHANT, description: 'MERCHANT' },
  { id: Role.CUSTOMER, description: 'CUSTOMER' },
  { id: Role.COURIER, description: 'COURIER' },
  { id: Role.GUEST, description: 'GUEST' },
]

export const plans: Prisma.PlanCreateInput[] = [
  {
    id: Plan.STARTER,
    name: 'Starter',
    slug: 'starter',
    price: 89.9,
    maxTenants: 1,
    maxProducts: 50,
    maxOrders: 300,
  },
  {
    id: Plan.PRO,
    name: 'Pro',
    slug: 'pro',
    price: 149.9,
    maxTenants: 1,
    maxProducts: 200,
    maxOrders: 1000,
  },
  {
    id: Plan.BUSINESS,
    name: 'Business',
    slug: 'business',
    price: 249.9,
    maxTenants: 3,
    maxProducts: 500,
    maxOrders: 5000,
  },
  {
    id: Plan.REDE,
    name: 'Rede',
    slug: 'rede',
    price: 0, // sob consulta — ajusta depois
    maxTenants: 999,
    maxProducts: 999,
    maxOrders: 999,
  },
]

export const subscriptionStatuses: Prisma.SubscriptionStatusCreateInput[] = [
  { id: SubscriptionStatus.ACTIVE, description: 'ACTIVE' },
  { id: SubscriptionStatus.INACTIVE, description: 'INACTIVE' },
  { id: SubscriptionStatus.TRIAL, description: 'TRIAL' },
  { id: SubscriptionStatus.CANCELLED, description: 'CANCELLED' },
  { id: SubscriptionStatus.PAST_DUE, description: 'PAST_DUE' }, // pagamento atrasado
]

export const notificationTypes: Prisma.NotificationTypeCreateInput[] = [
  { id: NotificationType.SYSTEM, description: 'SYSTEM' },
  { id: NotificationType.PROMOTION, description: 'PROMOTION' },
  { id: NotificationType.ORDER, description: 'ORDER' },
  { id: NotificationType.PAYMENT, description: 'PAYMENT' },
  { id: NotificationType.ACCOUNT, description: 'ACCOUNT' },
]
