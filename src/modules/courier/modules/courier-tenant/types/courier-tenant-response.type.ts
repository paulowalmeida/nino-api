import { CourierTenant, Tenant } from '@prisma/client'

import { UserResponse } from '@user/types/user-response.type'

export type CourierTenantResponse = Omit<
  CourierTenant,
  'courierId' | 'tenantId'
> & {
  courier: UserResponse
  tenant: Tenant
}
