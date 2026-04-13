import { Controller, Get, Param, UseGuards } from '@nestjs/common'

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { SubscriptionStatus } from '@subscription-status/types/subscription-status.type'
import { SubscriptionStatusService } from './subscription-status.service'

@Controller('subscription-statuses')
export class SubscriptionStatusController {
  constructor(
    private readonly subscriptionStatusService: SubscriptionStatusService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAll(): Promise<SubscriptionStatus[]> {
    return await this.subscriptionStatusService.getAll()
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById(@Param('id') id: number): Promise<SubscriptionStatus> {
    return await this.subscriptionStatusService.getById(id)
  }
}
