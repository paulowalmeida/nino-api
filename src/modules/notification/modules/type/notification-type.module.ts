import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'
import { NotificationTypeController } from './notification-type.controller'
import { NotificationTypeRepository } from './notification-type.repository'
import { NotificationTypeService } from './notification-type.service'

@Module({
  controllers: [NotificationTypeController],
  providers: [
    NotificationTypeService,
    NotificationTypeRepository,
    ErrorService,
  ],
  exports: [NotificationTypeService],
})
export class NotificationTypeModule {}
