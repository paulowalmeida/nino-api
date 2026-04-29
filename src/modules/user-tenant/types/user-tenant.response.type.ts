import { UserTenant } from '@user/entities/user-tenant.entity'
import { UserResponse } from '@user/types/user-response.type'

export type UserTenantResponse = Omit<UserTenant, 'userId' | 'user'> & {
  user: UserResponse
}
