import { Request } from 'express'

import { UserTokenData } from '@user/types/user-token.data.type'

export interface AuthRequest extends Request {
  user: UserTokenData
}
