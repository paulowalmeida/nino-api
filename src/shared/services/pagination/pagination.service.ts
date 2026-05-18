import { Injectable } from '@nestjs/common'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { PaginatedResponse } from '@shared/types/paginated-response.type'
import { PaginationMeta } from '@shared/types/pagination-meta.type'

/**
 * Stateless helper used by `BaseRepository.findAllPaginated` to compute
 * Prisma's `skip`/`take` offsets and to assemble the `PaginatedResponse`
 * envelope returned to the client.
 */
@Injectable()
export class PaginationService {
  /**
   * Converts page/size into Prisma-compatible `skip` and `take` values.
   * @param query - `{ page, size }` — defaults to page 1, size 20.
   * @returns `{ skip, take }` ready to pass to `prisma.model.findMany`.
   */
  getPaginationParams(query: PaginatedQueryDto): {
    skip: number
    take: number
  } {
    const { page = 1, size = 20 } = query
    return { skip: (page - 1) * size, take: size }
  }

  /**
   * Builds the pagination metadata block from a total record count.
   * @param total - Total number of records matching the query (from `prisma.model.count`).
   * @param query - `{ page, size }` used for this request.
   * @returns `PaginationMeta` with `totalPages`, `previousPage`, and `nextPage`.
   */
  build(total: number, query: PaginatedQueryDto): PaginationMeta {
    const { page = 1, size = 20 } = query
    const totalPages = Math.ceil(total / size)
    return {
      page,
      size,
      total,
      totalPages,
      previousPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
    }
  }

  /**
   * Combines data and total into the standard paginated response envelope.
   * @typeParam T - The entity or DTO type of each item in `data`.
   * @param data  - The records for the current page.
   * @param total - Total record count (used to compute metadata).
   * @param query - `{ page, size }` for this request.
   * @returns `PaginatedResponse<T>` with `data` and `pagination` fields.
   */
  paginate<T>(
    data: T[],
    total: number,
    query: PaginatedQueryDto,
  ): PaginatedResponse<T> {
    return { data, pagination: this.build(total, query) }
  }
}
