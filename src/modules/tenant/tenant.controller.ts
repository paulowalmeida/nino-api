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

import { Roles } from '@shared/decorators/roles.decorator'
import { GlobalRole } from '@shared/enums/global-role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { CreateTenantDto } from './dtos/create-tenant.dto'
import { TenantQueryDto } from './dtos/tenant-query.dto'
import { UpdateTenantDto } from './dtos/update-tenant.dto'
import { TenantService } from './tenant.service'
import { TenantPaginatedResponse } from './types/tenant-paginated-response.type'
import { TenantResponse } from './types/tenant-response.type'

@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @Roles(GlobalRole.ADMIN, GlobalRole.MERCHANT)
  async create(@Body() dto: CreateTenantDto): Promise<TenantResponse> {
    return this.tenantService.create(dto)
  }

  @Get()
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT)
  async getAll(@Query() query: TenantQueryDto): Promise<TenantPaginatedResponse> {
    return this.tenantService.getAll(query)
  }

  @Get(':id')
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  async getById(@Param('id') id: string): Promise<TenantResponse> {
    return this.tenantService.getById(id)
  }

  @Get('slug/:slug')
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  async getBySlug(@Param('slug') slug: string): Promise<TenantResponse> {
    return this.tenantService.getBySlug(slug)
  }

  @Patch(':id')
  @Roles(GlobalRole.ADMIN, GlobalRole.MERCHANT)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTenantDto,
  ): Promise<TenantResponse> {
    return this.tenantService.update(id, dto)
  }

  @Delete(':id')
  @Roles(GlobalRole.ADMIN)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.tenantService.delete(id)
  }
}
