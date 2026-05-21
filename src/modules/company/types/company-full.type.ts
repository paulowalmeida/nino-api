import { Prisma } from '@prisma/client'

export type CompanyFull = Prisma.CompanyGetPayload<{
  include: { responsible: true }
}>
