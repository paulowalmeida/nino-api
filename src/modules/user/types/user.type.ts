import { Role } from '@role/entities/role.entity'
import { User } from '@user/entities/user.entity'

export type CredentialInfo = {
  id: string
  userId: string
  email: string
  provider: string
  providerId: string | null
  createdAt: Date
  updatedAt: Date
}

export type UserResponse = User & {
  role: Role
  credentials: CredentialInfo[]
}
