import { IsOptional, IsString } from 'class-validator'

export class UpdatePreferencesDTO {
  @IsOptional()
  @IsString()
  locale?: string

  @IsOptional()
  @IsString()
  timezone?: string
}
