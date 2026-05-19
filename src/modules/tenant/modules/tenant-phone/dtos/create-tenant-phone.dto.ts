import { IsNotEmpty, IsPhoneNumber, IsUUID } from 'class-validator'

export class CreateTenantPhoneDto {
  @IsUUID()
  @IsNotEmpty()
  tenantId: string

  @IsPhoneNumber('BR')
  @IsNotEmpty()
  phone: string
}
