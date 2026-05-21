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

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { Roles } from '@shared/decorators/roles.decorator'
import { GlobalRole } from '@shared/enums/global-role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'

import { CreateTenantPaymentMethodDto } from './dtos/create-tenant-payment-method.dto'
import { UpdateTenantPaymentMethodDto } from './dtos/update-tenant-payment-method.dto'
import { TenantPaymentMethodService } from './tenant-payment-method.service'
import { TenantPaymentMethodPaginatedResponse } from './types/tenant-payment-method-paginated-response.type'
import { TenantPaymentMethodResponse } from './types/tenant-payment-method-response.type'

@Controller('tenants/:tenantId/payment-methods')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantPaymentMethodController {
  constructor(private readonly service: TenantPaymentMethodService) {}

  @Get()
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  async getAll(
    @Param('tenantId') tenantId: string,
    @Query() query: PaginatedQueryDto,
  ): Promise<TenantPaymentMethodPaginatedResponse> {
    return this.service.getAll(tenantId, query)
  }

  @Post()
  @Roles(GlobalRole.ADMIN, GlobalRole.MERCHANT)
  async create(
    @Param('tenantId') tenantId: string,
    @Body() dto: CreateTenantPaymentMethodDto,
  ): Promise<TenantPaymentMethodResponse> {
    return this.service.create(tenantId, dto)
  }

  @Patch(':methodId')
  @Roles(GlobalRole.ADMIN, GlobalRole.MERCHANT)
  async update(
    @Param('tenantId') tenantId: string,
    @Param('methodId') methodId: string,
    @Body() dto: UpdateTenantPaymentMethodDto,
  ): Promise<TenantPaymentMethodResponse> {
    return this.service.update(tenantId, methodId, dto)
  }

  @Delete(':methodId')
  @Roles(GlobalRole.ADMIN)
  async delete(
    @Param('tenantId') tenantId: string,
    @Param('methodId') methodId: string,
  ): Promise<{ message: string }> {
    return this.service.delete(tenantId, methodId)
  }
}
