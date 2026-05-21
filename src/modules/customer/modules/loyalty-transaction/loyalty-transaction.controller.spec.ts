import { Test, TestingModule } from '@nestjs/testing'

import { LoyaltyTransactionType } from '@shared/enums/loyalty-transaction-type.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'

import { CustomerOwnerGuard } from '@customer/guards/customer-owner.guard'
import { LoyaltyTransactionController } from './loyalty-transaction.controller'
import { LoyaltyTransactionService } from './loyalty-transaction.service'
import { LoyaltyTransactionPaginatedResponse } from './types/loyalty-transaction-paginated-response.type'
import { LoyaltyTransactionResponse } from './types/loyalty-transaction-response.type'
import { CreateLoyaltyTransactionDto } from './dtos/create-loyalty-transaction.dto'

describe(LoyaltyTransactionController.name, () => {
  let controller: LoyaltyTransactionController

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

  const mockTransaction: LoyaltyTransactionResponse = {
    id: 'tx-1',
    orderId: null,
    type: 'EARN',
    points: 100,
    description: null,
    createdAt: new Date(),
    tenant: mockTenant,
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
