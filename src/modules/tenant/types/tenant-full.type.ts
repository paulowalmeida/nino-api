import { Prisma } from '@prisma/client'

export type TenantFull = Prisma.TenantGetPayload<{
  include: { tenantStatus: true; tenantype: true; company: true }
}>
