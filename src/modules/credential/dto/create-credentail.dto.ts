import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator'

export class CreateCredentialDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  password?: string

  @IsOptional()
  @IsString()
  provider?: string

  @IsOptional()
  @IsString()
  providerId?: string
}
