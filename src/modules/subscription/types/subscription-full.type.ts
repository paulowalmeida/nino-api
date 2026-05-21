import { Prisma } from '@prisma/client'

export type SubscriptionFull = Prisma.SubscriptionGetPayload<{
  include: {
    plan: true
    subscriptionStatus: true
  }
}>
