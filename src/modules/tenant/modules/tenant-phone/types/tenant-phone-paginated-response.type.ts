import { TenantPhone } from '@prisma/client'

import { PaginatedResponse } from '@shared/types/paginated-response.type'

export type TenantPhonePaginatedResponse = PaginatedResponse<TenantPhone>
