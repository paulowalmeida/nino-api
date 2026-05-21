import { Module } from '@nestjs/common'

import { CommonModule } from '@shared/modules/common/common.module'

import { SubscriptionStatusController } from './subscription-status.controller'

@Module({
  imports: [
    CommonModule.forFeature('subscriptionStatus', 'Subscription Status'),
  ],
  controllers: [SubscriptionStatusController],
})
export class SubscriptionStatusModule {}
