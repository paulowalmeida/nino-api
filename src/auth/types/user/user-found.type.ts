import { PersonalData } from '@prisma/client'

import { UserFoundRepository } from './user-found.repository.type'

export type UserFound = Omit<UserFoundRepository, 'personalData'> & {
  personalData: Omit<PersonalData, 'id' | 'password'>
}
