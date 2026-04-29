import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator'

export class CreateSessionDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string

  @IsString()
  @IsNotEmpty()
  refreshToken: string

  @IsOptional()
  @IsString()
  userAgent?: string

  @IsOptional()
  @IsString()
  ipAddress?: string

  @IsDateString()
  @IsNotEmpty()
  expiresAt: Date | string
}
