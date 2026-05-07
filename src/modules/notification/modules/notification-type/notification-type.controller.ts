import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common'

import { NotificationType } from '@prisma/client'

import { Roles } from '@shared/decorators/roles.decorator'
import { GlobalRole } from '@shared/enums/global-role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { CreateNotificationTypeDto } from './dtos/create-notification-type.dto'
import { UpdateNotificationTypeDto } from './dtos/update-notification-type.dto'
import { NotificationTypeService } from './notification-type.service'

@Controller('notification-types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationTypeController {
  constructor(private service: NotificationTypeService) {}

  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  @Get()
  getAll(): Promise<NotificationType[]> {
    return this.service.getAll()
  }

  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  @Get(':id')
  getById(@Param('id') id: string): Promise<NotificationType> {
    return this.service.getById(id)
  }

  @Roles(GlobalRole.ADMIN)
  @Post()
  create(@Body() body: CreateNotificationTypeDto): Promise<NotificationType> {
    return this.service.create(body)
  }

  @Roles(GlobalRole.ADMIN)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateNotificationTypeDto,
  ): Promise<NotificationType> {
    return this.service.update(id, body)
  }

  @Roles(GlobalRole.ADMIN)
  @Delete(':id')
  delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id)
  }
}
