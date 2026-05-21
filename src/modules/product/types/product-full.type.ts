import { Prisma } from '@prisma/client'

export type ProductFull = Prisma.ProductGetPayload<{
  include: { category: true }
}>
