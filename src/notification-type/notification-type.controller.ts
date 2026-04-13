import { Controller, Get, Param, UseGuards } from '@nestjs/common'

import { NotificationType } from '@notification-type/types/notification-type.type'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { NotificationTypeService } from './notification-type.service'

@Controller('notification-types')
export class NotificationTypeController {
  constructor(
    private readonly notificationTypeService: NotificationTypeService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAll(): Promise<NotificationType[]> {
    return await this.notificationTypeService.getAll()
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById(@Param('id') id: number): Promise<NotificationType> {
    return await this.notificationTypeService.getById(id)
  }

  @Get('code/:code')
  @UseGuards(JwtAuthGuard)
  async getByCode(@Param('code') code: string): Promise<NotificationType> {
    return await this.notificationTypeService.getByCode(Number(code))
  }
}
