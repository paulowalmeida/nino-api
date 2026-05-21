import { Test, TestingModule } from '@nestjs/testing'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { PaginationMeta } from '@shared/types/pagination-meta.type'

import { TenantPaymentMethodController } from './tenant-payment-method.controller'
import { TenantPaymentMethodService } from './tenant-payment-method.service'
import { TenantPaymentMethodResponse } from './types/tenant-payment-method-response.type'

describe(TenantPaymentMethodController.name, () => {
  let controller: TenantPaymentMethodController

  const mockResponse: TenantPaymentMethodResponse = {
    tenantId: 'tenant-1',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    method: { name: 'Pix', description: null },
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
    TenantPaymentMethodService,
    'getAll' | 'create' | 'update' | 'delete'
  > = {
    getAll: jest
      .fn()
      .mockResolvedValue({ data: [mockResponse], pagination: mockMeta }),
    create: jest.fn().mockResolvedValue(mockResponse),
    update: jest.fn().mockResolvedValue(mockResponse),
    delete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantPaymentMethodController],
      providers: [
        { provide: TenantPaymentMethodService, useValue: mockService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<TenantPaymentMethodController>(
      TenantPaymentMethodController,
    )
  })

  it('getAll() should return paginated payment methods for tenant', async () => {
    const query: PaginatedQueryDto = { page: 1, size: 10 }
    const result = await controller.getAll('tenant-1', query)
    expect(mockService.getAll).toHaveBeenCalledWith('tenant-1', query)
    expect(result.data).toEqual([mockResponse])
    expect(result.pagination).toEqual(mockMeta)
  })

  it('create() should add a payment method to tenant', async () => {
    const dto = { methodId: 'method-1' }
    const result = await controller.create('tenant-1', dto)
    expect(mockService.create).toHaveBeenCalledWith('tenant-1', dto)
    expect(result).toEqual(mockResponse)
  })

  it('update() should toggle isActive', async () => {
    const dto = { isActive: false }
    const result = await controller.update('tenant-1', 'method-1', dto)
    expect(mockService.update).toHaveBeenCalledWith('tenant-1', 'method-1', dto)
    expect(result).toEqual(mockResponse)
  })

  it('delete() should return success message', async () => {
    const result = await controller.delete('tenant-1', 'method-1')
    expect(mockService.delete).toHaveBeenCalledWith('tenant-1', 'method-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
