import { Company } from '@company/entities/company.entity'
import { CredentialInfo } from '@credential/types/credential-info.type'
import { Role } from '@role/entities/role.entity'
import { User } from '@user/entities/user.entity'

export type UserResponse = User & {
  role: Role
  company: Company | null
  credentials: CredentialInfo[]
}
