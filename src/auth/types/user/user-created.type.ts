import { User } from '@auth/types/user/user.type'

export type UserCreated =
  Pick<User, 'id'> & {
    personalData: Pick<User['personalData'], 'email' | 'firstName' | 'lastName'> | undefined,
    role: Pick<User['role'], 'code' | 'description'>
  }