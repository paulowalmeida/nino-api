import { IsNotEmpty, IsUUID } from 'class-validator'

export class CancelSubscriptionDto {
  @IsUUID()
  @IsNotEmpty()
  subscriptionStatusId: string
}
