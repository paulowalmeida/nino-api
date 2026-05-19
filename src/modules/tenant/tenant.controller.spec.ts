import { Test, TestingModule } from '@nestjs/testing'

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { CreateTenantDto } from './dtos/create-tenant.dto'
import { TenantQueryDto } from './dtos/tenant-query.dto'
import { UpdateTenantDto } from './dtos/update-tenant.dto'
import { TenantController } from './tenant.controller'
import { TenantService } from './tenant.service'
import { TenantResponse } from './types/tenant-response.type'

describe(TenantController.name, () => {
  let controller: TenantController
  let service: TenantService

  const mockTenant: Partial<TenantResponse> = {
    id: 'tenant-1',
    slug: 'acme-centro',
    city: 'São Paulo',
    state: 'SP',
  }

  const mockPaginated = {
    data: [mockTenant],
    pagination: { page: 1, size: 10, total: 1, totalPages: 1 },
  }

  const mockService = {
    create: jest.fn(),
    getAll: jest.fn(),
    getById: jest.fn(),
    getBySlug: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantController],
      providers: [{ provide: TenantService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<TenantController>(TenantController)
    service = module.get<TenantService>(TenantService)
  })

  it('create() should create and return tenant', async () => {
    const dto: CreateTenantDto = {
      slug: 'acme-centro',
      companyId: 'company-1',
      statusId: 'status-1',
      typeId: 'type-1',
      zipCode: '01310-100',
      street: 'Av. Paulista',
      number: '1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
    }
    mockService.create.mockResolvedValue(mockTenant)
    const result = await controller.create(dto)
    expect(service.create).toHaveBeenCalledWith(dto)
    expect(result).toEqual(mockTenant)
  })

  it('getAll() should return paginated tenants', async () => {
    mockService.getAll.mockResolvedValue(mockPaginated)
    const query: TenantQueryDto = { page: 1, size: 10 }
    const result = await controller.getAll(query)
    expect(service.getAll).toHaveBeenCalledWith(query)
    expect(result.data).toHaveLength(1)
    expect(result.pagination.total).toBe(1)
  })

  it('getById() should return tenant by id', async () => {
    mockService.getById.mockResolvedValue(mockTenant)
    const result = await controller.getById('tenant-1')
    expect(service.getById).toHaveBeenCalledWith('tenant-1')
    expect(result).toEqual(mockTenant)
  })

  it('getBySlug() should return tenant by slug', async () => {
    mockService.getBySlug.mockResolvedValue(mockTenant)
    const result = await controller.getBySlug('acme-centro')
    expect(service.getBySlug).toHaveBeenCalledWith('acme-centro')
    expect(result).toEqual(mockTenant)
  })

  it('update() should update and return tenant', async () => {
    const dto: UpdateTenantDto = { customName: 'Acme Centro' }
    mockService.update.mockResolvedValue({ ...mockTenant, customName: 'Acme Centro' })
    const result = await controller.update('tenant-1', dto)
    expect(service.update).toHaveBeenCalledWith('tenant-1', dto)
    expect(result.customName).toBe('Acme Centro')
  })

  it('delete() should delete and return success message', async () => {
    const deleteResponse = { message: 'Deleted successfully' }
    mockService.delete.mockResolvedValue(deleteResponse)
    const result = await controller.delete('tenant-1')
    expect(service.delete).toHaveBeenCalledWith('tenant-1')
    expect(result).toEqual(deleteResponse)
  })
})
