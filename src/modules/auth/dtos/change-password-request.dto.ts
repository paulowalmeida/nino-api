import { IsString, MaxLength, MinLength } from 'class-validator'

export class ChangePasswordRequestDTO {
  @IsString()
  @MinLength(8)
  @MaxLength(16)
  oldPassword: string

  @IsString()
  @MinLength(8)
  @MaxLength(16)
  newPassword: string
}
