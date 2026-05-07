import { GlobalRole, User } from '@prisma/client'
import { CredentialInfo } from '@credential/types/credential-info.type'

export type UserResponse = Omit<User, 'deletedAt' | 'globalRoleId'> & {
  role: GlobalRole
  credentials: CredentialInfo[]
}
