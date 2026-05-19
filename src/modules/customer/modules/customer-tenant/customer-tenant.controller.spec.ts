import { Test, TestingModule } from '@nestjs/testing'

import { CustomerTenant } from '@prisma/client'

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'

import { CustomerOwnerGuard } from '../../guards/customer-owner.guard'
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

  const mockService: Pick<
    CustomerTenantService,
    'getAll' | 'create' | 'delete'
  > = {
    getAll: jest.fn().mockResolvedValue([mockCustomerTenant]),
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

  it('getAll() should return tenant list for customer', async () => {
    const result = await controller.getAll('customer-1')
    expect(mockService.getAll).toHaveBeenCalledWith('customer-1')
    expect(result).toEqual([mockCustomerTenant])
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
