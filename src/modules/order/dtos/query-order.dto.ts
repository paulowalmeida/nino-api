import { IsOptional, IsUUID } from 'class-validator'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'

export class QueryOrderDto extends PaginatedQueryDto {
  @IsUUID()
  @IsOptional()
  tenantId?: string

  @IsUUID()
  @IsOptional()
  customerId?: string
}
