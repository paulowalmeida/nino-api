import { Module } from '@nestjs/common'

import { PrismaService } from '@shared/services/prisma/prisma.service'
import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { NotificationTypeService } from './notification-type.service'
import { NotificationTypeRepository } from './notification-type.repository'
import { NotificationTypeController } from './notification-type.controller'

@Module({
  controllers: [NotificationTypeController],
  providers: [
    NotificationTypeService,
    NotificationTypeRepository,
    PrismaService,
    PrismaErrorService,
  ],
  exports: [NotificationTypeService],
})
export class NotificationTypeModule {}
