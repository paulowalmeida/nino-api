import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { NotificationType } from '@prisma/client'

import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreateNotificationTypeDto } from './dtos/create-notification-type.dto'
import { UpdateNotificationTypeDto } from './dtos/update-notification-type.dto'

@Injectable()
export class NotificationTypeRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorService: ErrorService,
  ) {}

  async getAll(): Promise<NotificationType[]> {
    try {
      return await this.prisma.notificationType.findMany({
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
      })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getById(id: string): Promise<NotificationType> {
    try {
      const found = await this.prisma.notificationType.findFirst({
        where: { id, deletedAt: null },
      })
      if (!found) throw new NotFoundException('Notification Type not found')
      return found
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async create(data: CreateNotificationTypeDto): Promise<NotificationType> {
    try {
      const exists = await this.prisma.notificationType.findFirst({
        where: { name: data.name, deletedAt: null },
      })
      if (exists) throw new ConflictException('Name already exists')
      return await this.prisma.notificationType.create({ data })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async update(
    id: string,
    data: UpdateNotificationTypeDto,
  ): Promise<NotificationType> {
    try {
      const item = await this.getById(id)
      if (data.name && data.name !== item.name) {
        const exists = await this.prisma.notificationType.findFirst({
          where: { name: data.name, deletedAt: null },
        })
        if (exists) throw new ConflictException('Name already exists')
      }
      return await this.prisma.notificationType.update({
        where: { id },
        data,
      })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      await this.getById(id)
      await this.prisma.notificationType.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
      return { message: 'Notification Type deleted successfully' }
    } catch (error) {
      this.errorService.handle(error)
    }
  }
}
