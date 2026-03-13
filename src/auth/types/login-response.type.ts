import { Tokens } from '@auth/types/tokens.type'
import { UserLoginResponse } from '@auth/types/user/user-login-response.type'

export type LoginResponse = {
  user: UserLoginResponse
  tokens: Tokens
}