import { PaginatedResponse } from '@shared/types/paginated-response.type'

import { ProductResponse } from './product-response.type'

export type ProductPaginatedResponse = PaginatedResponse<ProductResponse>
