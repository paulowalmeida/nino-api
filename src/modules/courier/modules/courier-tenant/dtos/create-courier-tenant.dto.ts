import { IsUUID } from 'class-validator'

export class CreateCourierTenantDto {
  @IsUUID()
  courierId: string

  @IsUUID()
  tenantId: string
}
