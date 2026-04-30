import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { Repository } from 'typeorm'

import { ErrorService } from '@shared/services/error/error.service'
import { CreateNotificationTypeDto } from './dtos/create-notification-type.dto'
import { UpdateNotificationTypeDto } from './dtos/update-notification-type.dto'
import { NotificationType } from './entities/notification-type.entity'

@Injectable()
export class NotificationTypeRepository {
  constructor(
    @InjectRepository(NotificationType)
    private readonly repository: Repository<NotificationType>,
    private readonly errorService: ErrorService,
  ) {}

  async getAll(): Promise<NotificationType[]> {
    try {
      return await this.repository.find({ order: { name: 'ASC' } })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getById(id: string): Promise<NotificationType> {
    try {
      const found = await this.repository.findOneBy({ id })
      if (!found) throw new NotFoundException('Notification Type not found')
      return found
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async create(data: CreateNotificationTypeDto): Promise<NotificationType> {
    try {
      const exists = await this.repository.findOneBy({ name: data.name })
      if (exists) throw new ConflictException('Name already exists')

      const notificationType = this.repository.create(data)
      return await this.repository.save(notificationType)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async update(
    id: string,
    data: UpdateNotificationTypeDto,
  ): Promise<NotificationType> {
    try {
      const notificationType = await this.getById(id)

      if (data.name && data.name !== notificationType.name) {
        const exists = await this.repository.findOneBy({ name: data.name })
        if (exists) throw new ConflictException('Name already exists')
      }

      Object.assign(notificationType, data)
      return await this.repository.save(notificationType)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      await this.getById(id)
      await this.repository.softDelete(id)
      return { message: 'Notification Type deleted successfully' }
    } catch (error) {
      this.errorService.handle(error)
    }
  }
}
