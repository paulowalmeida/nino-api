import { UserTokenData } from '@user/types/user-token.data.type'

export interface RefreshRequest {
  headers: { authorization?: string }
  [key: string]: UserTokenData | { authorization?: string } | undefined
}
