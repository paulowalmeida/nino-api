import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'

import { Roles } from '@shared/decorators/roles.decorator'
import { GlobalRole } from '@shared/enums/global-role.enum'
import { TenantRole } from '@shared/enums/tenant-role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import type { AuthRequest } from '@shared/types/auth-request.type'

import { CreateOrderDto } from './dtos/create-order.dto'
import { QueryOrderDto } from './dtos/query-order.dto'
import { UpdateOrderStatusDto } from './dtos/update-order-status.dto'
import { OrderService } from './order.service'
import { OrderPaginatedResponse } from './types/order-paginated-response.type'
import { OrderResponse } from './types/order-response.type'

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
  constructor(private readonly service: OrderService) {}

  @Post()
  @Roles(
    GlobalRole.CUSTOMER,
    TenantRole.OWNER,
    TenantRole.MANAGER,
    TenantRole.STAFF,
  )
  async create(
    @Req() req: AuthRequest,
    @Body() dto: CreateOrderDto,
  ): Promise<OrderResponse> {
    if (req.user.role === GlobalRole.CUSTOMER) {
      dto.customerId = req.user.sub
    }
    return this.service.create(dto)
  }

  @Get()
  @Roles(
    GlobalRole.ADMIN,
    GlobalRole.SUPPORT,
    TenantRole.OWNER,
    TenantRole.MANAGER,
  )
  async getAll(@Query() query: QueryOrderDto): Promise<OrderPaginatedResponse> {
    return this.service.getAll(query)
  }

  @Get(':id')
  @Roles(
    GlobalRole.ADMIN,
    GlobalRole.SUPPORT,
    TenantRole.OWNER,
    TenantRole.MANAGER,
    TenantRole.STAFF,
  )
  async getById(@Param('id') id: string): Promise<OrderResponse> {
    return this.service.getById(id)
  }

  @Patch(':id/status')
  @Roles(TenantRole.OWNER, TenantRole.MANAGER, TenantRole.STAFF)
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<OrderResponse> {
    return this.service.updateStatus(id, dto)
  }
}
