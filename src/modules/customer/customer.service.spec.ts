import { Test, TestingModule } from '@nestjs/testing'

import { CustomerRepository } from './customer.repository'
import { CustomerService } from './customer.service'
import { CustomerPaginatedResponse } from './types/customer-paginated-response.type'
import { CustomerResponse } from './types/customer-response.type'

describe(CustomerService.name, () => {
  let service: CustomerService

  const mockResponse: CustomerResponse = {
    id: 'customer-1',
    cpf: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: { name: 'João', phone: '11999999999' },
  }

  const mockPaginated: CustomerPaginatedResponse = {
    data: [mockResponse],
    pagination: { total: 1, page: 1, size: 10, pages: 1 },
  }

  const mockRepo: Pick<
    CustomerRepository,
    'getAll' | 'getById' | 'create' | 'update' | 'delete'
  > = {
    getAll: jest.fn().mockResolvedValue(mockPaginated),
    getById: jest.fn().mockResolvedValue(mockResponse),
    create: jest.fn().mockResolvedValue(mockResponse),
    update: jest.fn().mockResolvedValue(mockResponse),
    delete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
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

  it('getAll() should delegate to repository', async () => {
    const query = { page: 1, size: 10 }
    const result = await service.getAll(query)
    expect(mockRepo.getAll).toHaveBeenCalledWith(query)
    expect(result).toEqual(mockPaginated)
  })

  it('getById() should delegate to repository', async () => {
    const result = await service.getById('customer-1')
    expect(mockRepo.getById).toHaveBeenCalledWith('customer-1')
    expect(result).toEqual(mockResponse)
  })

  it('create() should delegate to repository', async () => {
    const dto = { userId: 'user-1' }
    const result = await service.create(dto)
    expect(mockRepo.create).toHaveBeenCalledWith(dto)
    expect(result).toEqual(mockResponse)
  })

  it('update() should delegate to repository', async () => {
    const dto = { cpf: '12345678900' }
    const result = await service.update('customer-1', dto)
    expect(mockRepo.update).toHaveBeenCalledWith('customer-1', dto)
    expect(result).toEqual(mockResponse)
  })

  it('delete() should delegate to repository', async () => {
    const result = await service.delete('customer-1')
    expect(mockRepo.delete).toHaveBeenCalledWith('customer-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
