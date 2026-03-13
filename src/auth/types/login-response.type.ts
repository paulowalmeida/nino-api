import { TokensLoginResponse } from '@auth/types/user/tokens-login-response.type';
import { UserLoginResponse } from '@auth/types/user/user-login-response.type';

export type LoginResponse = {
  user: UserLoginResponse
  tokens: TokensLoginResponse
}
