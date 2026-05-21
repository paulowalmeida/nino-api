import { Test, TestingModule } from '@nestjs/testing'

import { PaginationMeta } from '@shared/types/pagination-meta.type'

import { CreateLoyaltyTransactionDto } from './dtos/create-loyalty-transaction.dto'
import { LoyaltyTransactionQueryDto } from './dtos/loyalty-transaction-query.dto'
import { LoyaltyTransactionRepository } from './loyalty-transaction.repository'
import { LoyaltyTransactionService } from './loyalty-transaction.service'
import { LoyaltyTransactionFull } from './types/loyalty-transaction-full.type'
import { LoyaltyTransactionPaginatedResponse } from './types/loyalty-transaction-paginated-response.type'
import { LoyaltyTransactionResponse } from './types/loyalty-transaction-response.type'

describe(LoyaltyTransactionService.name, () => {
  let service: LoyaltyTransactionService

  const mockTenant = {
    id: 'tenant-1',
    customName: null,
    slug: 'tenant-1',
    logoUrl: null,
    favicon: null,
    primaryColor: null,
    secondaryColor: null,
    customDomain: null,
    companyId: 'company-1',
    statusId: 'status-1',
    typeId: 'type-1',
    timezone: 'America/Sao_Paulo',
    zipCode: '01310-100',
    street: 'Av. Paulista',
    number: '1000',
    complement: null,
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    country: 'BR',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockTransactionFull: LoyaltyTransactionFull = {
    id: 'tx-1',
    customerId: 'customer-1',
    tenantId: 'tenant-1',
    orderId: null,
    type: 'EARN',
    points: 100,
    description: null,
    createdAt: new Date(),
    tenant: mockTenant,
  }

  const mockTransaction: LoyaltyTransactionResponse = {
    id: 'tx-1',
    orderId: null,
    type: 'EARN',
    points: 100,
    description: null,
    createdAt: mockTransactionFull.createdAt,
    tenant: mockTenant,
  }

  const mockMeta: PaginationMeta = {
    total: 1,
    page: 1,
    size: 20,
    totalPages: 1,
    previousPage: null,
    nextPage: null,
  }

  const mockPaginated: LoyaltyTransactionPaginatedResponse = {
    data: [mockTransaction],
    pagination: mockMeta,
  }

  const include = { tenant: true }

  const mockRepo: Pick<
    LoyaltyTransactionRepository,
    'findAllPaginated' | 'insert'
  > = {
    findAllPaginated: jest.fn().mockResolvedValue({
      data: [mockTransactionFull],
      pagination: mockMeta,
    }),
    insert: jest.fn().mockResolvedValue(mockTransactionFull),
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

  it('getAll() should call findAllPaginated with include and fixed order', async () => {
    const query: LoyaltyTransactionQueryDto = { page: 1, size: 20 }
    const result = await service.getAll('customer-1', query)
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith({
      page: 1,
      size: 20,
      where: { customerId: 'customer-1' },
      order: { target: 'createdAt', direction: 'desc' },
      include,
      ignoreDeleted: true,
    })
    expect(result).toEqual(mockPaginated)
  })

  it('getAll() should include tenantId in where when provided', async () => {
    const query: LoyaltyTransactionQueryDto = { tenantId: 'tenant-1' }
    await service.getAll('customer-1', query)
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 'tenant-1' }),
      }),
    )
  })

  it('getAll() should include type in where when provided', async () => {
    const query: LoyaltyTransactionQueryDto = { type: 'EARN' as never }
    await service.getAll('customer-1', query)
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ type: 'EARN' }),
      }),
    )
  })

  it('create() should call insert with include and return mapped response', async () => {
    const dto: CreateLoyaltyTransactionDto = {
      tenantId: 'tenant-1',
      type: 'EARN' as never,
      points: 100,
    }
    const result = await service.create('customer-1', dto)
    expect(mockRepo.insert).toHaveBeenCalledWith({
      data: { ...dto, customerId: 'customer-1' },
      include,
    })
    expect(result).toEqual(mockTransaction)
  })
})
