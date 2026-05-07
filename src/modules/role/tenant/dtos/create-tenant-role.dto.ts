import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateTenantRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsOptional()
  description?: string
}
