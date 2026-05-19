import { Test, TestingModule } from '@nestjs/testing'

import { TenantRepository } from './tenant.repository'
import { TenantService } from './tenant.service'
import { TenantPaginatedResponse } from './types/tenant-paginated-response.type'
import { TenantResponse } from './types/tenant-response.type'

describe(TenantService.name, () => {
  let service: TenantService

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
    createdAt: new Date(),
    updatedAt: new Date(),
    status: { name: 'ACTIVE' },
    type: { name: 'RESTAURANT' },
    company: { name: 'Acme' },
  }

  const mockPaginated: TenantPaginatedResponse = {
    data: [mockResponse],
    pagination: { total: 1, page: 1, size: 10, pages: 1 },
  }

  const mockRepo: Pick<
    TenantRepository,
    'getAll' | 'getById' | 'getBySlug' | 'create' | 'update' | 'delete'
  > = {
    getAll: jest.fn().mockResolvedValue(mockPaginated),
    getById: jest.fn().mockResolvedValue(mockResponse),
    getBySlug: jest.fn().mockResolvedValue(mockResponse),
    create: jest.fn().mockResolvedValue(mockResponse),
    update: jest.fn().mockResolvedValue(mockResponse),
    delete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
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

  it('getAll() should delegate to repository', async () => {
    const query = { page: 1, size: 10 }
    const result = await service.getAll(query)
    expect(mockRepo.getAll).toHaveBeenCalledWith(query)
    expect(result).toEqual(mockPaginated)
  })

  it('getById() should delegate to repository', async () => {
    const result = await service.getById('tenant-1')
    expect(mockRepo.getById).toHaveBeenCalledWith('tenant-1')
    expect(result).toEqual(mockResponse)
  })

  it('getBySlug() should delegate to repository', async () => {
    const result = await service.getBySlug('acme-centro')
    expect(mockRepo.getBySlug).toHaveBeenCalledWith('acme-centro')
    expect(result).toEqual(mockResponse)
  })

  it('create() should delegate to repository', async () => {
    const dto = { slug: 'acme-centro', companyId: 'c-1', statusId: 's-1', typeId: 't-1', zipCode: '01310-100', street: 'Av. Paulista', number: '1000', neighborhood: 'BV', city: 'SP', state: 'SP' }
    const result = await service.create(dto)
    expect(mockRepo.create).toHaveBeenCalledWith(dto)
    expect(result).toEqual(mockResponse)
  })

  it('update() should delegate to repository', async () => {
    const dto = { customName: 'Acme Centro' }
    const result = await service.update('tenant-1', dto)
    expect(mockRepo.update).toHaveBeenCalledWith('tenant-1', dto)
    expect(result).toEqual(mockResponse)
  })

  it('delete() should delegate to repository', async () => {
    const result = await service.delete('tenant-1')
    expect(mockRepo.delete).toHaveBeenCalledWith('tenant-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
