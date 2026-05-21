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

import { CustomerAddress } from '@prisma/client'

import { Roles } from '@shared/decorators/roles.decorator'
import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { GlobalRole } from '@shared/enums/global-role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { PaginatedResponse } from '@shared/types/paginated-response.type'

import { CustomerOwnerGuard } from '@customer/guards/customer-owner.guard'
import { CustomerAddressService } from './customer-address.service'
import { CreateCustomerAddressDto } from './dtos/create-customer-address.dto'
import { UpdateCustomerAddressDto } from './dtos/update-customer-address.dto'

@Controller('customers/:customerId/addresses')
@UseGuards(JwtAuthGuard, RolesGuard, CustomerOwnerGuard)
export class CustomerAddressController {
  constructor(private readonly service: CustomerAddressService) {}

  @Get()
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.CUSTOMER)
  async getAll(
    @Param('customerId') customerId: string,
    @Query() query: PaginatedQueryDto,
  ): Promise<PaginatedResponse<CustomerAddress>> {
    return this.service.getAll(customerId, query)
  }

  @Post()
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.CUSTOMER)
  async create(
    @Param('customerId') customerId: string,
    @Body() dto: CreateCustomerAddressDto,
  ): Promise<CustomerAddress> {
    return this.service.create({ ...dto, customerId })
  }

  @Patch(':id')
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.CUSTOMER)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerAddressDto,
  ): Promise<CustomerAddress> {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @Roles(GlobalRole.ADMIN)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id)
  }
}
