import { Prisma } from '@prisma/client'

export type User = Prisma.UserGetPayload<{
  omit: { roleId: true },
  include: {
    credentials: { omit: { userId: true } }
    notifications: { omit: { userId: true } }
    role:  true,
    subscription: { omit: { userId: true } }
    tenants: { omit: { userId: true } }
    profile: { omit: { userId: true } }
  }
}>
