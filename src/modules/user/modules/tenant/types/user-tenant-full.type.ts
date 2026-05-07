import { Prisma } from '@prisma/client'

export type UserTenantFull = Prisma.UserTenantGetPayload<{
  include: {
    tenantRole: true
    user: { include: { globalRole: true; credentials: true } }
  }
}>
