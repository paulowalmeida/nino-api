import { OpeningHours } from '@prisma/client'

import { PaginatedResponse } from '@shared/types/paginated-response.type'

export type OpeningHoursPaginatedResponse = PaginatedResponse<OpeningHours>
