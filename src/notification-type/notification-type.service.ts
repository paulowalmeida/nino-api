import { Injectable } from '@nestjs/common'

import { NotificationType } from '@notification-type/types/notification-type.type'
import { NotificationTypeRepository } from './notification-type.repository'

@Injectable()
export class NotificationTypeService {
  constructor(
    private readonly notificationTypeRepository: NotificationTypeRepository,
  ) {}

  async getAll(): Promise<NotificationType[]> {
    return await this.notificationTypeRepository.findAll()
  }

  async getById(id: number): Promise<NotificationType> {
    return await this.notificationTypeRepository.findById(id)
  }

  async getByCode(code: number): Promise<NotificationType> {
    return await this.notificationTypeRepository.findByCode(code)
  }
}
