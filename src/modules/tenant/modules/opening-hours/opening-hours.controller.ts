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

import { OpeningHours } from '@prisma/client'

import { Roles } from '@shared/decorators/roles.decorator'
import { GlobalRole } from '@shared/enums/global-role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { CreateOpeningHoursDto } from './dtos/create-opening-hours.dto'
import { UpdateOpeningHoursDto } from './dtos/update-opening-hours.dto'
import { OpeningHoursService } from './opening-hours.service'

@Controller('tenants/:tenantId/opening-hours')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OpeningHoursController {
  constructor(private readonly service: OpeningHoursService) {}

  @Get()
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  async getAll(
    @Param('tenantId') tenantId: string,
  ): Promise<OpeningHours[]> {
    return this.service.getAll(tenantId)
  }

  @Post()
  @Roles(GlobalRole.ADMIN, GlobalRole.MERCHANT)
  async create(
    @Param('tenantId') tenantId: string,
    @Body() dto: CreateOpeningHoursDto,
  ): Promise<OpeningHours> {
    return this.service.create({ ...dto, tenantId })
  }

  @Patch(':id')
  @Roles(GlobalRole.ADMIN, GlobalRole.MERCHANT)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOpeningHoursDto,
  ): Promise<OpeningHours> {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @Roles(GlobalRole.ADMIN, GlobalRole.MERCHANT)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id)
  }
}
