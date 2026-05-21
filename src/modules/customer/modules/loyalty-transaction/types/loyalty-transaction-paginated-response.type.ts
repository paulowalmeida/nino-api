import { PaginatedResponse } from '@shared/types/paginated-response.type'

import { LoyaltyTransactionResponse } from './loyalty-transaction-response.type'

export type LoyaltyTransactionPaginatedResponse =
  PaginatedResponse<LoyaltyTransactionResponse>
