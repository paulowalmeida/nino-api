import { Prisma } from '@prisma/client'

export type SessionFull = Prisma.SessionGetPayload<{
  include: { user: { include: { globalRole: true } } }
}>
