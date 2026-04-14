import { IsOptional, IsString } from 'class-validator'

export class UserUpdatePreferencesDTO {
  @IsOptional()
  @IsString()
  locale?: string

  @IsOptional()
  @IsString()
  timezone?: string
}
