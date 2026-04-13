import { Controller, Get, Param, UseGuards } from '@nestjs/common'

import { SubscriptionStatusService } from './subscription-status.service'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'

@Controller('subscription-statuses')
export class SubscriptionStatusController {
  constructor(private readonly subscriptionStatusService: SubscriptionStatusService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAll() {
    return await this.subscriptionStatusService.getAll()
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById(@Param('id') id: string) {
    return await this.subscriptionStatusService.getById(id)
  }

  @Get('code/:code')
  @UseGuards(JwtAuthGuard)
  async getByCode(@Param('code') code: string) {
    return await this.subscriptionStatusService.getByCode(Number(code))
  }
}
