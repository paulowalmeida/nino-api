import { Test, TestingModule } from '@nestjs/testing'

import { PaginationMeta } from '@shared/types/pagination-meta.type'

import { CredentialInfo } from '@credential/types/credential-info.type'

import { CourierTenantRepository } from './courier-tenant.repository'
import { CourierTenantService } from './courier-tenant.service'
import { CreateCourierTenantDto } from './dtos/create-courier-tenant.dto'
import { CourierTenantFull } from './types/courier-tenant-full.type'
import { CourierTenantResponse } from './types/courier-tenant-response.type'

describe(CourierTenantService.name, () => {
  let service: CourierTenantService

  const now = new Date()

  const mockFull: CourierTenantFull = {
    courierId: 'courier-1',
    tenantId: 'tenant-1',
    isActive: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    courier: {
      id: 'courier-1',
      name: 'João',
      phone: null,
      isActive: true,
      lastLoginAt: null,
      locale: null,
      timezone: null,
      globalRoleId: 'role-1',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      globalRole: {
        id: 'role-1',
        name: 'COURIER',
        description: null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      credentials: [
        {
          id: 'cred-1',
          userId: 'courier-1',
          email: 'joao@test.com',
          password: 'hashed',
          providerCode: 'LOCAL',
          provider: 'LOCAL',
          emailVerifiedAt: null,
          resetTokenHash: null,
          resetTokenExpiresAt: null,
          emailVerificationTokenHash: null,
          emailVerificationExpiresAt: null,
          createdAt: now,
          updatedAt: now,
          deletedAt: null,
        },
      ],
    },
    tenant: {
      id: 'tenant-1',
      customName: null,
      slug: 'test-tenant',
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
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
  }

  const mockResponse: CourierTenantResponse = {
    isActive: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    courier: {
      id: 'courier-1',
      name: 'João',
      phone: null,
      isActive: true,
      lastLoginAt: null,
      locale: null,
      timezone: null,
      createdAt: now,
      updatedAt: now,
      role: mockFull.courier.globalRole,
      credentials: [
        {
          id: 'cred-1',
          userId: 'courier-1',
          email: 'joao@test.com',
          providerCode: 'LOCAL',
          provider: 'LOCAL',
          emailVerifiedAt: null,
          resetTokenHash: null,
          resetTokenExpiresAt: null,
          emailVerificationTokenHash: null,
          emailVerificationExpiresAt: null,
          createdAt: now,
          updatedAt: now,
        } as unknown as CredentialInfo,
      ],
    },
    tenant: mockFull.tenant,
  }

  const mockMeta: PaginationMeta = {
    total: 1,
    page: 1,
    size: 20,
    totalPages: 1,
    previousPage: null,
    nextPage: null,
  }

  const mockRepo: Pick<
    CourierTenantRepository,
    'insert' | 'findAllPaginated' | 'softDelete'
  > = {
    insert: jest.fn().mockResolvedValue(mockFull),
    findAllPaginated: jest
      .fn()
      .mockResolvedValue({ data: [mockFull], pagination: mockMeta }),
    softDelete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourierTenantService,
        { provide: CourierTenantRepository, useValue: mockRepo },
      ],
    }).compile()

    service = module.get<CourierTenantService>(CourierTenantService)
  })

  it('create() should insert and return mapped response', async () => {
    const dto: CreateCourierTenantDto = {
      courierId: 'courier-1',
      tenantId: 'tenant-1',
    }
    const result = await service.create(dto)
    expect(mockRepo.insert).toHaveBeenCalledWith(
      expect.objectContaining({ data: dto }),
    )
    expect(result).toEqual(mockResponse)
  })

  it('create() should strip credentials password and deletedAt in response', async () => {
    const result = await service.create({
      courierId: 'courier-1',
      tenantId: 'tenant-1',
    })
    const cred = result.courier.credentials[0] as Record<string, unknown>
    expect(cred.password).toBeUndefined()
    expect(cred.deletedAt).toBeUndefined()
  })

  it('getByCourierId() should return paginated response with default order', async () => {
    const result = await service.getByCourierId('courier-1', {})
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { courierId: 'courier-1' },
        order: { target: 'createdAt', direction: 'asc' },
      }),
    )
    expect(result.data).toEqual([mockResponse])
  })

  it('getByCourierId() should use provided target and direction', async () => {
    await service.getByCourierId('courier-1', {
      target: 'updatedAt',
      direction: 'desc',
    })
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith(
      expect.objectContaining({
        order: { target: 'updatedAt', direction: 'desc' },
      }),
    )
  })

  it('getByTenantId() should return paginated response with default order', async () => {
    const result = await service.getByTenantId('tenant-1', {})
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 'tenant-1' },
        order: { target: 'createdAt', direction: 'asc' },
      }),
    )
    expect(result.data).toEqual([mockResponse])
  })

  it('getByTenantId() should use provided target and direction', async () => {
    await service.getByTenantId('tenant-1', {
      target: 'updatedAt',
      direction: 'desc',
    })
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith(
      expect.objectContaining({
        order: { target: 'updatedAt', direction: 'desc' },
      }),
    )
  })

  it('delete() should call softDelete with composite key', async () => {
    const result = await service.delete('courier-1', 'tenant-1')
    expect(mockRepo.softDelete).toHaveBeenCalledWith({
      courierId_tenantId: { courierId: 'courier-1', tenantId: 'tenant-1' },
    })
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
