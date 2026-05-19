import { Customer, User } from '@prisma/client'

export type CustomerResponse = Omit<Customer, 'deletedAt' | 'userId'> & {
  user: Pick<User, 'name' | 'phone'>
}
