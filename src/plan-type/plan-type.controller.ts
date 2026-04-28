import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'

import { CreatePlanTypeDto } from './dtos/create-plan-type.dto'
import { UpdatePlanTypeDto } from './dtos/update-plan-type.dto'
import { PlanTypeService } from './plan-type.service'
import { PlanType } from '@plan-type/entities/plan-type.entity'

@Controller('plan-types')
export class PlanTypeController {
  constructor(private service: PlanTypeService) {}

  @Get()
  getAll(): Promise<PlanType[]> {
    return this.service.getAll()
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<PlanType> {
    return this.service.getById(id)
  }

  @Post()
  create(@Body() body: CreatePlanTypeDto): Promise<PlanType> {
    return this.service.create(body)
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdatePlanTypeDto,
  ): Promise<PlanType> {
    return this.service.update(id, body)
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id)
  }
}
