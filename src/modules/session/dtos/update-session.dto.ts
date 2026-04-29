import { IsDateString, IsOptional, IsString } from 'class-validator'

export class UpdateSessionDto {
  @IsOptional()
  @IsString()
  refreshToken?: string

  @IsOptional()
  @IsDateString()
  expiresAt?: Date | string
}
