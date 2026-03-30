import { PersonalData, User, UserRole } from '@prisma/client'

export type UserRefreshTokenRespository = Pick<
  User,
  'id' | 'hashedRefreshToken'
> & {
  personalData: Pick<PersonalData, 'email'>
  role: Pick<UserRole, 'code'>
}
