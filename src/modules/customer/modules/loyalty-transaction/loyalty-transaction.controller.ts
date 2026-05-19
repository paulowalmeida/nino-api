import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'

import { LoyaltyTransaction } from '@prisma/client'

import { Roles } from '@shared/decorators/roles.decorator'
import { GlobalRole } from '@shared/enums/global-role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'

import { CustomerOwnerGuard } from '../../guards/customer-owner.guard'
import { CreateLoyaltyTransactionDto } from './dtos/create-loyalty-transaction.dto'
import { LoyaltyTransactionQueryDto } from './dtos/loyalty-transaction-query.dto'
import { LoyaltyTransactionService } from './loyalty-transaction.service'
import { LoyaltyTransactionPaginatedResponse } from './types/loyalty-transaction-paginated-response.type'

@Controller('customers/:customerId/loyalty-transactions')
@UseGuards(JwtAuthGuard, RolesGuard, CustomerOwnerGuard)
export class LoyaltyTransactionController {
  constructor(private readonly service: LoyaltyTransactionService) {}

  @Get()
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.CUSTOMER)
  async getAll(
    @Param('customerId') customerId: string,
    @Query() query: LoyaltyTransactionQueryDto,
  ): Promise<LoyaltyTransactionPaginatedResponse> {
    return this.service.getAll(customerId, query)
  }

  @Post()
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT)
  async create(
    @Param('customerId') customerId: string,
    @Body() dto: CreateLoyaltyTransactionDto,
  ): Promise<LoyaltyTransaction> {
    return this.service.create(customerId, dto)
  }
}
