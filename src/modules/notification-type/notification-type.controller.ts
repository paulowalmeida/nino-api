import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'

import { Roles } from '@shared/decorators/roles.decorator'
import { Role } from '@shared/enums/role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'

import { CreateNotificationTypeDto } from './dtos/create-notification-type.dto'
import { UpdateNotificationTypeDto } from './dtos/update-notification-type.dto'
import { NotificationType } from './entities/notification-type.entity'
import { NotificationTypeService } from './notification-type.service'

@Controller('notification-types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationTypeController {
  constructor(private service: NotificationTypeService) {}

  @Roles(Role.ADMIN, Role.SUPPORT, Role.MERCHANT)
  @Get()
  getAll(): Promise<NotificationType[]> {
    return this.service.getAll()
  }

  @Roles(Role.ADMIN, Role.SUPPORT, Role.MERCHANT)
  @Get(':id')
  getById(@Param('id') id: string): Promise<NotificationType> {
    return this.service.getById(id)
  }

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() body: CreateNotificationTypeDto): Promise<NotificationType> {
    return this.service.create(body)
  }

  @Roles(Role.ADMIN)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateNotificationTypeDto,
  ): Promise<NotificationType> {
    return this.service.update(id, body)
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id)
  }
}
