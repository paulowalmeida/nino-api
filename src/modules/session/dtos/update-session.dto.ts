import { IsDateString, IsOptional, IsString } from 'class-validator'

export class UpdateSessionDto {
  @IsOptional()
  @IsString()
  refreshToken?: string

  @IsOptional()
  @IsString()
  ipAddress?: string

  @IsOptional()
  @IsString()
  userAgent?: string

  @IsOptional()
  @IsDateString()
  expiresAt?: Date | string
}
