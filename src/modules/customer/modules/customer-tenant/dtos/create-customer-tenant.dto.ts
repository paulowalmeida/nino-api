import { IsUUID } from 'class-validator'

export class CreateCustomerTenantDto {
  @IsUUID()
  tenantId: string
}
