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

import { SubscriptionStatus } from '@prisma/client'

import { Roles } from '@shared/decorators/roles.decorator'
import { GlobalRole } from '@shared/enums/global-role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import {
  CreateSubscriptionStatusDto,
} from './dtos/create-subscription-status.dto'
import {
  UpdateSubscriptionStatusDto,
} from './dtos/update-subscription-status.dto'
import { SubscriptionStatusService } from './subscription-status.service'

@Controller('subscription-statuses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionStatusController {
  constructor(private service: SubscriptionStatusService) {}

  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  @Get()
  getAll(): Promise<SubscriptionStatus[]> {
    return this.service.getAll()
  }

  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  @Get(':id')
  getById(@Param('id') id: string): Promise<SubscriptionStatus> {
    return this.service.getById(id)
  }

  @Roles(GlobalRole.ADMIN)
  @Post()
  create(
    @Body() body: CreateSubscriptionStatusDto,
  ): Promise<SubscriptionStatus> {
    return this.service.create(body)
  }

  @Roles(GlobalRole.ADMIN)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateSubscriptionStatusDto,
  ): Promise<SubscriptionStatus> {
    return this.service.update(id, body)
  }

  @Roles(GlobalRole.ADMIN)
  @Delete(':id')
  delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id)
  }
}
