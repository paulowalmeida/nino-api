import { ApiProperty } from '@nestjs/swagger'

import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'

export class LoginRequestDTO {
  @ApiProperty({ example: 'paulo@ninomia.com' })
  @IsEmail()
  email: string

  @ApiProperty({ example: 'Senha1234*' })
  @IsString()
  @MinLength(8)
  @MaxLength(16)
  password: string
}
