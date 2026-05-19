import { PaginatedResponse } from '@shared/types/paginated-response.type'

import { CustomerResponse } from './customer-response.type'

export type CustomerPaginatedResponse = PaginatedResponse<CustomerResponse>
