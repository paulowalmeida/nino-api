import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'

import { Roles } from '@shared/decorators/roles.decorator'
import { GlobalRole } from '@shared/enums/global-role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'

import { ActivateSubscriptionDto } from './dtos/activate-subscription.dto'
import { CancelSubscriptionDto } from './dtos/cancel-subscription.dto'
import { ChangePlanDto } from './dtos/change-plan.dto'
import { CreateSubscriptionDto } from './dtos/create-subscription.dto'
import { SubscriptionService } from './subscription.service'
import { SubscriptionPaginatedResponse } from './types/subscription-paginated-response.type'
import { SubscriptionResponse } from './types/subscription-response.type'

@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionController {
  constructor(private readonly service: SubscriptionService) {}

  @Post()
  @Roles(GlobalRole.ADMIN, GlobalRole.MERCHANT)
  async create(
    @Body() dto: CreateSubscriptionDto,
  ): Promise<SubscriptionResponse> {
    return this.service.create(dto)
  }

  @Get()
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT)
  async getAll(
    @Query() query: PaginatedQueryDto,
  ): Promise<SubscriptionPaginatedResponse> {
    return this.service.getAll(query)
  }

  @Get('company/:companyId')
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  async getActiveByCompany(
    @Param('companyId') companyId: string,
  ): Promise<SubscriptionResponse> {
    return this.service.getActiveByCompany(companyId)
  }

  @Get(':id')
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  async getById(@Param('id') id: string): Promise<SubscriptionResponse> {
    return this.service.getById(id)
  }

  @Patch(':id/activate')
  @Roles(GlobalRole.ADMIN)
  async activate(
    @Param('id') id: string,
    @Body() dto: ActivateSubscriptionDto,
  ): Promise<SubscriptionResponse> {
    return this.service.activate(id, dto)
  }

  @Patch(':id/cancel')
  @Roles(GlobalRole.ADMIN, GlobalRole.MERCHANT)
  async cancel(
    @Param('id') id: string,
    @Body() dto: CancelSubscriptionDto,
  ): Promise<SubscriptionResponse> {
    return this.service.cancel(id, dto)
  }

  @Patch(':id/plan')
  @Roles(GlobalRole.ADMIN, GlobalRole.MERCHANT)
  async changePlan(
    @Param('id') id: string,
    @Body() dto: ChangePlanDto,
  ): Promise<SubscriptionResponse> {
    return this.service.changePlan(id, dto)
  }

  @Delete(':id')
  @Roles(GlobalRole.ADMIN)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id)
  }
}
