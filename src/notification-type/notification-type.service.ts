import { Injectable } from '@nestjs/common'

import { NotificationTypeRepository } from './notification-type.repository'
import { NotificationType } from '@notification-type/types/notification-type.type'

@Injectable()
export class NotificationTypeService {
  constructor(
    private readonly notificationTypeRepository: NotificationTypeRepository,
  ) {}

  async getAll(): Promise<NotificationType[]> {
    return await this.notificationTypeRepository.findAll()
  }

  async getById(id: string): Promise<NotificationType> {
    return await this.notificationTypeRepository.findById(id)
  }

  async getByCode(code: number): Promise<NotificationType> {
    return await this.notificationTypeRepository.findByCode(code)
  }
}
