import { Credential } from '@credential/entities/credential.entity'

export type AuthCredentialRefreshToken = Pick<Credential, 'id' | 'userId' | 'email'>
