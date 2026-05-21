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

import { CustomerOwnerGuard } from '@customer/guards/customer-owner.guard'
import { CustomerPaymentMethodService } from './customer-payment-method.service'
import { CreateCustomerPaymentMethodDto } from './dtos/create-customer-payment-method.dto'
import { UpdateCustomerPaymentMethodDto } from './dtos/update-customer-payment-method.dto'
import { CustomerPaymentMethodPaginatedResponse } from './types/customer-payment-method-paginated-response.type'
import { CustomerPaymentMethodResponse } from './types/customer-payment-method-response.type'

@Controller('customers/:customerId/payment-methods')
@UseGuards(JwtAuthGuard, RolesGuard, CustomerOwnerGuard)
export class CustomerPaymentMethodController {
  constructor(private readonly service: CustomerPaymentMethodService) {}

  @Get()
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.CUSTOMER)
  async getAll(
    @Param('customerId') customerId: string,
    @Query() query: PaginatedQueryDto,
  ): Promise<CustomerPaymentMethodPaginatedResponse> {
    return this.service.getAll(customerId, query)
  }

  @Get(':id')
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.CUSTOMER)
  async getById(
    @Param('id') id: string,
  ): Promise<CustomerPaymentMethodResponse> {
    return this.service.getById(id)
  }

  @Post()
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.CUSTOMER)
  async create(
    @Param('customerId') customerId: string,
    @Body() dto: CreateCustomerPaymentMethodDto,
  ): Promise<CustomerPaymentMethodResponse> {
    return this.service.create({ ...dto, customerId })
  }

  @Patch(':id')
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.CUSTOMER)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerPaymentMethodDto,
  ): Promise<CustomerPaymentMethodResponse> {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @Roles(GlobalRole.ADMIN)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id)
  }
}
