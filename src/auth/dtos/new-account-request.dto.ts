import {
  IsEmail,
  IsEnum,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'

import { Role } from '@shared/enums/role.enum'

export class NewAccountRequestDTO {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(8)
  @MaxLength(16)
  password: string

  @IsEnum(Role)
  role: Role
}
