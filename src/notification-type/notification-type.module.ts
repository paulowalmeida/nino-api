import { Module } from '@nestjs/common'

import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { NotificationTypeController } from './notification-type.controller'
import { NotificationTypeRepository } from './notification-type.repository'
import { NotificationTypeService } from './notification-type.service'

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
