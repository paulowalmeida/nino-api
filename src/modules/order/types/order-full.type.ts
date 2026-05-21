import { Prisma } from '@prisma/client'

export type OrderFull = Prisma.OrderGetPayload<{
  include: {
    status: true
    items: { include: { product: true } }
    statusHistory: { include: { status: true } }
  }
}>
