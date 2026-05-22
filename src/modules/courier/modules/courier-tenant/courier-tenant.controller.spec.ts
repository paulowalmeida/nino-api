import { Test, TestingModule } from '@nestjs/testing'

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { PaginationMeta } from '@shared/types/pagination-meta.type'

import { CourierTenantController } from './courier-tenant.controller'
import { CourierTenantService } from './courier-tenant.service'
import { CreateCourierTenantDto } from './dtos/create-courier-tenant.dto'
import { CourierTenantResponse } from './types/courier-tenant-response.type'

describe(CourierTenantController.name, () => {
  let controller: CourierTenantController

  const now = new Date()

  const mockResponse: Partial<CourierTenantResponse> = {
    isActive: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  }

  const mockMeta: PaginationMeta = {
    total: 1,
    page: 1,
    size: 20,
    totalPages: 1,
    previousPage: null,
    nextPage: null,
  }

  const mockService: Pick<
    CourierTenantService,
    'create' | 'getByCourierId' | 'getByTenantId' | 'delete'
  > = {
    create: jest.fn().mockResolvedValue(mockResponse),
    getByCourierId: jest
      .fn()
      .mockResolvedValue({ data: [mockResponse], pagination: mockMeta }),
    getByTenantId: jest
      .fn()
      .mockResolvedValue({ data: [mockResponse], pagination: mockMeta }),
    delete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourierTenantController],
      providers: [{ provide: CourierTenantService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<CourierTenantController>(CourierTenantController)
  })

  it('create() should call service.create and return response', async () => {
    const dto: CreateCourierTenantDto = {
      courierId: 'courier-1',
      tenantId: 'tenant-1',
    }
    const result = await controller.create(dto)
    expect(mockService.create).toHaveBeenCalledWith(dto)
    expect(result).toEqual(mockResponse)
  })

  it('getByCourierId() should return paginated response', async () => {
    const result = await controller.getByCourierId('courier-1', {})
    expect(mockService.getByCourierId).toHaveBeenCalledWith('courier-1', {})
    expect(result.data).toEqual([mockResponse])
  })

  it('getByTenantId() should return paginated response', async () => {
    const result = await controller.getByTenantId('tenant-1', {})
    expect(mockService.getByTenantId).toHaveBeenCalledWith('tenant-1', {})
    expect(result.data).toEqual([mockResponse])
  })

  it('delete() should call service.delete and return message', async () => {
    const result = await controller.delete('courier-1', 'tenant-1')
    expect(mockService.delete).toHaveBeenCalledWith('courier-1', 'tenant-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
