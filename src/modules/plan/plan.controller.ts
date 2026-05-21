import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'

import { Roles } from '@shared/decorators/roles.decorator'
import { GlobalRole } from '@shared/enums/global-role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'

import { CreatePlanDto } from './dtos/create-plan.dto'
import { UpdatePlanDto } from './dtos/update-plan.dto'
import { PlanService } from './plan.service'
import { PlanResponse } from './types/plan.response.type'

@Controller('plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlanController {
  constructor(private readonly service: PlanService) {}

  @Post()
  @Roles(GlobalRole.ADMIN)
  async create(@Body() createDto: CreatePlanDto): Promise<PlanResponse> {
    return this.service.create(createDto)
  }

  @Get()
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  async getAll(): Promise<PlanResponse[]> {
    return this.service.getAll()
  }

  @Get(':id')
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  async getById(@Param('id') id: string): Promise<PlanResponse> {
    return this.service.getById(id)
  }

  @Patch(':id')
  @Roles(GlobalRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePlanDto,
  ): Promise<PlanResponse> {
    return this.service.update(id, updateDto)
  }

  @Delete(':id')
  @Roles(GlobalRole.ADMIN)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id)
  }
}
