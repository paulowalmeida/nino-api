import { Module } from '@nestjs/common'

import { CommonModule } from '@shared/modules/common/common.module'

import { NotificationTypeController } from './notification-type.controller'

@Module({
  imports: [CommonModule.forFeature('notificationType', 'Notification Type')],
  controllers: [NotificationTypeController],
})
export class NotificationTypeModule {}
