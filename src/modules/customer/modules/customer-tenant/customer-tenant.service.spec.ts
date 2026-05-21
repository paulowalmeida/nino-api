import { Test, TestingModule } from '@nestjs/testing'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { PaginationMeta } from '@shared/types/pagination-meta.type'

import { CustomerTenantRepository } from './customer-tenant.repository'
import { CustomerTenantService } from './customer-tenant.service'
import { CustomerTenantFull } from './types/customer-tenant-full.type'
import { CustomerTenantResponse } from './types/customer-tenant-response.type'

describe(CustomerTenantService.name, () => {
  let service: CustomerTenantService

  const mockTenant = {
    id: 'tenant-1',
    customName: null,
    slug: 'tenant-1',
    logoUrl: null,
    favicon: null,
    primaryColor: null,
    secondaryColor: null,
    customDomain: null,
    companyId: 'company-1',
    statusId: 'status-1',
    typeId: 'type-1',
    timezone: 'America/Sao_Paulo',
    zipCode: '01310-100',
    street: 'Av. Paulista',
    number: '1000',
    complement: null,
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    country: 'BR',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockCustomerTenantFull: CustomerTenantFull = {
    customerId: 'customer-1',
    tenantId: 'tenant-1',
    loyaltyPoints: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    tenant: mockTenant,
  }

  const mockCustomerTenant: CustomerTenantResponse = {
    loyaltyPoints: 0,
    createdAt: mockCustomerTenantFull.createdAt,
    updatedAt: mockCustomerTenantFull.updatedAt,
    deletedAt: null,
    tenant: mockTenant,
  }

  const mockMeta: PaginationMeta = {
    total: 1,
    page: 1,
    size: 10,
    totalPages: 1,
    previousPage: null,
    nextPage: null,
  }

  const include = { tenant: true }

  const mockRepo: Pick<
    CustomerTenantRepository,
    'findAllPaginated' | 'insert' | 'softDelete'
  > = {
    findAllPaginated: jest.fn(),
    insert: jest.fn().mockResolvedValue(mockCustomerTenantFull),
    softDelete: jest
      .fn()
      .mockResolvedValue({ message: 'Deleted successfully' }),
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

  it('getAll() should call findAllPaginated with include and return mapped response', async () => {
    ;(mockRepo.findAllPaginated as jest.Mock).mockResolvedValue({
      data: [mockCustomerTenantFull],
      pagination: mockMeta,
    })
    const query: PaginatedQueryDto = { page: 1, size: 10 }
    const result = await service.getAll('customer-1', query)
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith({
      where: { customerId: 'customer-1' },
      order: { target: 'createdAt', direction: 'asc' },
      page: 1,
      size: 10,
      include,
    })
    expect(result.data).toEqual([mockCustomerTenant])
    expect(result.pagination).toEqual(mockMeta)
  })

  it('create() should call insert with include and return mapped response', async () => {
    const data = { customerId: 'customer-1', tenantId: 'tenant-1' }
    const result = await service.create(data)
    expect(mockRepo.insert).toHaveBeenCalledWith({ data, include })
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
