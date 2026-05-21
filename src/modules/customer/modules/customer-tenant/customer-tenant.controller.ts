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

import { CustomerTenant } from '@prisma/client'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { Roles } from '@shared/decorators/roles.decorator'
import { GlobalRole } from '@shared/enums/global-role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'

import { CustomerOwnerGuard } from '@customer/guards/customer-owner.guard'
import { CustomerTenantService } from './customer-tenant.service'
import { CreateCustomerTenantDto } from './dtos/create-customer-tenant.dto'
import { CustomerTenantPaginatedResponse } from './types/customer-tenant-paginated-response.type'

@Controller('customers/:customerId/tenants')
@UseGuards(JwtAuthGuard, RolesGuard, CustomerOwnerGuard)
export class CustomerTenantController {
  constructor(private readonly service: CustomerTenantService) {}

  @Get()
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.CUSTOMER)
  async getAll(
    @Param('customerId') customerId: string,
    @Query() query: PaginatedQueryDto,
  ): Promise<CustomerTenantPaginatedResponse> {
    return this.service.getAll(customerId, query)
  }

  @Post()
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT)
  async create(
    @Param('customerId') customerId: string,
    @Body() dto: CreateCustomerTenantDto,
  ): Promise<CustomerTenant> {
    return this.service.create({ ...dto, customerId })
  }

  @Delete(':tenantId')
  @Roles(GlobalRole.ADMIN)
  async delete(
    @Param('customerId') customerId: string,
    @Param('tenantId') tenantId: string,
  ): Promise<{ message: string }> {
    return this.service.delete(customerId, tenantId)
  }
}
