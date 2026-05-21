import { PaginatedResponse } from '@shared/types/paginated-response.type'

import { CustomerTenantResponse } from './customer-tenant-response.type'

export type CustomerTenantPaginatedResponse =
  PaginatedResponse<CustomerTenantResponse>
