import { IsOptional, IsPhoneNumber } from 'class-validator'

export class UpdateTenantPhoneDto {
  @IsPhoneNumber('BR')
  @IsOptional()
  phone?: string
}
