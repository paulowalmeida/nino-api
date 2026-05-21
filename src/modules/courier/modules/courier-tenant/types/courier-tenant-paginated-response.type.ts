import { PaginatedResponse } from '@shared/types/paginated-response.type'

import { CourierTenantResponse } from './courier-tenant-response.type'

export type CourierTenantPaginatedResponse =
  PaginatedResponse<CourierTenantResponse>
