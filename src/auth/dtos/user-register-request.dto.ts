import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';

import { UserRole } from '@shared/enums/user-role.enum';

export class NewUserRequestDTO {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(1)
  firstName: string;

  @IsString()
  @MinLength(1)
  lastName: string;

  @IsEnum(UserRole)
  role: UserRole;
}