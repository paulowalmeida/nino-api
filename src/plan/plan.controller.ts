import { Controller, Get, Param, UseGuards } from '@nestjs/common'

import { PlanService } from './plan.service'
import { Plan } from './types/plan.type'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'

@Controller('plans')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Get()
  async getAll(): Promise<Plan[]> {
    return await this.planService.getAll()
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById(@Param('id') id: string): Promise<Plan> {
    return await this.planService.getById(id)
  }

  @Get('code/:code')
  @UseGuards(JwtAuthGuard)
  async getByCode(@Param('code') code: string): Promise<Plan> {
    return await this.planService.getByCode(Number(code))
  }

  @Get('slug/:slug')
  async getBySlug(@Param('slug') slug: string): Promise<Plan> {
    return await this.planService.getBySlug(slug)
  }
}
