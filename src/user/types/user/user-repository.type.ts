import { Prisma } from '@prisma/client'

export type User = Prisma.UserGetPayload<{
  include: {
    addresses: {
      omit: {
        userId: true
      }
    }
    contacts: {
      omit: {
        userId: true
      }
    }
  }
}>
