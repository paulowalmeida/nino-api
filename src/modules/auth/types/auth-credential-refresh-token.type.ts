import { Credential } from '@prisma/client'

export type AuthCredentialRefreshToken = Pick<
  Credential,
  'id' | 'userId' | 'email'
>
