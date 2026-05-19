import { IsEnum, IsOptional } from 'class-validator'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'

import { CustomerOrderBy } from '../types/customer-order-by.type'

export class CustomerQueryDto extends PaginatedQueryDto {
  @IsEnum(CustomerOrderBy)
  @IsOptional()
  orderBy?: CustomerOrderBy
}
