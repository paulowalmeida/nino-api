import { Tokens } from '@auth/types/tokens.type'
import { User } from '@user/entities/user.entity'

export type LoginResponse = {
  user: User
}
