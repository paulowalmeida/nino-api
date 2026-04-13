import { Tokens } from '@auth/types/tokens.type'
import { Account } from '@account/types/account.type'

export type LoginResponse = {
  account: Account
  tokens: Tokens
}
