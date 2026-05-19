import { LoyaltyTransaction } from '@prisma/client'

import { PaginatedResponse } from '@shared/types/paginated-response.type'

export type LoyaltyTransactionPaginatedResponse =
  PaginatedResponse<LoyaltyTransaction>
