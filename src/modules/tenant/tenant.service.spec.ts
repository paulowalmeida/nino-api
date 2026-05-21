import { Test, TestingModule } from '@nestjs/testing'

import { PaginationMeta } from '@shared/types/pagination-meta.type'

import { TenantRepository } from './tenant.repository'
import { TenantService } from './tenant.service'
import { CreateTenantDto } from './dtos/create-tenant.dto'
import { TenantFull } from './types/tenant-full.type'
import { TenantResponse } from './types/tenant-response.type'

describe(TenantService.name, () => {
  let service: TenantService

  const mockTenantFull = {
    id: 'tenant-1',
    slug: 'acme-centro',
    customName: null,
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
    tenantStatus: { id: 'status-1', name: 'ACTIVE' },
    tenantype: { id: 'type-1', name: 'RESTAURANT' },
    company: { id: 'company-1', name: 'Acme' },
  } as unknown as TenantFull

  const mockResponse: TenantResponse = {
    id: 'tenant-1',
    slug: 'acme-centro',
    customName: null,
    logoUrl: null,
    favicon: null,
    primaryColor: null,
    secondaryColor: null,
    customDomain: null,
    timezone: 'America/Sao_Paulo',
    zipCode: '01310-100',
    street: 'Av. Paulista',
    number: '1000',
    complement: null,
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    country: 'BR',
    createdAt: mockTenantFull.createdAt,
    updatedAt: mockTenantFull.updatedAt,
    status: { id: 'status-1', name: 'ACTIVE' } as never,
    type: { id: 'type-1', name: 'RESTAURANT' } as never,
    company: { id: 'company-1', name: 'Acme' } as never,
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
    TenantRepository,
    'findAllPaginated' | 'findItem' | 'insert' | 'updateItem' | 'softDelete'
  > = {
    findAllPaginated: jest
      .fn()
      .mockResolvedValue({ data: [mockTenantFull], pagination: mockMeta }),
    findItem: jest.fn().mockResolvedValue(mockTenantFull),
    insert: jest.fn().mockResolvedValue(mockTenantFull),
    updateItem: jest.fn().mockResolvedValue(mockTenantFull),
    softDelete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        { provide: TenantRepository, useValue: mockRepo },
      ],
    }).compile()

    service = module.get<TenantService>(TenantService)
  })

  it('getAll() should return paginated mapped TenantResponse', async () => {
    const query = { page: 1, size: 10 }
    const result = await service.getAll(query as never)
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, size: 10, where: {} }),
    )
    expect(result.pagination).toEqual(mockMeta)
    expect((result.data[0] as Record<string, unknown>).deletedAt).toBeUndefined()
    expect((result.data[0] as Record<string, unknown>).statusId).toBeUndefined()
    expect(result.data[0].status.name).toBe('ACTIVE')
  })

  it('getAll() should filter by companyId when provided', async () => {
    const query = { page: 1, size: 10, companyId: 'company-1' }
    await service.getAll(query as never)
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ where: { companyId: 'company-1' } }),
    )
  })

  it('getById() should return mapped TenantResponse', async () => {
    const result = await service.getById('tenant-1')
    expect(mockRepo.findItem).toHaveBeenCalledWith({
      where: { id: 'tenant-1' },
      include: expect.any(Object),
    })
    expect((result as Record<string, unknown>).deletedAt).toBeUndefined()
    expect(result.status.name).toBe('ACTIVE')
  })

  it('getBySlug() should return mapped TenantResponse', async () => {
    const result = await service.getBySlug('acme-centro')
    expect(mockRepo.findItem).toHaveBeenCalledWith({
      where: { slug: 'acme-centro' },
      include: expect.any(Object),
    })
    expect(result.slug).toBe('acme-centro')
  })

  it('create() should insert and return mapped TenantResponse', async () => {
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
    const result = await service.create(dto)
    expect(mockRepo.insert).toHaveBeenCalledWith({
      data: dto,
      include: expect.any(Object),
    })
    expect(result).toEqual(mockResponse)
  })

  it('update() should updateItem and return mapped TenantResponse', async () => {
    const result = await service.update('tenant-1', { customName: 'Acme Centro' })
    expect(mockRepo.updateItem).toHaveBeenCalledWith({
      where: { id: 'tenant-1' },
      data: { customName: 'Acme Centro' },
      include: expect.any(Object),
    })
    expect((result as Record<string, unknown>).deletedAt).toBeUndefined()
  })

  it('delete() should call softDelete with id object', async () => {
    const result = await service.delete('tenant-1')
    expect(mockRepo.softDelete).toHaveBeenCalledWith({ id: 'tenant-1' })
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
