import { Tokens } from '@auth/types/tokens.type'
import { Account } from '@auth/types/account/account.type'

export type LoginResponse = {
  account: Account
  tokens: Tokens
}
