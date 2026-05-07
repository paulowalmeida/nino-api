import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator'

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  slug: string

  @IsUUID()
  @IsNotEmpty()
  typeId: string

  @IsNumber()
  @IsNotEmpty()
  price: number

  @IsInt()
  @Min(1)
  maxTenants: number

  @IsInt()
  @Min(1)
  maxProducts: number

  @IsInt()
  @Min(1)
  maxOrders: number

  @IsBoolean()
  @IsOptional()
  hasPrioritySupport?: boolean

  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
