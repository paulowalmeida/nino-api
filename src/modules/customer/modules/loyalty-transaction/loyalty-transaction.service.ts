import { Injectable } from '@nestjs/common'

import { LoyaltyTransaction } from '@prisma/client'

import { CreateLoyaltyTransactionDto } from './dtos/create-loyalty-transaction.dto'
import { LoyaltyTransactionQueryDto } from './dtos/loyalty-transaction-query.dto'
import { LoyaltyTransactionRepository } from './loyalty-transaction.repository'
import { LoyaltyTransactionPaginatedResponse } from './types/loyalty-transaction-paginated-response.type'

type CreateData = CreateLoyaltyTransactionDto & { customerId: string }

@Injectable()
export class LoyaltyTransactionService {
  constructor(private readonly repo: LoyaltyTransactionRepository) {}

  async getAll(
    customerId: string,
    query: LoyaltyTransactionQueryDto,
  ): Promise<LoyaltyTransactionPaginatedResponse> {
    const where: Record<string, unknown> = {
      customerId,
      ...(query.tenantId && { tenantId: query.tenantId }),
      ...(query.type && { type: query.type }),
    }
    return this.repo.findAllPaginated<LoyaltyTransaction>({
      page: query.page,
      size: query.size,
      where,
      order: { target: 'createdAt', direction: 'desc' },
      ignoreDeleted: true,
    })
  }

  async create(
    customerId: string,
    data: CreateLoyaltyTransactionDto,
  ): Promise<LoyaltyTransaction> {
    return this.repo.insert<CreateData, LoyaltyTransaction>({
      data: { ...data, customerId },
    })
  }
}
