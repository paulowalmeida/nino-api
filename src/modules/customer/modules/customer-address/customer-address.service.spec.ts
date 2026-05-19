import { Test, TestingModule } from '@nestjs/testing'

import { CustomerAddress } from '@prisma/client'

import { CustomerAddressRepository } from './customer-address.repository'
import { CustomerAddressService } from './customer-address.service'

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

  const mockRepo: Pick<
    CustomerAddressRepository,
    'getAll' | 'getById' | 'create' | 'update' | 'delete'
  > = {
    getAll: jest.fn().mockResolvedValue([mockAddress]),
    getById: jest.fn().mockResolvedValue(mockAddress),
    create: jest.fn().mockResolvedValue(mockAddress),
    update: jest.fn().mockResolvedValue(mockAddress),
    delete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
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

  it('getAll() should delegate to repository', async () => {
    const result = await service.getAll('customer-1')
    expect(mockRepo.getAll).toHaveBeenCalledWith('customer-1')
    expect(result).toEqual([mockAddress])
  })

  it('getById() should delegate to repository', async () => {
    const result = await service.getById('address-1')
    expect(mockRepo.getById).toHaveBeenCalledWith('address-1')
    expect(result).toEqual(mockAddress)
  })

  it('create() should delegate to repository', async () => {
    const dto = {
      customerId: 'customer-1',
      zipCode: '01310-100',
      street: 'Av. Paulista',
      number: '1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
    }
    const result = await service.create(dto)
    expect(mockRepo.create).toHaveBeenCalledWith(dto)
    expect(result).toEqual(mockAddress)
  })

  it('update() should delegate to repository', async () => {
    const dto = { complement: 'Apto 42' }
    const result = await service.update('address-1', dto)
    expect(mockRepo.update).toHaveBeenCalledWith('address-1', dto)
    expect(result).toEqual(mockAddress)
  })

  it('delete() should delegate to repository', async () => {
    const result = await service.delete('address-1')
    expect(mockRepo.delete).toHaveBeenCalledWith('address-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
