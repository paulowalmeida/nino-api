import { TenantRole, UserTenant } from '@prisma/client'
import { UserResponse } from '@user/types/user-response.type'

export type UserTenantResponse = Omit<UserTenant, 'userId' | 'tenantRoleId'> & {
  tenantRole: TenantRole
  user: UserResponse
}
