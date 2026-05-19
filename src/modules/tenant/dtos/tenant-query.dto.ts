import { IsEnum, IsOptional, IsUUID } from 'class-validator'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { TenantOrderBy } from '@tenant/types/tenant-order-by.type'

export class TenantQueryDto extends PaginatedQueryDto {
  @IsOptional()
  @IsEnum(TenantOrderBy)
  orderBy?: TenantOrderBy = TenantOrderBy.CREATED_AT

  @IsOptional()
  @IsUUID()
  companyId?: string
}
