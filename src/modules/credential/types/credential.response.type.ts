import { Credential } from '@credential/entities/credential.entity'

export type CredentialResponse = Omit<Credential, 'userId' | 'password'>
