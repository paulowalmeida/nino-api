import { PaginatedResponse } from '@shared/types/paginated-response.type'

import { SubscriptionResponse } from './subscription-response.type'

export type SubscriptionPaginatedResponse =
  PaginatedResponse<SubscriptionResponse>
