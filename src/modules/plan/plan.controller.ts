import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'

import { Roles } from '@shared/decorators/roles.decorator'
import { Role } from '@shared/enums/role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { CreatePlanDto } from './dtos/create-plan.dto'
import { UpdatePlanDto } from './dtos/update-plan.dto'
import { PlanService } from './plan.service'
import { PlanResponse } from './types/plan.response.type'

@Controller('plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() createDto: CreatePlanDto): Promise<PlanResponse> {
    return await this.planService.create(createDto)
  }

  @Get()
  @Roles(Role.ADMIN, Role.SUPPORT, Role.MERCHANT)
  async getAll(): Promise<PlanResponse[]> {
    return await this.planService.getAll()
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPPORT, Role.MERCHANT)
  async getById(@Param('id', ParseIntPipe) id: number): Promise<PlanResponse> {
    return await this.planService.getById(id)
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePlanDto,
  ): Promise<PlanResponse> {
    await this.planService.update(id, updateDto)
    return await this.planService.getById(id)
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.planService.delete(id)
    return { message: 'plan deleted successfully' }
  }
}
