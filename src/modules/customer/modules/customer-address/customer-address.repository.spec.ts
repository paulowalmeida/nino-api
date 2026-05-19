import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { CustomerAddress } from '@prisma/client'

import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

import { CustomerAddressRepository } from './customer-address.repository'

describe(CustomerAddressRepository.name, () => {
  let repository: CustomerAddressRepository

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

  const mockPrisma = {
    customerAddress: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
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
        CustomerAddressRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compile()

    repository = module.get<CustomerAddressRepository>(
      CustomerAddressRepository,
    )
  })

  afterEach(() => jest.resetAllMocks())

  it('getAll() should return addresses for a customer', async () => {
    mockPrisma.customerAddress.findMany.mockResolvedValue([mockAddress])
    const result = await repository.getAll('customer-1')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('address-1')
  })

  it('getAll() should throw on db error', async () => {
    mockPrisma.customerAddress.findMany.mockRejectedValue(new Error('db error'))
    await expect(repository.getAll('customer-1')).rejects.toThrow('db error')
  })

  it('getById() should return address by id', async () => {
    mockPrisma.customerAddress.findFirst.mockResolvedValue(mockAddress)
    const result = await repository.getById('address-1')
    expect(result.id).toBe('address-1')
  })

  it('getById() should throw NotFoundException when not found', async () => {
    mockPrisma.customerAddress.findFirst.mockResolvedValue(null)
    await expect(repository.getById('invalid')).rejects.toThrow(
      NotFoundException,
    )
  })

  it('create() should store isPrimary as true when true', async () => {
    mockPrisma.customerAddress.create.mockResolvedValue(mockAddress)
    await repository.create({
      customerId: 'customer-1',
      zipCode: '01310-100',
      street: 'Av. Paulista',
      number: '1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      isPrimary: true,
    })
    expect(mockPrisma.customerAddress.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ isPrimary: true }),
      }),
    )
  })

  it('create() should store isPrimary as null when false', async () => {
    mockPrisma.customerAddress.create.mockResolvedValue(mockAddress)
    await repository.create({
      customerId: 'customer-1',
      zipCode: '01310-100',
      street: 'Av. Paulista',
      number: '1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      isPrimary: false,
    })
    expect(mockPrisma.customerAddress.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ isPrimary: null }),
      }),
    )
  })

  it('create() should store isPrimary as null when undefined', async () => {
    mockPrisma.customerAddress.create.mockResolvedValue(mockAddress)
    await repository.create({
      customerId: 'customer-1',
      zipCode: '01310-100',
      street: 'Av. Paulista',
      number: '1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
    })
    expect(mockPrisma.customerAddress.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ isPrimary: null }),
      }),
    )
  })

  it('update() should normalize isPrimary false to null', async () => {
    mockPrisma.customerAddress.update.mockResolvedValue(mockAddress)
    await repository.update('address-1', { isPrimary: false })
    expect(mockPrisma.customerAddress.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ isPrimary: null }),
      }),
    )
  })

  it('delete() should soft delete and return success message', async () => {
    mockPrisma.customerAddress.update.mockResolvedValue({})
    const result = await repository.delete('address-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
    expect(mockPrisma.customerAddress.update).toHaveBeenCalledWith({
      where: { id: 'address-1' },
      data: { deletedAt: expect.any(Date) },
    })
  })

  it('delete() should throw on db error', async () => {
    mockPrisma.customerAddress.update.mockRejectedValue(new Error('db error'))
    await expect(repository.delete('address-1')).rejects.toThrow('db error')
  })
})
