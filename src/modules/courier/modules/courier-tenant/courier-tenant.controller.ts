import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'

import { Roles } from '@shared/decorators/roles.decorator'
import { GlobalRole } from '@shared/enums/global-role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'

import { CreateCourierTenantDto } from './dtos/create-courier-tenant.dto'
import { CourierTenantPaginatedResponse } from './types/courier-tenant-paginated-response.type'
import { CourierTenantResponse } from './types/courier-tenant-response.type'
import { CourierTenantService } from './courier-tenant.service'

@Controller('courier-tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CourierTenantController {
  constructor(private readonly service: CourierTenantService) {}

  @Post()
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  async create(@Body() body: CreateCourierTenantDto): Promise<CourierTenantResponse> {
    return this.service.create(body)
  }

  @Get('courier/:courierId')
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT, GlobalRole.COURIER)
  async getByCourierId(
    @Param('courierId') courierId: string,
    @Query() query: PaginatedQueryDto,
  ): Promise<CourierTenantPaginatedResponse> {
    return this.service.getByCourierId(courierId, query)
  }

  @Get('tenant/:tenantId')
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  async getByTenantId(
    @Param('tenantId') tenantId: string,
    @Query() query: PaginatedQueryDto,
  ): Promise<CourierTenantPaginatedResponse> {
    return this.service.getByTenantId(tenantId, query)
  }

  @Delete(':courierId/:tenantId')
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  async delete(
    @Param('courierId') courierId: string,
    @Param('tenantId') tenantId: string,
  ): Promise<{ message: string }> {
    return this.service.delete(courierId, tenantId)
  }
}
