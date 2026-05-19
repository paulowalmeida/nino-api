import { Injectable } from '@nestjs/common'

import { LoyaltyTransaction, Prisma } from '@prisma/client'

import { BaseRepository } from '@shared/repositories/base/base.repository'
import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

import { CreateLoyaltyTransactionDto } from './dtos/create-loyalty-transaction.dto'
import { LoyaltyTransactionQueryDto } from './dtos/loyalty-transaction-query.dto'
import { LoyaltyTransactionPaginatedResponse } from './types/loyalty-transaction-paginated-response.type'

@Injectable()
export class LoyaltyTransactionRepository
  extends BaseRepository<Prisma.LoyaltyTransactionDelegate> {
  constructor(
    prisma: PrismaService,
    paginationService: PaginationService,
    errorService: ErrorService,
  ) {
    super(
      errorService,
      prisma.loyaltyTransaction,
      'Loyalty Transaction',
      paginationService,
    )
  }

  async getAll(
    customerId: string,
    query: LoyaltyTransactionQueryDto,
  ): Promise<LoyaltyTransactionPaginatedResponse> {
    const where: Prisma.LoyaltyTransactionWhereInput = {
      customerId,
      ...(query.tenantId && { tenantId: query.tenantId }),
      ...(query.type && { type: query.type }),
    }
    return this.findAllPaginated<LoyaltyTransaction>({
      page: query.page ?? 1,
      size: query.size ?? 20,
      where,
      orderBy: { createdAt: 'desc' },
      ignoreDeleted: true,
    })
  }

  async create(
    customerId: string,
    data: CreateLoyaltyTransactionDto,
  ): Promise<LoyaltyTransaction> {
    return this.insert<
      CreateLoyaltyTransactionDto & { customerId: string },
      LoyaltyTransaction
    >({ data: { ...data, customerId } })
  }
}
