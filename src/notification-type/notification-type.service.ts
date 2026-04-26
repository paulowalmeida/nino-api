import { Injectable } from '@nestjs/common'

import { CreateNotificationTypeDto } from './dtos/create-notification-type.dto'
import { UpdateNotificationTypeDto } from './dtos/update-notification-type.dto'
import { NotificationTypeRepository } from './notification-type.repository'
import { NotificationType } from './types/notification-type.type'

@Injectable()
export class NotificationTypeService {
  constructor(private repo: NotificationTypeRepository) {}

  async getAll(): Promise<NotificationType[]> {
    return await this.repo.getAll()
  }

  async getById(id: string): Promise<NotificationType> {
    return await this.repo.getById(id)
  }

  async create(data: CreateNotificationTypeDto): Promise<NotificationType> {
    return this.repo.create(data)
  }

  async update(
    id: string,
    data: UpdateNotificationTypeDto,
  ): Promise<NotificationType> {
    return this.repo.update(id, data)
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.repo.delete(id)
  }
}
