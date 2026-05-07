import { BusinessCategory } from '@prisma/client'

import { PaginatedResponse } from '@shared/types/paginated-response.type'

export type BusinessCategoryPaginatedResponse =
  PaginatedResponse<BusinessCategory>
