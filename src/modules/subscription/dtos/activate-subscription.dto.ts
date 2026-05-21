import { IsNotEmpty, IsUUID } from 'class-validator'

export class ActivateSubscriptionDto {
  @IsUUID()
  @IsNotEmpty()
  subscriptionStatusId: string
}
