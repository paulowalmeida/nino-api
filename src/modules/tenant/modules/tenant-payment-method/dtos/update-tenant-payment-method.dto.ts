import { IsBoolean, IsNotEmpty } from 'class-validator'

export class UpdateTenantPaymentMethodDto {
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean
}
