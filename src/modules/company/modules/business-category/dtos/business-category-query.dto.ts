import { IsEnum, IsOptional } from 'class-validator'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { BusinessCategoryOrderBy } from '@business-category/enums/business-category-order-by.type'

export class BusinessCategoryQueryDto extends PaginatedQueryDto {
  @IsOptional()
  @IsEnum(BusinessCategoryOrderBy)
  orderBy?: BusinessCategoryOrderBy = BusinessCategoryOrderBy.NAME
}
