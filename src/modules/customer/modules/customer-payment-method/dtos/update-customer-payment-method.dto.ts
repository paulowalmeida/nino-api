import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator'

export class UpdateCustomerPaymentMethodDto {
  @IsString()
  @IsOptional()
  brand?: string

  @IsString()
  @Length(4, 4)
  @IsOptional()
  lastFour?: string

  @IsDateString()
  @IsOptional()
  expiresAt?: Date

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean
}
