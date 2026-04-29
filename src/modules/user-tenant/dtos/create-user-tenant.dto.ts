import { IsUUID } from 'class-validator'

export class CreateUserTenantDto {
  @IsUUID()
  userId: string

  @IsUUID()
  tenantId: string
}
