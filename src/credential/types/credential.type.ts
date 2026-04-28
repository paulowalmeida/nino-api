import { AuthCredential } from '@credential/entities/auth-credential.entity'

export type Credential = Omit<AuthCredential, 'password'>
