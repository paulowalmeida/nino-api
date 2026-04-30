import { PaginatedResponse } from '@shared/types/paginated-response.type'
import { Company } from '../entities/company.entity'

export type CompanyPaginatedResponse = PaginatedResponse<Company>
