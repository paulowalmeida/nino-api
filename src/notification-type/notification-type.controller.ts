import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'

import { CreateNotificationTypeDto } from './dtos/create-notification-type.dto'
import { UpdateNotificationTypeDto } from './dtos/update-notification-type.dto'
import { NotificationTypeService } from './notification-type.service'
import { NotificationType } from '@notification-type/entities/notification-type.entity'

@Controller('notification-types')
export class NotificationTypeController {
  constructor(private service: NotificationTypeService) {}

  @Get()
  getAll(): Promise<NotificationType[]> {
    return this.service.getAll()
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<NotificationType> {
    return this.service.getById(id)
  }

  @Post()
  create(@Body() body: CreateNotificationTypeDto): Promise<NotificationType> {
    return this.service.create(body)
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateNotificationTypeDto,
  ): Promise<NotificationType> {
    return this.service.update(id, body)
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id)
  }
}
