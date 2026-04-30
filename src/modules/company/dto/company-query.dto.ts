import { IsEnum, IsOptional } from 'class-validator'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { CompanyOrderBy } from '../types/company-order-by.type'

export class CompanyQueryDto extends PaginatedQueryDto {
  @IsOptional()
  @IsEnum(CompanyOrderBy)
  orderBy?: CompanyOrderBy = CompanyOrderBy.COMPANY_NAME
}
