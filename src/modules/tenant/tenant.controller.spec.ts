import { Test, TestingModule } from '@nestjs/testing'

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { PaginationMeta } from '@shared/types/pagination-meta.type'

import { CreateTenantDto } from './dtos/create-tenant.dto'
import { UpdateTenantDto } from './dtos/update-tenant.dto'
import { TenantController } from './tenant.controller'
import { TenantService } from './tenant.service'
import { TenantResponse } from './types/tenant-response.type'

describe(TenantController.name, () => {
  let controller: TenantController

  const mockTenant = {
    id: 'tenant-1',
    slug: 'acme-centro',
    city: 'São Paulo',
    state: 'SP',
    status: { name: 'ACTIVE' },
    type: { name: 'RESTAURANT' },
    company: { name: 'Acme' },
  } as unknown as TenantResponse

  const mockMeta: PaginationMeta = {
    total: 1,
    page: 1,
    size: 10,
    totalPages: 1,
    previousPage: null,
    nextPage: null,
  }

  const mockService: Pick<
    TenantService,
    'create' | 'getAll' | 'getById' | 'getBySlug' | 'update' | 'delete'
  > = {
    create: jest.fn().mockResolvedValue(mockTenant),
    getAll: jest
      .fn()
      .mockResolvedValue({ data: [mockTenant], pagination: mockMeta }),
    getById: jest.fn().mockResolvedValue(mockTenant),
    getBySlug: jest.fn().mockResolvedValue(mockTenant),
    update: jest.fn().mockResolvedValue(mockTenant),
    delete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
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
    const result = await controller.create(dto)
    expect(mockService.create).toHaveBeenCalledWith(dto)
    expect(result).toEqual(mockTenant)
  })

  it('getAll() should return paginated tenants', async () => {
    const query = { page: 1, size: 10 }
    const result = await controller.getAll(query as never)
    expect(mockService.getAll).toHaveBeenCalledWith(query)
    expect(result.data).toEqual([mockTenant])
    expect(result.pagination).toEqual(mockMeta)
  })

  it('getById() should return tenant by id', async () => {
    const result = await controller.getById('tenant-1')
    expect(mockService.getById).toHaveBeenCalledWith('tenant-1')
    expect(result).toEqual(mockTenant)
  })

  it('getBySlug() should return tenant by slug', async () => {
    const result = await controller.getBySlug('acme-centro')
    expect(mockService.getBySlug).toHaveBeenCalledWith('acme-centro')
    expect(result).toEqual(mockTenant)
  })

  it('update() should update and return tenant', async () => {
    const dto: UpdateTenantDto = { customName: 'Acme Centro' }
    const result = await controller.update('tenant-1', dto)
    expect(mockService.update).toHaveBeenCalledWith('tenant-1', dto)
    expect(result).toEqual(mockTenant)
  })

  it('delete() should return success message', async () => {
    const result = await controller.delete('tenant-1')
    expect(mockService.delete).toHaveBeenCalledWith('tenant-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
