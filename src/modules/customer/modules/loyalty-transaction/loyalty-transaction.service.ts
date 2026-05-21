import { Injectable } from '@nestjs/common'

import { LoyaltyTransactionRepository } from './loyalty-transaction.repository'
import { CreateLoyaltyTransactionDto } from './dtos/create-loyalty-transaction.dto'
import { LoyaltyTransactionQueryDto } from './dtos/loyalty-transaction-query.dto'
import { LoyaltyTransactionFull } from './types/loyalty-transaction-full.type'
import { LoyaltyTransactionPaginatedResponse } from './types/loyalty-transaction-paginated-response.type'
import { LoyaltyTransactionResponse } from './types/loyalty-transaction-response.type'

type CreateData = CreateLoyaltyTransactionDto & { customerId: string }

@Injectable()
export class LoyaltyTransactionService {
  private readonly include = { tenant: true } as const

  constructor(private readonly repo: LoyaltyTransactionRepository) {}

  private toResponse(lt: LoyaltyTransactionFull): LoyaltyTransactionResponse {
    const { customerId: _, tenantId: __, ...rest } = lt
    return rest
  }

  async getAll(
    customerId: string,
    query: LoyaltyTransactionQueryDto,
  ): Promise<LoyaltyTransactionPaginatedResponse> {
    const where: Record<string, unknown> = {
      customerId,
      ...(query.tenantId && { tenantId: query.tenantId }),
      ...(query.type && { type: query.type }),
    }
    const result = await this.repo.findAllPaginated<LoyaltyTransactionFull>({
      page: query.page,
      size: query.size,
      where,
      order: { target: 'createdAt', direction: 'desc' },
      include: this.include,
      ignoreDeleted: true,
    })
    return { ...result, data: result.data.map((lt) => this.toResponse(lt)) }
  }

  async create(
    customerId: string,
    data: CreateLoyaltyTransactionDto,
  ): Promise<LoyaltyTransactionResponse> {
    const lt = await this.repo.insert<CreateData, LoyaltyTransactionFull>({
      data: { ...data, customerId },
      include: this.include,
    })
    return this.toResponse(lt)
  }
}
