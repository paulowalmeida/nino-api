import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator'

import { GlobalRole } from '@shared/enums/global-role.enum'

export class RegisterRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string

  @IsEnum(GlobalRole)
  globalRole: GlobalRole
}
