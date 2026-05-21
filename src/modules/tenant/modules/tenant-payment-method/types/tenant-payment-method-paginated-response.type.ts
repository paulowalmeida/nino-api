import { PaginatedResponse } from '@shared/types/paginated-response.type'

import { TenantPaymentMethodResponse } from './tenant-payment-method-response.type'

export type TenantPaymentMethodPaginatedResponse =
  PaginatedResponse<TenantPaymentMethodResponse>
