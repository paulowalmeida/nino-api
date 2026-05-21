import { IsNotEmpty, IsUUID } from 'class-validator'

export class CreateTenantPaymentMethodDto {
  @IsUUID()
  @IsNotEmpty()
  methodId: string
}
