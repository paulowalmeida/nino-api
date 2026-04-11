import { Prisma } from '@prisma/client'

export type AccountRefreshToken = Prisma.AccountGetPayload<{
  where: { id }
  select: {
    id: true
    email: true
    hashedRefreshToken: true
    role: { select: { code: true } }
  }
}>
