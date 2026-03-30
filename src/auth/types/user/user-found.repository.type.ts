import { PersonalData, User, UserRole } from '@prisma/client'

export type UserFoundRepository = Omit<
  User,
  'hashedRefreshToken' | 'personalDataId' | 'roleId'
> & {
  personalData: Omit<PersonalData, 'id'>
  role: Omit<UserRole, 'id'>
}
