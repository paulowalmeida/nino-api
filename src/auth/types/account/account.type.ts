import { Prisma } from '@prisma/client'

export type Account = Prisma.AccountGetPayload<{
  include: {
    role: { omit: { id: true } }
  }
  omit: {
    hashedRefreshToken: true
    password: true
    roleId: true,
    userId: true
  }
}>
