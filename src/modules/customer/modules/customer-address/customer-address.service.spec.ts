import { Test, TestingModule } from '@nestjs/testing'

import { CustomerAddress } from '@prisma/client'

import { PaginationMeta } from '@shared/types/pagination-meta.type'
import { PaginatedResponse } from '@shared/types/paginated-response.type'

import { CustomerAddressRepository } from './customer-address.repository'
import { CustomerAddressService } from './customer-address.service'
import { CreateCustomerAddressDto } from './dtos/create-customer-address.dto'
import { UpdateCustomerAddressDto } from './dtos/update-customer-address.dto'

describe(CustomerAddressService.name, () => {
  let service: CustomerAddressService

  const mockAddress: CustomerAddress = {
    id: 'address-1',
    customerId: 'customer-1',
    zipCode: '01310-100',
    street: 'Av. Paulista',
    number: '1000',
    complement: null,
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    country: 'BR',
    isPrimary: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockMeta: PaginationMeta = {
    total: 1,
    page: 1,
    size: 10,
    totalPages: 1,
    previousPage: null,
    nextPage: null,
  }

  const mockPaginated: PaginatedResponse<CustomerAddress> = {
    data: [mockAddress],
    pagination: mockMeta,
  }

  const mockRepo: Pick<
    CustomerAddressRepository,
    'findAllPaginated' | 'findItem' | 'insert' | 'updateItem' | 'softDelete'
  > = {
    findAllPaginated: jest.fn().mockResolvedValue(mockPaginated),
    findItem: jest.fn().mockResolvedValue(mockAddress),
    insert: jest.fn().mockResolvedValue(mockAddress),
    updateItem: jest.fn().mockResolvedValue(mockAddress),
    softDelete: jest
      .fn()
      .mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerAddressService,
        { provide: CustomerAddressRepository, useValue: mockRepo },
      ],
    }).compile()

    service = module.get<CustomerAddressService>(CustomerAddressService)
  })

  const baseDto: Omit<CreateCustomerAddressDto, 'isPrimary'> = {
    customerId: 'customer-1',
    zipCode: '01310-100',
    street: 'Av. Paulista',
    number: '1000',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
  }

  it('getAll() should call findAllPaginated with customerId and defaults', async () => {
    const result = await service.getAll('customer-1', { page: 1, size: 10 })
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith({
      page: 1,
      size: 10,
      order: { target: 'createdAt', direction: 'asc' },
      where: { customerId: 'customer-1' },
    })
    expect(result).toEqual(mockPaginated)
  })

  it('getById() should call findItem with id', async () => {
    const result = await service.getById('address-1')
    expect(mockRepo.findItem).toHaveBeenCalledWith({
      where: { id: 'address-1' },
    })
    expect(result).toEqual(mockAddress)
  })

  it('create() should normalize isPrimary true → true', async () => {
    const dto: CreateCustomerAddressDto = { ...baseDto, isPrimary: true }
    await service.create(dto)
    expect(mockRepo.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ isPrimary: true }),
      }),
    )
  })

  it('create() should normalize isPrimary false → null', async () => {
    const dto: CreateCustomerAddressDto = { ...baseDto, isPrimary: false }
    await service.create(dto)
    expect(mockRepo.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ isPrimary: null }),
      }),
    )
  })

  it('create() should normalize isPrimary undefined → null', async () => {
    await service.create(baseDto)
    expect(mockRepo.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ isPrimary: null }),
      }),
    )
  })

  it('update() should normalize isPrimary false → null', async () => {
    const dto: UpdateCustomerAddressDto = { isPrimary: false }
    await service.update('address-1', dto)
    expect(mockRepo.updateItem).toHaveBeenCalledWith({
      where: { id: 'address-1' },
      data: expect.objectContaining({ isPrimary: null }),
    })
  })

  it('update() should leave isPrimary undefined when not provided', async () => {
    const dto: UpdateCustomerAddressDto = { complement: 'Apto 42' }
    await service.update('address-1', dto)
    expect(mockRepo.updateItem).toHaveBeenCalledWith({
      where: { id: 'address-1' },
      data: expect.objectContaining({ isPrimary: undefined }),
    })
  })

  it('delete() should call softDelete with id object', async () => {
    const result = await service.delete('address-1')
    expect(mockRepo.softDelete).toHaveBeenCalledWith({ id: 'address-1' })
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
