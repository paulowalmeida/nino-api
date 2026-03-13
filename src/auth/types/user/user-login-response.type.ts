import { User } from '@auth/types/user/user.type';

export type UserLoginResponse =
  Omit<
    User, 'hashedRefreshToken' |
    User['personalData']['password'] |
    User['personalData']['id'] |
    User['role']['id']
  >

