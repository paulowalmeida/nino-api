import { Test, TestingModule } from '@nestjs/testing'

import { LoyaltyTransaction } from '@prisma/client'

import { LoyaltyTransactionType } from '@shared/enums/loyalty-transaction-type.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'

import { CustomerOwnerGuard } from '@customer/guards/customer-owner.guard'
import { LoyaltyTransactionController } from './loyalty-transaction.controller'
import { LoyaltyTransactionService } from './loyalty-transaction.service'
import { LoyaltyTransactionPaginatedResponse } from './types/loyalty-transaction-paginated-response.type'
import { CreateLoyaltyTransactionDto } from './dtos/create-loyalty-transaction.dto'

describe(LoyaltyTransactionController.name, () => {
  let controller: LoyaltyTransactionController

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
    pagination: {
      total: 1,
      page: 1,
      size: 20,
      totalPages: 1,
      previousPage: null,
      nextPage: null,
    },
  }

  const mockService: Pick<LoyaltyTransactionService, 'getAll' | 'create'> = {
    getAll: jest.fn().mockResolvedValue(mockPaginated),
    create: jest.fn().mockResolvedValue(mockTransaction),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoyaltyTransactionController],
      providers: [
        { provide: LoyaltyTransactionService, useValue: mockService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(CustomerOwnerGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<LoyaltyTransactionController>(
      LoyaltyTransactionController,
    )
  })

  it('getAll() should return paginated transactions', async () => {
    const query = { page: 1, size: 20 }
    const result = await controller.getAll('customer-1', query)
    expect(mockService.getAll).toHaveBeenCalledWith('customer-1', query)
    expect(result).toEqual(mockPaginated)
  })

  it('create() should create a loyalty transaction', async () => {
    const dto: CreateLoyaltyTransactionDto = {
      tenantId: 'tenant-1',
      type: LoyaltyTransactionType.EARN,
      points: 100,
    }
    const result = await controller.create('customer-1', dto)
    expect(mockService.create).toHaveBeenCalledWith('customer-1', dto)
    expect(result).toEqual(mockTransaction)
  })
})
