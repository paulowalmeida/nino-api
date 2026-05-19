import { Prisma } from '@prisma/client'

export type CustomerFull = Prisma.CustomerGetPayload<{
  include: { user: true }
}>
