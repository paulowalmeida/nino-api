import { Prisma } from '@prisma/client'

export type TenantPaymentMethodFull = Prisma.TenantPaymentMethodGetPayload<{
  include: { method: true }
}>
