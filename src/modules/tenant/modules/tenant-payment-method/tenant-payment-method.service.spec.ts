import { Test, TestingModule } from '@nestjs/testing'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { PaginationMeta } from '@shared/types/pagination-meta.type'

import { TenantPaymentMethodRepository } from './tenant-payment-method.repository'
import { TenantPaymentMethodService } from './tenant-payment-method.service'
import { TenantPaymentMethodFull } from './types/tenant-payment-method-full.type'
import { TenantPaymentMethodResponse } from './types/tenant-payment-method-response.type'

describe(TenantPaymentMethodService.name, () => {
  let service: TenantPaymentMethodService

  const mockFull: TenantPaymentMethodFull = {
    tenantId: 'tenant-1',
    methodId: 'method-1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    method: {
      id: 'method-1',
      name: 'Pix',
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
  }

  const mockResponse: TenantPaymentMethodResponse = {
    tenantId: 'tenant-1',
    isActive: true,
    createdAt: mockFull.createdAt,
    updatedAt: mockFull.updatedAt,
    method: { name: 'Pix', description: null },
  }

  const mockMeta: PaginationMeta = {
    total: 1,
    page: 1,
    size: 10,
    totalPages: 1,
    previousPage: null,
    nextPage: null,
  }

  const include = { method: true } as const

  const mockRepo: Pick<
    TenantPaymentMethodRepository,
    'findAllPaginated' | 'insert' | 'updateItem' | 'softDelete'
  > = {
    findAllPaginated: jest.fn(),
    insert: jest.fn().mockResolvedValue(mockFull),
    updateItem: jest.fn().mockResolvedValue(mockFull),
    softDelete: jest
      .fn()
      .mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantPaymentMethodService,
        { provide: TenantPaymentMethodRepository, useValue: mockRepo },
      ],
    }).compile()

    service = module.get<TenantPaymentMethodService>(TenantPaymentMethodService)
  })

  it('getAll() should return paginated payment methods', async () => {
    ;(mockRepo.findAllPaginated as jest.Mock).mockResolvedValue({
      data: [mockFull],
      pagination: mockMeta,
    })
    const query: PaginatedQueryDto = { page: 1, size: 10 }
    const result = await service.getAll('tenant-1', query)
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith({
      where: { tenantId: 'tenant-1' },
      order: { target: 'createdAt', direction: 'asc' },
      include,
      page: 1,
      size: 10,
    })
    expect(result.data).toEqual([mockResponse])
    expect(result.pagination).toEqual(mockMeta)
  })

  it('create() should insert and return mapped response', async () => {
    const dto = { methodId: 'method-1' }
    const result = await service.create('tenant-1', dto)
    expect(mockRepo.insert).toHaveBeenCalledWith({
      data: { methodId: 'method-1', tenantId: 'tenant-1' },
      include,
    })
    expect(result).toEqual(mockResponse)
  })

  it('update() should update via composite key and return mapped response', async () => {
    const dto = { isActive: false }
    const result = await service.update('tenant-1', 'method-1', dto)
    expect(mockRepo.updateItem).toHaveBeenCalledWith({
      where: {
        tenantId_methodId: { tenantId: 'tenant-1', methodId: 'method-1' },
      },
      data: dto,
      include,
    })
    expect(result).toEqual(mockResponse)
  })

  it('delete() should softDelete via composite key', async () => {
    const result = await service.delete('tenant-1', 'method-1')
    expect(mockRepo.softDelete).toHaveBeenCalledWith({
      tenantId_methodId: { tenantId: 'tenant-1', methodId: 'method-1' },
    })
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
