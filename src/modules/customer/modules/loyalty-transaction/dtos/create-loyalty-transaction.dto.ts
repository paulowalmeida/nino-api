import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  NotEquals,
} from 'class-validator'

import { LoyaltyTransactionType } from '@shared/enums/loyalty-transaction-type.enum'

export class CreateLoyaltyTransactionDto {
  @IsUUID()
  tenantId: string

  @IsUUID()
  @IsOptional()
  orderId?: string

  @IsEnum(LoyaltyTransactionType)
  type: LoyaltyTransactionType

  @IsInt()
  @NotEquals(0)
  points: number

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  description?: string
}
