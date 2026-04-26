import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateTenantStatusDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsOptional()
  description?: string
}