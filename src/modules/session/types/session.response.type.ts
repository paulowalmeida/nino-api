import { Session } from '@session/entities/session.entity'
import { UserResponse } from '@user/types/user.type'

export type SessionResponse = Omit<
  Session,
  'userId' | 'refreshToken' | 'user'
> & {
  user: UserResponse
}
