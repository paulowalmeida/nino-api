import { Prisma } from '@prisma/client'

export type AuthCredentialRefreshToken = Prisma.AuthCredentialGetPayload<{
  select: {
    id: true
    accountId: true
    email: true
    hashedRefreshToken: true
  }
}>
