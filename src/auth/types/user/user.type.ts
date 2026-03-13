import { AuthRepository } from '@auth/auth.repository';

type UserReturn = Awaited<ReturnType<typeof AuthRepository.prototype.registerNewUser>>

export type User = Omit<UserReturn, 'roleId' | 'personalDataId'> & {
  personalData: Omit<UserReturn['personalData'], 'id' | 'password'> | undefined
  role: Omit<UserReturn['role'], 'id'>
}