import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common'

import { PlanType } from '@prisma/client'

import { Roles } from '@shared/decorators/roles.decorator'
import { GlobalRole } from '@shared/enums/global-role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { CreatePlanTypeDto } from './dtos/create-plan-type.dto'
import { UpdatePlanTypeDto } from './dtos/update-plan-type.dto'
import { PlanTypeService } from './plan-type.service'

@Controller('plan-types')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlanTypeController {
  constructor(private service: PlanTypeService) {}

  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  @Get()
  getAll(): Promise<PlanType[]> {
    return this.service.getAll()
  }

  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  @Get(':id')
  getById(@Param('id') id: string): Promise<PlanType> {
    return this.service.getById(id)
  }

  @Roles(GlobalRole.ADMIN)
  @Post()
  create(@Body() body: CreatePlanTypeDto): Promise<PlanType> {
    return this.service.create(body)
  }

  @Roles(GlobalRole.ADMIN)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdatePlanTypeDto,
  ): Promise<PlanType> {
    return this.service.update(id, body)
  }

  @Roles(GlobalRole.ADMIN)
  @Delete(':id')
  delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id)
  }
}
