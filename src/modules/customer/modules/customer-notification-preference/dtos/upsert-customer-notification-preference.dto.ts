import { IsBoolean, IsOptional } from 'class-validator'

export class UpsertCustomerNotificationPreferenceDto {
  @IsBoolean()
  @IsOptional()
  emailEnabled?: boolean

  @IsBoolean()
  @IsOptional()
  pushEnabled?: boolean

  @IsBoolean()
  @IsOptional()
  smsEnabled?: boolean
}
