import { Controller, Get, Param, UseGuards } from '@nestjs/common'

import { Plan } from '@plan/types/plan.type'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { PlanService } from './plan.service'

@Controller('plans')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Get()
  async getAll(): Promise<Plan[]> {
    return await this.planService.getAll()
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById(@Param('id') id: number): Promise<Plan> {
    return await this.planService.getById(id)
  }

  @Get('slug/:slug')
  async getBySlug(@Param('slug') slug: string): Promise<Plan> {
    return await this.planService.getBySlug(slug)
  }
}
