import { Prisma } from '@prisma/client'

export type AuthCredentialRefreshToken = Prisma.AuthCredentialGetPayload<{
  select: {
    id: true
    userId: true
    email: true
    hashedRefreshToken: true
  }
}>
