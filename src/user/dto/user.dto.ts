import { IsCnpj } from '@shared/validators/cnpj.validator'
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator'

export class UserDTO {
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string

  @IsString()
  @MinLength(8)
  @IsNotEmpty({ message: 'Password is required' })
  password: string

  @IsInt()
  @IsNotEmpty({ message: 'Role ID is required' })
  roleId: number

  @IsString()
  @IsNotEmpty({ message: 'Company Name is required' })
  companyName: string

  @IsString()
  @IsNotEmpty({ message: 'CNPJ is required' })
  @IsCnpj()
  cnpj: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true

  @IsOptional()
  @IsString()
  locale?: string = 'pt-br'

  @IsOptional()
  @IsString()
  timezone?: string = 'America/Sao_Paulo'
}
