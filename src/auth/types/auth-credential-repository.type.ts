import { Prisma } from '@prisma/client'

export type AuthCredentialRepository = Prisma.AuthCredentialGetPayload<{
  select: {
    id: true
    accountId: true
    email: true
    password: true
    hashedRefreshToken: true
    provider: true
    providerId: true
  }
}>