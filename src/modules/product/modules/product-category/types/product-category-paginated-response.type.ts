import { ProductCategory } from '@prisma/client'

import { PaginatedResponse } from '@shared/types/paginated-response.type'

export type ProductCategoryPaginatedResponse =
  PaginatedResponse<ProductCategory>
