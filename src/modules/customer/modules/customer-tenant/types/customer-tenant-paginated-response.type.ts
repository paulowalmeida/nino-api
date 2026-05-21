import { CustomerTenant } from '@prisma/client'

import { PaginatedResponse } from '@shared/types/paginated-response.type'

export type CustomerTenantPaginatedResponse = PaginatedResponse<CustomerTenant>
