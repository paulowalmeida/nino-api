import { Injectable } from '@nestjs/common'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { PaginatedResponse } from '@shared/types/paginated-response.type'
import { PaginationMeta } from '@shared/types/pagination-meta.type'

@Injectable()
export class PaginationService {
  getOptions(query: PaginatedQueryDto): { skip: number; take: number } {
    const { page = 1, limit = 20 } = query
    return { skip: (page - 1) * limit, take: limit }
  }

  build(total: number, query: PaginatedQueryDto): PaginationMeta {
    const { page = 1, limit = 20 } = query
    const totalPages = Math.ceil(total / limit)
    return {
      page,
      limit,
      total,
      totalPages,
      previousPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
    }
  }

  paginate<T>(data: T[], total: number, query: PaginatedQueryDto): PaginatedResponse<T> {
    return { data, pagination: this.build(total, query) }
  }
}
