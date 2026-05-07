import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'
import { SubscriptionStatusController } from './subscription-status.controller'
import { SubscriptionStatusRepository } from './subscription-status.repository'
import { SubscriptionStatusService } from './subscription-status.service'

@Module({
  controllers: [SubscriptionStatusController],
  providers: [
    SubscriptionStatusService,
    SubscriptionStatusRepository,
    ErrorService,
  ],
  exports: [SubscriptionStatusService],
})
export class SubscriptionStatusModule {}
