import { Credential } from '@prisma/client'

export type CredentialResponse = Omit<
  Credential,
  'userId' | 'password' | 'deletedAt'
>
