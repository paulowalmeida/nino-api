import { Injectable } from '@nestjs/common'

import { NotificationType, Prisma } from '@prisma/client'

import { BaseRepository } from '@shared/repositories/base/base.repository'
import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreateNotificationTypeDto } from './dtos/create-notification-type.dto'
import { UpdateNotificationTypeDto } from './dtos/update-notification-type.dto'

@Injectable()
export class NotificationTypeRepository
  extends BaseRepository<Prisma.NotificationTypeDelegate> {
  constructor(
    prisma: PrismaService,
    errorService: ErrorService,
  ) {
    super(errorService, prisma.notificationType, 'Notification Type')
  }

  async getAll(): Promise<NotificationType[]> {
    return this.findAll<NotificationType>({ orderBy: { name: 'asc' } })
  }

  async getById(id: string): Promise<NotificationType> {
    return this.findItem<NotificationType>({ where: { id } })
  }

  async create(data: CreateNotificationTypeDto): Promise<NotificationType> {
    return this.insert<CreateNotificationTypeDto, NotificationType>({ data })
  }

  async update(
    id: string,
    data: UpdateNotificationTypeDto,
  ): Promise<NotificationType> {
    return this.updateItem<UpdateNotificationTypeDto, NotificationType>({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.softDelete(id)
  }
}
