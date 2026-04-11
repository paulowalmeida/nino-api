import { Request } from 'express'

import { AccountTokenData } from './account-token.data.type'

export interface AuthRequest extends Request {
  account: AccountTokenData
}
