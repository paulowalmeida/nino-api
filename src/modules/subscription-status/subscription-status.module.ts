import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { SubscriptionStatus } from '@subscription-status/entities/subscription-status.entity'
import { ErrorService } from '@shared/services/error/error.service'
import { SubscriptionStatusController } from './subscription-status.controller'
import { SubscriptionStatusRepository } from './subscription-status.repository'
import { SubscriptionStatusService } from './subscription-status.service'

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionStatus])],
  controllers: [SubscriptionStatusController],
  providers: [SubscriptionStatusService, SubscriptionStatusRepository, ErrorService],
  exports: [SubscriptionStatusService],
})
export class SubscriptionStatusModule {}
