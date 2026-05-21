import { Test, TestingModule } from '@nestjs/testing'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { PaginationMeta } from '@shared/types/pagination-meta.type'

import { CustomerPaymentMethodRepository } from './customer-payment-method.repository'
import { CustomerPaymentMethodService } from './customer-payment-method.service'
import { CustomerPaymentMethodFull } from './types/customer-payment-method-full.type'
import { CustomerPaymentMethodResponse } from './types/customer-payment-method-response.type'

describe(CustomerPaymentMethodService.name, () => {
  let service: CustomerPaymentMethodService

  const mockMethod = {
    id: 'method-1',
    name: 'Cartão de Crédito',
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockFull: CustomerPaymentMethodFull = {
    id: 'cpm-1',
    customerId: 'customer-1',
    methodId: 'method-1',
    gatewayToken: 'tok_xxx',
    brand: 'Visa',
    lastFour: '4242',
    expiresAt: null,
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    method: mockMethod,
  }

  const mockResponse: CustomerPaymentMethodResponse = {
    id: mockFull.id,
    customerId: mockFull.customerId,
    gatewayToken: mockFull.gatewayToken,
    brand: mockFull.brand,
    lastFour: mockFull.lastFour,
    expiresAt: mockFull.expiresAt,
    isDefault: mockFull.isDefault,
    createdAt: mockFull.createdAt,
    updatedAt: mockFull.updatedAt,
    method: { name: 'Cartão de Crédito', description: null },
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
    CustomerPaymentMethodRepository,
    'findAllPaginated' | 'findItem' | 'insert' | 'updateItem' | 'softDelete'
  > = {
    findAllPaginated: jest.fn(),
    findItem: jest.fn().mockResolvedValue(mockFull),
    insert: jest.fn().mockResolvedValue(mockFull),
    updateItem: jest.fn().mockResolvedValue(mockFull),
    softDelete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerPaymentMethodService,
        { provide: CustomerPaymentMethodRepository, useValue: mockRepo },
      ],
    }).compile()

    service = module.get<CustomerPaymentMethodService>(
      CustomerPaymentMethodService,
    )
  })

  it('getAll() should return paginated payment methods for customer', async () => {
    ;(mockRepo.findAllPaginated as jest.Mock).mockResolvedValue({
      data: [mockFull],
      pagination: mockMeta,
    })
    const query: PaginatedQueryDto = { page: 1, size: 10 }
    const result = await service.getAll('customer-1', query)
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith({
      where: { customerId: 'customer-1' },
      order: { target: 'createdAt', direction: 'asc' },
      include,
      page: 1,
      size: 10,
    })
    expect(result.data).toEqual([mockResponse])
    expect(result.pagination).toEqual(mockMeta)
  })

  it('getById() should call findItem with id and include', async () => {
    const result = await service.getById('cpm-1')
    expect(mockRepo.findItem).toHaveBeenCalledWith({
      where: { id: 'cpm-1' },
      include,
    })
    expect(result).toEqual(mockResponse)
  })

  it('create() should call insert with include and return mapped response', async () => {
    const data = {
      methodId: 'method-1',
      gatewayToken: 'tok_xxx',
      customerId: 'customer-1',
    }
    const result = await service.create(data)
    expect(mockRepo.insert).toHaveBeenCalledWith({ data, include })
    expect(result).toEqual(mockResponse)
  })

  it('update() should call updateItem with include and return mapped response', async () => {
    const dto = { isDefault: true }
    const result = await service.update('cpm-1', dto)
    expect(mockRepo.updateItem).toHaveBeenCalledWith({
      where: { id: 'cpm-1' },
      data: dto,
      include,
    })
    expect(result).toEqual(mockResponse)
  })

  it('delete() should call softDelete with id object', async () => {
    const result = await service.delete('cpm-1')
    expect(mockRepo.softDelete).toHaveBeenCalledWith({ id: 'cpm-1' })
    expect(result).toEqual({ message: 'Deleted successfully' })
  })

  it('toResponse() should strip methodId and deletedAt', async () => {
    ;(mockRepo.findItem as jest.Mock).mockResolvedValue(mockFull)
    const result = await service.getById('cpm-1')
    expect((result as Record<string, unknown>).methodId).toBeUndefined()
    expect((result as Record<string, unknown>).deletedAt).toBeUndefined()
  })
})
