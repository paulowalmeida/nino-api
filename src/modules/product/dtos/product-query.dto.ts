import { Transform } from 'class-transformer'
import { IsBoolean, IsEnum, IsOptional, IsUUID } from 'class-validator'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'

import { ProductOrderBy } from '../types/product-order-by.type'

export class ProductQueryDto extends PaginatedQueryDto {
  @IsOptional()
  @IsEnum(ProductOrderBy)
  declare target?: ProductOrderBy

  @IsOptional()
  @IsUUID()
  categoryId?: string

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean
}
