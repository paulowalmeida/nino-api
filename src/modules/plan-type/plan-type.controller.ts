import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'

import { Roles } from '@shared/decorators/roles.decorator'
import { Role } from '@shared/enums/role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'

import { CreatePlanTypeDto } from './dtos/create-plan-type.dto'
import { UpdatePlanTypeDto } from './dtos/update-plan-type.dto'
import { PlanType } from './entities/plan-type.entity'
import { PlanTypeService } from './plan-type.service'

@Controller('plan-types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlanTypeController {
  constructor(private service: PlanTypeService) {}

  @Roles(Role.ADMIN, Role.SUPPORT, Role.MERCHANT)
  @Get()
  getAll(): Promise<PlanType[]> {
    return this.service.getAll()
  }

  @Roles(Role.ADMIN, Role.SUPPORT, Role.MERCHANT)
  @Get(':id')
  getById(@Param('id') id: string): Promise<PlanType> {
    return this.service.getById(id)
  }

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() body: CreatePlanTypeDto): Promise<PlanType> {
    return this.service.create(body)
  }

  @Roles(Role.ADMIN)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdatePlanTypeDto,
  ): Promise<PlanType> {
    return this.service.update(id, body)
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id)
  }
}
