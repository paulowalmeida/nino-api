import { Credential } from '@credential/entities/credential.entity'

export type CredentialRepositoryType = Omit<Credential, 'password'> & {
  password: string
}
