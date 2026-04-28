import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { NotificationType } from '@notification-type/entities/notification-type.entity'
import { ErrorService } from '@shared/services/error/error.service'
import { NotificationTypeController } from './notification-type.controller'
import { NotificationTypeRepository } from './notification-type.repository'
import { NotificationTypeService } from './notification-type.service'

@Module({
  imports: [TypeOrmModule.forFeature([NotificationType])],
  controllers: [NotificationTypeController],
  providers: [NotificationTypeService, NotificationTypeRepository, ErrorService],
  exports: [NotificationTypeService],
})
export class NotificationTypeModule {}
