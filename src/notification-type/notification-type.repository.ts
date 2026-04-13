import { Injectable, NotFoundException } from '@nestjs/common'

import { NotificationType } from '@notification-type/types/notification-type.type'
import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

@Injectable()
export class NotificationTypeRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaErrorService: PrismaErrorService,
  ) {}

  async findAll(): Promise<NotificationType[]> {
    try {
      return await this.prisma.notificationType.findMany()
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async findById(id: string): Promise<NotificationType> {
    try {
      const type = await this.prisma.notificationType.findUnique({
        where: { id },
      })

      if (!type) throw new NotFoundException('Notification Type not found')

      return type
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async findByCode(code: number): Promise<NotificationType> {
    try {
      const type = await this.prisma.notificationType.findUnique({
        where: { code },
      })

      if (!type) throw new NotFoundException('Notification Type not found')

      return type
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }
}
