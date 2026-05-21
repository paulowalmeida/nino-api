import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'

import { TenantPhone } from '@prisma/client'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { Roles } from '@shared/decorators/roles.decorator'
import { GlobalRole } from '@shared/enums/global-role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'

import { CreateTenantPhoneDto } from './dtos/create-tenant-phone.dto'
import { UpdateTenantPhoneDto } from './dtos/update-tenant-phone.dto'
import { TenantPhoneService } from './tenant-phone.service'
import { TenantPhonePaginatedResponse } from './types/tenant-phone-paginated-response.type'

@Controller('tenants/:tenantId/phones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantPhoneController {
  constructor(private readonly service: TenantPhoneService) {}

  @Get()
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  async getAll(
    @Param('tenantId') tenantId: string,
    @Query() query: PaginatedQueryDto,
  ): Promise<TenantPhonePaginatedResponse> {
    return this.service.getAll(tenantId, query)
  }

  @Post()
  @Roles(GlobalRole.ADMIN, GlobalRole.MERCHANT)
  async create(
    @Param('tenantId') tenantId: string,
    @Body() dto: CreateTenantPhoneDto,
  ): Promise<TenantPhone> {
    return this.service.create({ ...dto, tenantId })
  }

  @Patch(':id')
  @Roles(GlobalRole.ADMIN, GlobalRole.MERCHANT)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTenantPhoneDto,
  ): Promise<TenantPhone> {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @Roles(GlobalRole.ADMIN, GlobalRole.MERCHANT)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id)
  }
}
