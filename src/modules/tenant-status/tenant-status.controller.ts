import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'

import { Roles } from '@shared/decorators/roles.decorator'
import { Role } from '@shared/enums/role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'

import { CreateTenantStatusDto } from './dtos/create-tenant-status.dto'
import { UpdateTenantStatusDto } from './dtos/update-tenant-status.dto'
import { TenantStatusService } from './tenant-status.service'
import { TenantStatus } from '@tenant-status/entities/tenant-status.entity'

@Controller('tenant-statuses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantStatusController {
  constructor(private service: TenantStatusService) {}

  @Roles(Role.ADMIN, Role.SUPPORT, Role.MERCHANT)
  @Get()
  async getAll(): Promise<TenantStatus[]> {
    return this.service.getAll()
  }

  @Roles(Role.ADMIN, Role.SUPPORT, Role.MERCHANT)
  @Get(':id')
  async getById(@Param('id') id: string): Promise<TenantStatus> {
    return this.service.getById(id)
  }

  @Roles(Role.ADMIN)
  @Post()
  async create(@Body() body: CreateTenantStatusDto): Promise<TenantStatus> {
    return this.service.create(body)
  }

  @Roles(Role.ADMIN)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateTenantStatusDto,
  ): Promise<TenantStatus> {
    return this.service.update(id, body)
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id)
  }
}
