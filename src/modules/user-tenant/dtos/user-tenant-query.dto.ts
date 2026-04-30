import { IsEnum, IsOptional } from 'class-validator'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { UserTenantOrderBy } from '../types/user-tenant-order-by.type'

export class UserTenantQueryDto extends PaginatedQueryDto {
  @IsOptional()
  @IsEnum(UserTenantOrderBy)
  orderBy?: UserTenantOrderBy = UserTenantOrderBy.CREATED_AT
}
