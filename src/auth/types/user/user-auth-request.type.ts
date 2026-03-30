import { Request } from 'express'

import { UserTokenData } from './user-token.data.type'

export interface AuthRequest extends Request {
  user: UserTokenData
}
