import { Test, TestingModule } from '@nestjs/testing'

import { CustomerTenant } from '@prisma/client'

import { CustomerTenantRepository } from './customer-tenant.repository'
import { CustomerTenantService } from './customer-tenant.service'

describe(CustomerTenantService.name, () => {
  let service: CustomerTenantService

  const mockCustomerTenant: CustomerTenant = {
    customerId: 'customer-1',
    tenantId: 'tenant-1',
    loyaltyPoints: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockRepo: Pick<
    CustomerTenantRepository,
    'getAll' | 'create' | 'delete'
  > = {
    getAll: jest.fn().mockResolvedValue([mockCustomerTenant]),
    create: jest.fn().mockResolvedValue(mockCustomerTenant),
    delete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerTenantService,
        { provide: CustomerTenantRepository, useValue: mockRepo },
      ],
    }).compile()

    service = module.get<CustomerTenantService>(CustomerTenantService)
  })

  it('getAll() should delegate to repository', async () => {
    const result = await service.getAll('customer-1')
    expect(mockRepo.getAll).toHaveBeenCalledWith('customer-1')
    expect(result).toEqual([mockCustomerTenant])
  })

  it('create() should delegate to repository', async () => {
    const data = { customerId: 'customer-1', tenantId: 'tenant-1' }
    const result = await service.create(data)
    expect(mockRepo.create).toHaveBeenCalledWith(data)
    expect(result).toEqual(mockCustomerTenant)
  })

  it('delete() should delegate to repository', async () => {
    const result = await service.delete('customer-1', 'tenant-1')
    expect(mockRepo.delete).toHaveBeenCalledWith('customer-1', 'tenant-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
