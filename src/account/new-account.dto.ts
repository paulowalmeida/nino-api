import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength
} from 'class-validator'


export class NewAccountDTO {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(8)
  @MaxLength(16)
  password: string

  @IsInt()
  roleId: number

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsString()
  locale?: string

  @IsOptional()
  @IsString()
  timezone?: string
}
