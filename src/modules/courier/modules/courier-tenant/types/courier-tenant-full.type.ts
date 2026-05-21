import { Prisma } from '@prisma/client'

export type CourierTenantFull = Prisma.CourierTenantGetPayload<{
  include: {
    courier: { include: { globalRole: true; credentials: true } }
    tenant: true
  }
}>
