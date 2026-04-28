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
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { CreatePlanDto } from './dtos/create-plan.dto'
import { UpdatePlanDto } from './dtos/update-plan.dto'
import { PlanService } from './plan.service'
import { Plan } from '@plan/entities/plan.entity'

@Controller('plans')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createDto: CreatePlanDto): Promise<Plan> {
    return await this.planService.create(createDto)
  }

  @Get()
  async getAll(): Promise<Plan[]> {
    return await this.planService.getAll()
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number): Promise<Plan> {
    return await this.planService.getById(id)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdatePlanDto,
  ): Promise<Plan> {
    await this.planService.update(id, updateDto)
    return await this.planService.getById(id)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    await this.planService.delete(id)
    return { message: 'plan deleted successfully' }
  }
}
