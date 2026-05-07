import { PaginatedResponse } from '@shared/types/paginated-response.type'
import { Company } from '@prisma/client'

export type CompanyPaginatedResponse = PaginatedResponse<Company>
