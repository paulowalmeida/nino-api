import { Injectable } from '@nestjs/common'

import { LoyaltyTransaction } from '@prisma/client'

import { CreateLoyaltyTransactionDto } from './dtos/create-loyalty-transaction.dto'
import { LoyaltyTransactionQueryDto } from './dtos/loyalty-transaction-query.dto'
import { LoyaltyTransactionRepository } from './loyalty-transaction.repository'
import { LoyaltyTransactionPaginatedResponse } from './types/loyalty-transaction-paginated-response.type'

@Injectable()
export class LoyaltyTransactionService {
  constructor(private readonly repo: LoyaltyTransactionRepository) {}

  async getAll(
    customerId: string,
    query: LoyaltyTransactionQueryDto,
  ): Promise<LoyaltyTransactionPaginatedResponse> {
    return this.repo.getAll(customerId, query)
  }

  async create(
    customerId: string,
    data: CreateLoyaltyTransactionDto,
  ): Promise<LoyaltyTransaction> {
    return this.repo.create(customerId, data)
  }
}
