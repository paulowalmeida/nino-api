import { Test, TestingModule } from '@nestjs/testing'

import { CustomerTenant } from '@prisma/client'

import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

import { CustomerTenantRepository } from './customer-tenant.repository'

describe(CustomerTenantRepository.name, () => {
  let repository: CustomerTenantRepository

  const mockCustomerTenant: CustomerTenant = {
    customerId: 'customer-1',
    tenantId: 'tenant-1',
    loyaltyPoints: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockPrisma = {
    customerTenant: {
      findMany: jest.fn(),
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
        CustomerTenantRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compile()

    repository = module.get<CustomerTenantRepository>(CustomerTenantRepository)
  })

  afterEach(() => jest.resetAllMocks())

  it('getAll() should return tenants for a customer', async () => {
    mockPrisma.customerTenant.findMany.mockResolvedValue([mockCustomerTenant])
    const result = await repository.getAll('customer-1')
    expect(result).toHaveLength(1)
    expect(result[0].customerId).toBe('customer-1')
  })

  it('getAll() should throw on db error', async () => {
    mockPrisma.customerTenant.findMany.mockRejectedValue(new Error('db error'))
    await expect(repository.getAll('customer-1')).rejects.toThrow('db error')
  })

  it('create() should create a customer-tenant link', async () => {
    mockPrisma.customerTenant.create.mockResolvedValue(mockCustomerTenant)
    const result = await repository.create({
      customerId: 'customer-1',
      tenantId: 'tenant-1',
    })
    expect(result).toEqual(mockCustomerTenant)
    expect(mockPrisma.customerTenant.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          customerId: 'customer-1',
          tenantId: 'tenant-1',
        }),
      }),
    )
  })

  it('create() should throw on db error', async () => {
    mockPrisma.customerTenant.create.mockRejectedValue(new Error('db error'))
    await expect(
      repository.create({ customerId: 'customer-1', tenantId: 'tenant-1' }),
    ).rejects.toThrow('db error')
  })

  it('delete() should soft delete using composite key', async () => {
    mockPrisma.customerTenant.update.mockResolvedValue({})
    const result = await repository.delete('customer-1', 'tenant-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
    expect(mockPrisma.customerTenant.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          customerId_tenantId: {
            customerId: 'customer-1',
            tenantId: 'tenant-1',
          },
        },
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      }),
    )
  })

  it('delete() should throw on db error', async () => {
    mockPrisma.customerTenant.update.mockRejectedValue(new Error('db error'))
    await expect(
      repository.delete('customer-1', 'tenant-1'),
    ).rejects.toThrow('db error')
  })
})
