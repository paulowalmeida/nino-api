import { Module } from '@nestjs/common'

import { PrismaService } from '@shared/services/prisma/prisma.service'
import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { SubscriptionStatusService } from './subscription-status.service'
import { SubscriptionStatusRepository } from './subscription-status.repository'
import { SubscriptionStatusController } from './subscription-status.controller'

@Module({
  controllers: [SubscriptionStatusController],
  providers: [
    SubscriptionStatusService,
    SubscriptionStatusRepository,
    PrismaService,
    PrismaErrorService,
  ],
  exports: [SubscriptionStatusService],
})
export class SubscriptionStatusModule {}
