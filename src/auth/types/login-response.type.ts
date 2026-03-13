import { User } from '@auth/types/user/user.type';

export type LoginResponse = {
  user: Omit<User, 'hashedRefreshToken'>
  accessToken: string;
  refreshToken: string;
}
