import { UserResponse } from '@user/types/user-response.type'
import { Tokens } from './tokens.type'

export type LoginResponse = {
  user: UserResponse
  tokens: Tokens
}
