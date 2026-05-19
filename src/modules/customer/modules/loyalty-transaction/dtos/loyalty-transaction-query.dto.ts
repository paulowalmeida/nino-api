import { IsEnum, IsOptional, IsUUID } from 'class-validator'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { LoyaltyTransactionType } from '@shared/enums/loyalty-transaction-type.enum'

export class LoyaltyTransactionQueryDto extends PaginatedQueryDto {
  @IsUUID()
  @IsOptional()
  tenantId?: string

  @IsEnum(LoyaltyTransactionType)
  @IsOptional()
  type?: LoyaltyTransactionType
}
