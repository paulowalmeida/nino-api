import { IsNotEmpty, IsOptional, IsPhoneNumber, IsUUID } from 'class-validator'

export class CreateTenantPhoneDto {
  @IsOptional()
  @IsUUID()
  tenantId?: string

  @IsPhoneNumber('BR')
  @IsNotEmpty()
  phone: string
}
