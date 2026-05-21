import { Prisma } from '@prisma/client'

export type CustomerTenantFull = Prisma.CustomerTenantGetPayload<{
  include: { tenant: true }
}>
