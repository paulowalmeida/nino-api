import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateGlobalRoleDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsOptional()
  description?: string
}
