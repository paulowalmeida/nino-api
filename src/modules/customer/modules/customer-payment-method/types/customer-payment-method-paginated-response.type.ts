import { PaginatedResponse } from '@shared/types/paginated-response.type'

import { CustomerPaymentMethodResponse } from './customer-payment-method-response.type'

export type CustomerPaymentMethodPaginatedResponse =
  PaginatedResponse<CustomerPaymentMethodResponse>
