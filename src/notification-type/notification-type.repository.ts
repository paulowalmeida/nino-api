import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { NotificationType } from './types/notification-type.type'
import { CreateNotificationTypeDto } from './dtos/create-notification-type.dto'
import { UpdateNotificationTypeDto } from './dtos/update-notification-type.dto'

@Injectable()
export class NotificationTypeRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaErrorService: PrismaErrorService,
  ) {}

  async getAll(): Promise<NotificationType[]> {
    try {
      return await this.prisma.notificationType.findMany({
        orderBy: { name: 'asc' },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async getById(id: string): Promise<NotificationType> {
    try {
      const found = await this.prisma.notificationType.findUnique({
        where: { id },
      })

      if (!found) throw new NotFoundException('Notification Type not found')

      return found
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async create(data: CreateNotificationTypeDto): Promise<NotificationType> {
    try {
      const existsByName = await this.prisma.notificationType.findUnique({
        where: { name: data.name },
      })
      if (existsByName) throw new ConflictException('Name already exists')

      return await this.prisma.notificationType.create({ data })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async update(id: string, data: UpdateNotificationTypeDto): Promise<NotificationType> {
    try {
      if (data.name) {
        const found = await this.prisma.notificationType.findUnique({
          where: { name: data.name },
        })

        if (found && found.id !== id) {
          throw new ConflictException('Name already exists')
        }
      }

      return await this.prisma.notificationType.update({
        where: { id },
        data,
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      await this.prisma.notificationType.delete({ where: { id } })
      return { message: 'Notification Type deleted successfully' }
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }
}
