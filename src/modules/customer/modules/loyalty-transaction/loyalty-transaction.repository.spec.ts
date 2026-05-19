import { Test, TestingModule } from '@nestjs/testing'

import { LoyaltyTransaction } from '@prisma/client'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

import { LoyaltyTransactionRepository } from './loyalty-transaction.repository'

describe(LoyaltyTransactionRepository.name, () => {
  let repository: LoyaltyTransactionRepository

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

  const mockPrisma = {
    loyaltyTransaction: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
  }

  const mockErrorService: jest.Mocked<Pick<ErrorService, 'handle'>> = {
    handle: jest
      .fn<never, [unknown, string?]>()
      .mockImplementation((e) => { throw e }),
  }

  beforeEach(async () => {
    mockErrorService.handle.mockImplementation(
      (e: unknown): never => { throw e as never },
    )
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoyaltyTransactionRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
        PaginationService,
      ],
    }).compile()

    repository = module.get<LoyaltyTransactionRepository>(
      LoyaltyTransactionRepository,
    )
    mockPrisma.loyaltyTransaction.count.mockResolvedValue(0)
  })

  afterEach(() => jest.resetAllMocks())

  it('getAll() should return paginated transactions for customer', async () => {
    mockPrisma.loyaltyTransaction.findMany.mockResolvedValue([mockTransaction])
    mockPrisma.loyaltyTransaction.count.mockResolvedValue(1)
    const result = await repository.getAll('customer-1', { page: 1, size: 20 })
    expect(result.data).toHaveLength(1)
    expect(result.pagination.total).toBe(1)
    expect(result.data[0].customerId).toBe('customer-1')
  })

  it('getAll() should filter by tenantId when provided', async () => {
    mockPrisma.loyaltyTransaction.findMany.mockResolvedValue([mockTransaction])
    mockPrisma.loyaltyTransaction.count.mockResolvedValue(1)
    await repository.getAll('customer-1', {
      page: 1,
      size: 20,
      tenantId: 'tenant-1',
    })
    expect(mockPrisma.loyaltyTransaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ tenantId: 'tenant-1' }),
      }),
    )
  })

  it('getAll() should filter by type when provided', async () => {
    mockPrisma.loyaltyTransaction.findMany.mockResolvedValue([mockTransaction])
    mockPrisma.loyaltyTransaction.count.mockResolvedValue(1)
    await repository.getAll('customer-1', {
      page: 1,
      size: 20,
      type: 'EARN',
    })
    expect(mockPrisma.loyaltyTransaction.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ type: 'EARN' }),
      }),
    )
  })

  it('getAll() should throw on db error', async () => {
    mockPrisma.loyaltyTransaction.findMany.mockRejectedValue(
      new Error('db error'),
    )
    await expect(
      repository.getAll('customer-1', { page: 1, size: 20 }),
    ).rejects.toThrow('db error')
  })

  it('create() should create transaction with customerId', async () => {
    mockPrisma.loyaltyTransaction.create.mockResolvedValue(mockTransaction)
    const result = await repository.create('customer-1', {
      tenantId: 'tenant-1',
      type: 'EARN',
      points: 100,
    })
    expect(result).toEqual(mockTransaction)
    expect(mockPrisma.loyaltyTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          customerId: 'customer-1',
          tenantId: 'tenant-1',
          type: 'EARN',
          points: 100,
        }),
      }),
    )
  })

  it('create() should throw on db error', async () => {
    mockPrisma.loyaltyTransaction.create.mockRejectedValue(
      new Error('db error'),
    )
    await expect(
      repository.create('customer-1', {
        tenantId: 'tenant-1',
        type: 'EARN',
        points: 100,
      }),
    ).rejects.toThrow('db error')
  })
})
