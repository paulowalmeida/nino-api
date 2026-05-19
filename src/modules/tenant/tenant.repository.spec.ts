import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { TenantRepository } from './tenant.repository'
import { TenantFull } from './types/tenant-full.type'

describe(TenantRepository.name, () => {
  let repository: TenantRepository

  const mockStatus = { id: 'status-1', name: 'ACTIVE', description: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null }
  const mockType = { id: 'type-1', name: 'RESTAURANT', description: null, createdAt: new Date(), updatedAt: new Date(), deletedAt: null }
  const mockCompany = {
    id: 'company-1', name: 'Acme', cnpj: '12345678000190',
    legalName: null, legalNature: null, stateRegistration: null,
    ownerId: 'owner-1', responsibleId: 'resp-1',
    zipCode: null, street: null, number: null, complement: null,
    neighborhood: null, city: null, state: null, country: 'BR',
    isActive: true, createdAt: new Date(), updatedAt: new Date(), deletedAt: null,
  }

  const mockTenantFull: TenantFull = {
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
    tenantStatus: mockStatus,
    tenantype: mockType,
    company: mockCompany,
  }

  const mockPrisma = {
    tenant: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      deleteMany: jest.fn(),
    },
  }

  const mockErrorService: jest.Mocked<Pick<ErrorService, 'handle'>> = {
    handle: jest.fn<never, [unknown, string?]>().mockImplementation((e) => { throw e }),
  }

  beforeEach(async () => {
    mockErrorService.handle.mockImplementation((e: unknown): never => { throw e as never })
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
        PaginationService,
      ],
    }).compile()

    repository = module.get<TenantRepository>(TenantRepository)
    mockPrisma.tenant.count.mockResolvedValue(0)
  })

  afterEach(() => jest.resetAllMocks())

  it('getAll() should return paginated tenants', async () => {
    mockPrisma.tenant.findMany.mockResolvedValue([mockTenantFull])
    mockPrisma.tenant.count.mockResolvedValue(1)
    const result = await repository.getAll({ page: 1, size: 10 })
    expect(result.data).toHaveLength(1)
    expect(result.pagination.total).toBe(1)
    expect((result.data[0] as Record<string, unknown>).deletedAt).toBeUndefined()
    expect((result.data[0] as Record<string, unknown>).statusId).toBeUndefined()
    expect(result.data[0].status.name).toBe('ACTIVE')
    expect(result.data[0].type.name).toBe('RESTAURANT')
  })

  it('getAll() should filter by companyId when provided', async () => {
    mockPrisma.tenant.findMany.mockResolvedValue([mockTenantFull])
    mockPrisma.tenant.count.mockResolvedValue(1)
    await repository.getAll({ page: 1, size: 10, companyId: 'company-1' })
    expect(mockPrisma.tenant.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ companyId: 'company-1' }) }),
    )
  })

  it('getAll() should throw on db error', async () => {
    mockPrisma.tenant.findMany.mockRejectedValue(new Error('db error'))
    await expect(repository.getAll({ page: 1, size: 10 })).rejects.toThrow('db error')
  })

  it('getById() should return tenant without FK fields', async () => {
    mockPrisma.tenant.findFirst.mockResolvedValue(mockTenantFull)
    const result = await repository.getById('tenant-1')
    expect(result.id).toBe('tenant-1')
    expect((result as Record<string, unknown>).deletedAt).toBeUndefined()
    expect((result as Record<string, unknown>).statusId).toBeUndefined()
    expect(result.status.name).toBe('ACTIVE')
    expect(result.type.name).toBe('RESTAURANT')
  })

  it('getById() should throw NotFoundException when not found', async () => {
    mockPrisma.tenant.findFirst.mockResolvedValue(null)
    await expect(repository.getById('invalid')).rejects.toThrow(NotFoundException)
  })

  it('getBySlug() should return tenant by slug', async () => {
    mockPrisma.tenant.findFirst.mockResolvedValue(mockTenantFull)
    const result = await repository.getBySlug('acme-centro')
    expect(result.slug).toBe('acme-centro')
    expect((result as Record<string, unknown>).deletedAt).toBeUndefined()
  })

  it('getBySlug() should throw NotFoundException when not found', async () => {
    mockPrisma.tenant.findFirst.mockResolvedValue(null)
    await expect(repository.getBySlug('invalid')).rejects.toThrow(NotFoundException)
  })

  it('create() should create and return tenant without FK fields', async () => {
    mockPrisma.tenant.create.mockResolvedValue(mockTenantFull)
    const result = await repository.create({
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
    })
    expect(result.slug).toBe('acme-centro')
    expect((result as Record<string, unknown>).deletedAt).toBeUndefined()
  })

  it('create() should throw on db error', async () => {
    mockPrisma.tenant.create.mockRejectedValue(new Error('db error'))
    await expect(
      repository.create({ slug: 'x', companyId: 'c', statusId: 's', typeId: 't', zipCode: 'z', street: 's', number: 'n', neighborhood: 'n', city: 'c', state: 's' }),
    ).rejects.toThrow('db error')
  })

  it('update() should update and return tenant without FK fields', async () => {
    mockPrisma.tenant.update.mockResolvedValue(mockTenantFull)
    const result = await repository.update('tenant-1', { customName: 'Acme Centro' })
    expect(result.id).toBe('tenant-1')
    expect((result as Record<string, unknown>).deletedAt).toBeUndefined()
  })

  it('update() should throw on db error', async () => {
    mockPrisma.tenant.update.mockRejectedValue(new Error('db error'))
    await expect(repository.update('tenant-1', { customName: 'x' })).rejects.toThrow('db error')
  })

  it('delete() should soft delete and return success message', async () => {
    mockPrisma.tenant.update.mockResolvedValue({ ...mockTenantFull, deletedAt: new Date() })
    const result = await repository.delete('tenant-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })

  it('delete() should throw on db error', async () => {
    mockPrisma.tenant.update.mockRejectedValue(new Error('db error'))
    await expect(repository.delete('tenant-1')).rejects.toThrow('db error')
  })
})
