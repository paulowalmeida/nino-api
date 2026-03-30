import { PersonalData, User, UserRole } from '@prisma/client'

export type UserCreated = Omit<
  User,
  'hashedRefreshToken' | 'personalDataId' | 'roleId'
> & {
  personalData: Omit<
    PersonalData,
    'id' | 'password' | 'birthDate' | 'avatarUrl'
  >
  role: Omit<UserRole, 'id'>
}
