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

import { CreateCustomerDto } from './dtos/create-customer.dto'
import { CustomerOwnerGuard } from './guards/customer-owner.guard'
import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { UpdateCustomerDto } from './dtos/update-customer.dto'
import { CustomerService } from './customer.service'
import { CustomerPaginatedResponse } from './types/customer-paginated-response.type'
import { CustomerResponse } from './types/customer-response.type'

@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard, CustomerOwnerGuard)
export class CustomerController {
  constructor(private readonly service: CustomerService) {}

  @Post()
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT)
  async create(@Body() dto: CreateCustomerDto): Promise<CustomerResponse> {
    return this.service.create(dto)
  }

  @Get()
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT)
  async getAll(
    @Query() query: PaginatedQueryDto,
  ): Promise<CustomerPaginatedResponse> {
    return this.service.getAll(query)
  }

  @Get(':id')
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.CUSTOMER)
  async getById(@Param('id') id: string): Promise<CustomerResponse> {
    return this.service.getById(id)
  }

  @Patch(':id')
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.CUSTOMER)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ): Promise<CustomerResponse> {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @Roles(GlobalRole.ADMIN)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id)
  }
}
