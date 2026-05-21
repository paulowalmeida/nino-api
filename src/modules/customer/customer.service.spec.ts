import { Test, TestingModule } from '@nestjs/testing'

import { PaginationMeta } from '@shared/types/pagination-meta.type'

import { CustomerRepository } from './customer.repository'
import { CustomerService } from './customer.service'
import { CreateCustomerDto } from './dtos/create-customer.dto'
import { UpdateCustomerDto } from './dtos/update-customer.dto'
import { CustomerFull } from './types/customer-full.type'
import { CustomerPaginatedResponse } from './types/customer-paginated-response.type'
import { CustomerResponse } from './types/customer-response.type'

describe(CustomerService.name, () => {
  let service: CustomerService

  const mockUser = {
    id: 'user-1',
    name: 'João',
    phone: '11999999999',
    globalRoleId: 'role-1',
    isActive: true,
    lastLoginAt: null,
    locale: null,
    timezone: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockCustomerFull: CustomerFull = {
    id: 'customer-1',
    userId: 'user-1',
    cpf: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    user: mockUser,
  }

  const mockResponse: CustomerResponse = {
    id: mockCustomerFull.id,
    cpf: mockCustomerFull.cpf,
    createdAt: mockCustomerFull.createdAt,
    updatedAt: mockCustomerFull.updatedAt,
    user: { name: 'João', phone: '11999999999' },
  }

  const mockMeta: PaginationMeta = {
    total: 1,
    page: 1,
    size: 10,
    totalPages: 1,
    previousPage: null,
    nextPage: null,
  }

  const mockPaginated: CustomerPaginatedResponse = {
    data: [mockResponse],
    pagination: mockMeta,
  }

  const include = { user: true } as const

  const mockRepo: Pick<
    CustomerRepository,
    'findAllPaginated' | 'findItem' | 'insert' | 'updateItem' | 'softDelete'
  > = {
    findAllPaginated: jest
      .fn()
      .mockResolvedValue({ data: [mockCustomerFull], pagination: mockMeta }),
    findItem: jest.fn().mockResolvedValue(mockCustomerFull),
    insert: jest.fn().mockResolvedValue(mockCustomerFull),
    updateItem: jest.fn().mockResolvedValue(mockCustomerFull),
    softDelete: jest
      .fn()
      .mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        { provide: CustomerRepository, useValue: mockRepo },
      ],
    }).compile()

    service = module.get<CustomerService>(CustomerService)
  })

  it('getAll() should call findAllPaginated with include and defaults', async () => {
    const result = await service.getAll({ page: 1, size: 10 })
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith({
      page: 1,
      size: 10,
      order: { target: 'createdAt', direction: 'asc' },
      include,
    })
    expect(result).toEqual(mockPaginated)
  })

  it('getAll() should use default ordering when target/direction omitted', async () => {
    await service.getAll({})
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith({
      page: undefined,
      size: undefined,
      order: { target: 'createdAt', direction: 'asc' },
      include,
    })
  })

  it('getById() should call findItem and return mapped response', async () => {
    const result = await service.getById('customer-1')
    expect(mockRepo.findItem).toHaveBeenCalledWith({
      where: { id: 'customer-1' },
      include,
    })
    expect(result).toEqual(mockResponse)
  })

  it('create() should call insert and return mapped response', async () => {
    const dto: CreateCustomerDto = { userId: 'user-1' }
    const result = await service.create(dto)
    expect(mockRepo.insert).toHaveBeenCalledWith({ data: dto, include })
    expect(result).toEqual(mockResponse)
  })

  it('update() should call updateItem and return mapped response', async () => {
    const dto: UpdateCustomerDto = { cpf: '12345678900' }
    const result = await service.update('customer-1', dto)
    expect(mockRepo.updateItem).toHaveBeenCalledWith({
      where: { id: 'customer-1' },
      data: dto,
      include,
    })
    expect(result).toEqual(mockResponse)
  })

  it('delete() should call softDelete with id object', async () => {
    const result = await service.delete('customer-1')
    expect(mockRepo.softDelete).toHaveBeenCalledWith({ id: 'customer-1' })
    expect(result).toEqual({ message: 'Deleted successfully' })
  })

  it('toResponse() should strip userId and deletedAt', async () => {
    const result = await service.getById('customer-1')
    expect((result as Record<string, unknown>).userId).toBeUndefined()
    expect((result as Record<string, unknown>).deletedAt).toBeUndefined()
  })
})
