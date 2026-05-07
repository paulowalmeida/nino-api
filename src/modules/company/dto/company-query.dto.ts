import { IsEnum, IsOptional } from 'class-validator'

import { CompanyOrderBy } from '@company/enums/company-order-by.type'
import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'

export class CompanyQueryDto extends PaginatedQueryDto {
  @IsOptional()
  @IsEnum(CompanyOrderBy)
  orderBy?: CompanyOrderBy = CompanyOrderBy.COMPANY_NAME
}
