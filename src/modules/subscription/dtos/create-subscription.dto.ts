import { IsNotEmpty, IsUUID } from 'class-validator'

export class CreateSubscriptionDto {
  @IsUUID()
  @IsNotEmpty()
  companyId: string

  @IsUUID()
  @IsNotEmpty()
  planId: string

  @IsUUID()
  @IsNotEmpty()
  subscriptionStatusId: string
}
