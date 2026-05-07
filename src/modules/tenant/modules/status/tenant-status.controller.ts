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

import { TenantStatus } from '@prisma/client'

import { Roles } from '@shared/decorators/roles.decorator'
import { GlobalRole } from '@shared/enums/global-role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { CreateTenantStatusDto } from './dtos/create-tenant-status.dto'
import { UpdateTenantStatusDto } from './dtos/update-tenant-status.dto'
import { TenantStatusService } from './tenant-status.service'

@Controller('tenant-statuses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantStatusController {
  constructor(private service: TenantStatusService) {}

  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  @Get()
  async getAll(): Promise<TenantStatus[]> {
    return this.service.getAll()
  }

  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  @Get(':id')
  async getById(@Param('id') id: string): Promise<TenantStatus> {
    return this.service.getById(id)
  }

  @Roles(GlobalRole.ADMIN)
  @Post()
  async create(@Body() body: CreateTenantStatusDto): Promise<TenantStatus> {
    return this.service.create(body)
  }

  @Roles(GlobalRole.ADMIN)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateTenantStatusDto,
  ): Promise<TenantStatus> {
    return this.service.update(id, body)
  }

  @Roles(GlobalRole.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id)
  }
}
