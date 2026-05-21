import { IsOptional, IsUUID } from 'class-validator'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'

export class TenantQueryDto extends PaginatedQueryDto {
  @IsOptional()
  @IsUUID()
  companyId?: string
}
