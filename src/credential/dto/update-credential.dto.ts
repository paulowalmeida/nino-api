import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class UpdateCredentialDTO {
  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(16)
  password?: string
}
