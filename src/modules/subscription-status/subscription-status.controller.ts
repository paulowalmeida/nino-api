import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'

import { CreateSubscriptionStatusDto } from './dtos/create-subscription-status.dto'
import { UpdateSubscriptionStatusDto } from './dtos/update-subscription-status.dto'
import { SubscriptionStatusService } from './subscription-status.service'
import { SubscriptionStatus } from '@subscription-status/entities/subscription-status.entity'

@Controller('subscription-statuses')
@UseGuards(JwtAuthGuard)
export class SubscriptionStatusController {
  constructor(private service: SubscriptionStatusService) {}

  @Get()
  getAll(): Promise<SubscriptionStatus[]> {
    return this.service.getAll()
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<SubscriptionStatus> {
    return this.service.getById(id)
  }

  @Post()
  create(
    @Body() body: CreateSubscriptionStatusDto,
  ): Promise<SubscriptionStatus> {
    return this.service.create(body)
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateSubscriptionStatusDto,
  ): Promise<SubscriptionStatus> {
    return this.service.update(id, body)
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id)
  }
}
