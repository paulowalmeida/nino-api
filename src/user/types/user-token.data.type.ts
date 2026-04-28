export type UserTokenData = {
  sub: string;
  role: string;
  hashedRefreshToken?: string;
};