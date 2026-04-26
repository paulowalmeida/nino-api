import { IsEmail, IsOptional, IsString } from 'class-validator'

export class UpdateCredentialDto {
  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  password?: string
}
