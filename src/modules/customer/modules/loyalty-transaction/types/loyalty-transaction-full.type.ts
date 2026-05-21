import { Prisma } from '@prisma/client'

export type LoyaltyTransactionFull = Prisma.LoyaltyTransactionGetPayload<{
  include: { tenant: true }
}>
