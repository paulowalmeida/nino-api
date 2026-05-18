import { Injectable } from '@nestjs/common'

import { NotificationType } from '@prisma/client'

import { BaseService } from '@shared/services/base/base.service'
import { CreateNotificationTypeDto } from './dtos/create-notification-type.dto'
import { UpdateNotificationTypeDto } from './dtos/update-notification-type.dto'
import { NotificationTypeRepository } from './notification-type.repository'

@Injectable()
export class NotificationTypeService extends BaseService<
  NotificationType,
  CreateNotificationTypeDto,
  UpdateNotificationTypeDto
> {
  constructor(repo: NotificationTypeRepository) {
    super(repo)
  }
}
