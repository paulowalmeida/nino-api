import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'

export class LoginRequestDto {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(8)
  @MaxLength(16)
  password: string
}
