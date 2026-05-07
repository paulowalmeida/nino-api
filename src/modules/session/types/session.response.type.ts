import { Session } from '@prisma/client'

import { UserResponse } from '@user/types/user-response.type'

export type SessionResponse = Omit<Session, 'userId' | 'refreshToken'> & {
  user: UserResponse
}
