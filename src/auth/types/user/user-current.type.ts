import { UserTokenData } from './user-token.data.type'

export type UserCurrent = UserTokenData & {
  iat: number
  exp: number
}
