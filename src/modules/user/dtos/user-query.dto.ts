import { IsEnum, IsOptional } from 'class-validator'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { UserOrderBy } from '../types/user-order-by.type'

export class UserQueryDto extends PaginatedQueryDto {
  @IsOptional()
  @IsEnum(UserOrderBy)
  orderBy?: UserOrderBy = UserOrderBy.NAME
}
