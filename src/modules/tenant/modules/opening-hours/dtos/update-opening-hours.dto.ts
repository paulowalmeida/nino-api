import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class UpdateOpeningHoursDto {
  @IsString()
  @IsOptional()
  openTime?: string

  @IsString()
  @IsOptional()
  closeTime?: string

  @IsBoolean()
  @IsOptional()
  isOpen?: boolean
}
