import { IsEnum, IsOptional } from 'class-validator'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { SessionOrderBy } from '../types/session-order-by.type'

export class SessionQueryDto extends PaginatedQueryDto {
  @IsOptional()
  @IsEnum(SessionOrderBy)
  target: SessionOrderBy = SessionOrderBy.CREATED_AT
}
