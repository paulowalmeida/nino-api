import { Request } from 'express'

import { AccountTokenData } from 'src/account/types/account-token.data.type'

export interface AuthRequest extends Request {
  account: AccountTokenData
}
