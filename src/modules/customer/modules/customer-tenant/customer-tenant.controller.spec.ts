import { Test, TestingModule } from '@nestjs/testing'

import { CustomerTenant } from '@prisma/client'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { PaginationMeta } from '@shared/types/pagination-meta.type'

import { CustomerOwnerGuard } from '@customer/guards/customer-owner.guard'
import { CustomerTenantController } from './customer-tenant.controller'
import { CustomerTenantService } from './customer-tenant.service'

describe(CustomerTenantController.name, () => {
  let controller: CustomerTenantController

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

  const mockService: Pick<
    CustomerTenantService,
    'getAll' | 'create' | 'delete'
  > = {
    getAll: jest.fn().mockResolvedValue({
      data: [mockCustomerTenant],
      pagination: mockMeta,
    }),
    create: jest.fn().mockResolvedValue(mockCustomerTenant),
    delete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerTenantController],
      providers: [{ provide: CustomerTenantService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(CustomerOwnerGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<CustomerTenantController>(CustomerTenantController)
  })

  it('getAll() should return paginated tenants for customer', async () => {
    const query: PaginatedQueryDto = { page: 1, size: 10 }
    const result = await controller.getAll('customer-1', query)
    expect(mockService.getAll).toHaveBeenCalledWith('customer-1', query)
    expect(result.data).toEqual([mockCustomerTenant])
    expect(result.pagination).toEqual(mockMeta)
  })

  it('create() should inject customerId from param', async () => {
    const dto = { tenantId: 'tenant-1' }
    const result = await controller.create('customer-1', dto)
    expect(mockService.create).toHaveBeenCalledWith({
      ...dto,
      customerId: 'customer-1',
    })
    expect(result).toEqual(mockCustomerTenant)
  })

  it('delete() should pass both params to service', async () => {
    const result = await controller.delete('customer-1', 'tenant-1')
    expect(mockService.delete).toHaveBeenCalledWith('customer-1', 'tenant-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
