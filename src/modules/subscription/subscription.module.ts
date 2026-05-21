import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'

import { SubscriptionController } from './subscription.controller'
import { SubscriptionRepository } from './subscription.repository'
import { SubscriptionService } from './subscription.service'

@Module({
  controllers: [SubscriptionController],
  providers: [
    SubscriptionService,
    SubscriptionRepository,
    ErrorService,
    PaginationService,
  ],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
