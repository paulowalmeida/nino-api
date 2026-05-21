import { Test, TestingModule } from '@nestjs/testing'

import { CustomerTenant } from '@prisma/client'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { PaginationMeta } from '@shared/types/pagination-meta.type'

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

  const mockMeta: PaginationMeta = {
    total: 1,
    page: 1,
    size: 10,
    totalPages: 1,
    previousPage: null,
    nextPage: null,
  }

  const mockRepo: Pick<
    CustomerTenantRepository,
    'findAllPaginated' | 'insert' | 'softDelete'
  > = {
    findAllPaginated: jest.fn(),
    insert: jest.fn().mockResolvedValue(mockCustomerTenant),
    softDelete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
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

  it('getAll() should return paginated tenants for customer', async () => {
    ;(mockRepo.findAllPaginated as jest.Mock).mockResolvedValue({
      data: [mockCustomerTenant],
      pagination: mockMeta,
    })
    const query: PaginatedQueryDto = { page: 1, size: 10 }
    const result = await service.getAll('customer-1', query)
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith({
      where: { customerId: 'customer-1' },
      order: { target: 'createdAt', direction: 'asc' },
      page: 1,
      size: 10,
    })
    expect(result.data).toEqual([mockCustomerTenant])
    expect(result.pagination).toEqual(mockMeta)
  })

  it('create() should call insert with data', async () => {
    const data = { customerId: 'customer-1', tenantId: 'tenant-1' }
    const result = await service.create(data)
    expect(mockRepo.insert).toHaveBeenCalledWith({ data })
    expect(result).toEqual(mockCustomerTenant)
  })

  it('delete() should call softDelete with composite key', async () => {
    const result = await service.delete('customer-1', 'tenant-1')
    expect(mockRepo.softDelete).toHaveBeenCalledWith({
      customerId_tenantId: { customerId: 'customer-1', tenantId: 'tenant-1' },
    })
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
