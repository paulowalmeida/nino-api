import { Prisma } from '@prisma/client'

export type UserFull = Prisma.UserGetPayload<{
  include: { globalRole: true; credentials: true }
}>
