import { IsBoolean, IsInt, IsNumber, IsOptional, Min } from 'class-validator'

export class UpsertTenantSettingsDto {
  @IsBoolean()
  @IsOptional()
  requireAccount?: boolean

  @IsBoolean()
  @IsOptional()
  requireCpf?: boolean

  @IsBoolean()
  @IsOptional()
  allowGuestOrder?: boolean

  @IsNumber()
  @Min(0)
  @IsOptional()
  deliveryFee?: number

  @IsNumber()
  @Min(0)
  @IsOptional()
  minOrderAmount?: number

  @IsInt()
  @Min(0)
  @IsOptional()
  deliveryRadius?: number

  @IsBoolean()
  @IsOptional()
  isDeliveryEnabled?: boolean

  @IsBoolean()
  @IsOptional()
  isPickupEnabled?: boolean

  @IsBoolean()
  @IsOptional()
  loyaltyEnabled?: boolean

  @IsInt()
  @Min(0)
  @IsOptional()
  loyaltyPointsPerOrder?: number

  @IsNumber()
  @Min(0)
  @IsOptional()
  loyaltyPointValue?: number

  @IsBoolean()
  @IsOptional()
  allowSharedStaff?: boolean
}
