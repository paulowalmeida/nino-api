import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateTenantTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsOptional()
  description?: string
}
