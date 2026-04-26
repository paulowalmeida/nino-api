import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'

import { CreateTenantStatusDto } from './dtos/create-tenant-status.dto'
import { UpdateTenantStatusDto } from './dtos/update-tenant-status.dto'
import { TenantStatusService } from './tenant-status.service'
import { TenantStatus } from './types/tenant-status.type'

@Controller('tenant-statuses')
export class TenantStatusController {
  constructor(private service: TenantStatusService) {}

  @Get()
  async getAll(): Promise<TenantStatus[]> {
    return this.service.getAll()
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<TenantStatus> {
    return this.service.getById(id)
  }

  @Post()
  async create(@Body() body: CreateTenantStatusDto): Promise<TenantStatus> {
    return this.service.create(body)
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateTenantStatusDto,
  ): Promise<TenantStatus> {
    return this.service.update(id, body)
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id)
  }
}
