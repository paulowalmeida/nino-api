import { Prisma } from '@prisma/client'

export type Credential = Prisma.AuthCredentialGetPayload<{
  omit: { password: true }
}>
