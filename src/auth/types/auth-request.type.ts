import { Request } from '@nestjs/common'

import { UserTokenData } from './user/user-token.data.type'

export interface AuthRequest extends Request {
  user: UserTokenData
}
