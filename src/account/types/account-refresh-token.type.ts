import { Prisma } from '@prisma/client'

export type AccountRefreshToken = Prisma.AccountGetPayload<{
  select: {
    id: true
    email: true
    hashedRefreshToken: true
    role: { select: { id: true } }
  }
}>
