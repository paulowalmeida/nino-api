import { AuthCredential } from '@credential/entities/auth-credential.entity'

export type AuthCredentialRefreshToken = Pick<AuthCredential, 'id' | 'userId' | 'email'>
