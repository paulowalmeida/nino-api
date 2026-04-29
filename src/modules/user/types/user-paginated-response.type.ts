import { PaginatedResponse } from '@shared/types/paginated-response.type'

import { UserResponse } from './user-response.type'

export type UserPaginatedResponse = PaginatedResponse<UserResponse>
