import { Prisma } from '@prisma/client'

export type Account = Prisma.AccountGetPayload<{
  omit: { roleId: true },
  include: {
    credentials: { omit: { accountId: true } }
    notifications: { omit: { accountId: true } }
    role: { omit: { id: true } }
    subscription: { omit: { accountId: true } }
    tenants: { omit: { accountId: true } }
    user: { omit: { accountId: true } }
  }
}>
