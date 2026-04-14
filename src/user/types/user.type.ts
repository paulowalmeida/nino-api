import { Prisma } from '@prisma/client'

export type User = Prisma.UserGetPayload<{
  include: {
    role: true
    credentials: true
    contacts: true // vai retornar []
    tenants: true // vai retornar []
    subscription: true // vai retornar null
    notifications: true // vai retornar []
  }
}>
