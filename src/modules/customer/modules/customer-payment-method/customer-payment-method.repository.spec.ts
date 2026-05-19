import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

import { CustomerPaymentMethodRepository } from './customer-payment-method.repository'
import { CustomerPaymentMethodFull } from './types/customer-payment-method-full.type'
import { CustomerPaymentMethodResponse } from './types/customer-payment-method-response.type'

describe(CustomerPaymentMethodRepository.name, () => {
  let repository: CustomerPaymentMethodRepository

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
    id: 'cpm-1',
    customerId: 'customer-1',
    gatewayToken: 'tok_xxx',
    brand: 'Visa',
    lastFour: '4242',
    expiresAt: null,
    isDefault: false,
    createdAt: mockFull.createdAt,
    updatedAt: mockFull.updatedAt,
    method: { name: 'Cartão de Crédito', description: null },
  }

  const mockPrisma = {
    customerPaymentMethod: {
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
        CustomerPaymentMethodRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compile()

    repository = module.get<CustomerPaymentMethodRepository>(
      CustomerPaymentMethodRepository,
    )
  })

  afterEach(() => jest.resetAllMocks())

  it('getAll() should return responses without methodId and deletedAt', async () => {
    mockPrisma.customerPaymentMethod.findMany.mockResolvedValue([mockFull])
    const result = await repository.getAll('customer-1')
    expect(result).toHaveLength(1)
    expect(result[0].method).toEqual({ name: 'Cartão de Crédito', description: null })
    expect((result[0] as Record<string, unknown>).methodId).toBeUndefined()
    expect((result[0] as Record<string, unknown>).deletedAt).toBeUndefined()
  })

  it('getAll() should throw on db error', async () => {
    mockPrisma.customerPaymentMethod.findMany.mockRejectedValue(
      new Error('db error'),
    )
    await expect(repository.getAll('customer-1')).rejects.toThrow('db error')
  })

  it('getById() should return response without methodId and deletedAt', async () => {
    mockPrisma.customerPaymentMethod.findFirst.mockResolvedValue(mockFull)
    const result = await repository.getById('cpm-1')
    expect(result.id).toBe('cpm-1')
    expect(result.method).toEqual({ name: 'Cartão de Crédito', description: null })
    expect((result as Record<string, unknown>).methodId).toBeUndefined()
  })

  it('getById() should throw NotFoundException when not found', async () => {
    mockPrisma.customerPaymentMethod.findFirst.mockResolvedValue(null)
    await expect(repository.getById('invalid')).rejects.toThrow(
      NotFoundException,
    )
  })

  it('create() should create with customerId and return response', async () => {
    mockPrisma.customerPaymentMethod.create.mockResolvedValue(mockFull)
    const result = await repository.create('customer-1', {
      methodId: 'method-1',
      gatewayToken: 'tok_xxx',
    })
    expect(result).toEqual(mockResponse)
    expect(mockPrisma.customerPaymentMethod.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          customerId: 'customer-1',
          methodId: 'method-1',
          gatewayToken: 'tok_xxx',
        }),
      }),
    )
  })

  it('create() should throw on db error', async () => {
    mockPrisma.customerPaymentMethod.create.mockRejectedValue(
      new Error('db error'),
    )
    await expect(
      repository.create('customer-1', {
        methodId: 'method-1',
        gatewayToken: 'tok_xxx',
      }),
    ).rejects.toThrow('db error')
  })

  it('update() should update and return response', async () => {
    mockPrisma.customerPaymentMethod.update.mockResolvedValue(mockFull)
    const result = await repository.update('cpm-1', { isDefault: true })
    expect(result.id).toBe('cpm-1')
    expect(result.method).toEqual({ name: 'Cartão de Crédito', description: null })
  })

  it('delete() should soft delete and return success message', async () => {
    mockPrisma.customerPaymentMethod.update.mockResolvedValue({})
    const result = await repository.delete('cpm-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
    expect(mockPrisma.customerPaymentMethod.update).toHaveBeenCalledWith({
      where: { id: 'cpm-1' },
      data: { deletedAt: expect.any(Date) },
    })
  })

  it('delete() should throw on db error', async () => {
    mockPrisma.customerPaymentMethod.update.mockRejectedValue(
      new Error('db error'),
    )
    await expect(repository.delete('cpm-1')).rejects.toThrow('db error')
  })
})
