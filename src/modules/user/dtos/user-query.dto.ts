import { IsOptional } from 'class-validator'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'

export class UserQueryDto extends PaginatedQueryDto {
  @IsOptional()
  orderBy? = 'name'
}
