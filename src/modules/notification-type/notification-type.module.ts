import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ErrorService } from '@shared/services/error/error.service'
import { NotificationType } from './entities/notification-type.entity'
import { NotificationTypeController } from './notification-type.controller'
import { NotificationTypeRepository } from './notification-type.repository'
import { NotificationTypeService } from './notification-type.service'

@Module({
  imports: [TypeOrmModule.forFeature([NotificationType])],
  controllers: [NotificationTypeController],
  providers: [
    NotificationTypeService,
    NotificationTypeRepository,
    ErrorService,
  ],
  exports: [NotificationTypeService],
})
export class NotificationTypeModule {}
