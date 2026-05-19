import { Test, TestingModule } from '@nestjs/testing'

import { LoyaltyTransaction } from '@prisma/client'

import { LoyaltyTransactionRepository } from './loyalty-transaction.repository'
import { LoyaltyTransactionService } from './loyalty-transaction.service'
import { LoyaltyTransactionPaginatedResponse } from './types/loyalty-transaction-paginated-response.type'

describe(LoyaltyTransactionService.name, () => {
  let service: LoyaltyTransactionService

  const mockTransaction: LoyaltyTransaction = {
    id: 'tx-1',
    customerId: 'customer-1',
    tenantId: 'tenant-1',
    orderId: null,
    type: 'EARN',
    points: 100,
    description: null,
    createdAt: new Date(),
  }

  const mockPaginated: LoyaltyTransactionPaginatedResponse = {
    data: [mockTransaction],
    pagination: { total: 1, page: 1, size: 20, pages: 1 },
  }

  const mockRepo: Pick<LoyaltyTransactionRepository, 'getAll' | 'create'> = {
    getAll: jest.fn().mockResolvedValue(mockPaginated),
    create: jest.fn().mockResolvedValue(mockTransaction),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoyaltyTransactionService,
        { provide: LoyaltyTransactionRepository, useValue: mockRepo },
      ],
    }).compile()

    service = module.get<LoyaltyTransactionService>(LoyaltyTransactionService)
  })

  it('getAll() should delegate to repository', async () => {
    const query = { page: 1, size: 20 }
    const result = await service.getAll('customer-1', query)
    expect(mockRepo.getAll).toHaveBeenCalledWith('customer-1', query)
    expect(result).toEqual(mockPaginated)
  })

  it('create() should delegate to repository', async () => {
    const dto = { tenantId: 'tenant-1', type: 'EARN', points: 100 }
    const result = await service.create('customer-1', dto)
    expect(mockRepo.create).toHaveBeenCalledWith('customer-1', dto)
    expect(result).toEqual(mockTransaction)
  })
})
