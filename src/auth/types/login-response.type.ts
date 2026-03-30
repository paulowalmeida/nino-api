import { Tokens } from '@auth/types/tokens.type'
import { UserFound } from './user/user-found.type'

export type LoginResponse = {
  user: UserFound
  tokens: Tokens
}
