import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator'

export class CreateOpeningHoursDto {
  @IsOptional()
  @IsUUID()
  tenantId?: string

  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number

  @IsString()
  @IsNotEmpty()
  openTime: string

  @IsString()
  @IsNotEmpty()
  closeTime: string

  @IsBoolean()
  @IsOptional()
  isOpen?: boolean
}
