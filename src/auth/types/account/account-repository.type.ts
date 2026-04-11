import { Prisma } from '@prisma/client'

export type AccountRepository = Prisma.AccountGetPayload<{
  omit: { roleId: true }
  include: {
    role: { omit: { id: true } }
  }
}>
