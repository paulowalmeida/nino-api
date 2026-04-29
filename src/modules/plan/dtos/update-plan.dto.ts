import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator'

export class UpdatePlanDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  slug?: string

  @IsOptional()
  @IsString()
  typeId?: string

  @IsOptional()
  @IsNumber()
  price?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  maxTenants?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  maxProducts?: number

  @IsOptional()
  @IsInt()
  @Min(1)
  maxOrders?: number

  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
