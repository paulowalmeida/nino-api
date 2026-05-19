import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator'

export class CreateCustomerPaymentMethodDto {
  @IsUUID()
  @IsNotEmpty()
  methodId: string

  @IsString()
  @IsNotEmpty()
  gatewayToken: string

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
