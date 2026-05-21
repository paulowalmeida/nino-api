import { Test, TestingModule } from '@nestjs/testing'

import { PaginationMeta } from '@shared/types/pagination-meta.type'

import { UserTenantQueryDto } from './dtos/user-tenant-query.dto'
import { UserTenantFull } from './types/user-tenant-full.type'
import { UserTenantResponse } from './types/user-tenant.response.type'
import { UserTenantRepository } from './user-tenant.repository'
import { UserTenantService } from './user-tenant.service'

describe(UserTenantService.name, () => {
  let service: UserTenantService

  const mockFull: UserTenantFull = {
    userId: 'user-1',
    tenantId: 'tenant-1',
    tenantRoleId: 'role-1',
    isCurrent: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    tenantRole: {
      id: 'role-1',
      name: 'OWNER',
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
    user: {
      id: 'user-1',
      name: 'Paulo',
      phone: null,
      isActive: true,
      lastLoginAt: null,
      locale: null,
      timezone: null,
      globalRoleId: 'global-role-1',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      globalRole: {
        id: 'global-role-1',
        name: 'MERCHANT',
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      credentials: [],
    },
  }

  const mockResponse: UserTenantResponse = {
    tenantId: 'tenant-1',
    isCurrent: false,
    createdAt: mockFull.createdAt,
    updatedAt: mockFull.updatedAt,
    deletedAt: null,
    tenantRole: mockFull.tenantRole,
    user: {
      id: 'user-1',
      name: 'Paulo',
      phone: null,
      isActive: true,
      lastLoginAt: null,
      locale: null,
      timezone: null,
      createdAt: mockFull.user.createdAt,
      updatedAt: mockFull.user.updatedAt,
      role: mockFull.user.globalRole,
      credentials: [],
    },
  }

  const mockMeta: PaginationMeta = {
    total: 1,
    page: 1,
    size: 20,
    totalPages: 1,
    previousPage: null,
    nextPage: null,
  }

  const include = {
    tenantRole: true,
    user: { include: { globalRole: true, credentials: true } },
  } as const

  const mockRepo: Pick<
    UserTenantRepository,
    'findAllPaginated' | 'insert' | 'softDelete'
  > = {
    findAllPaginated: jest.fn(),
    insert: jest.fn().mockResolvedValue(mockFull),
    softDelete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserTenantService,
        { provide: UserTenantRepository, useValue: mockRepo },
      ],
    }).compile()

    service = module.get<UserTenantService>(UserTenantService)
  })

  it('create() should insert and return mapped response', async () => {
    const dto = {
      userId: 'user-1',
      tenantId: 'tenant-1',
      tenantRoleId: 'role-1',
    }
    const result = await service.create(dto)
    expect(mockRepo.insert).toHaveBeenCalledWith({ data: dto, include })
    expect(result).toEqual(mockResponse)
  })

  it('getByUserId() should return paginated user-tenant list', async () => {
    ;(mockRepo.findAllPaginated as jest.Mock).mockResolvedValue({
      data: [mockFull],
      pagination: mockMeta,
    })
    const query: UserTenantQueryDto = { page: 1, size: 20 }
    const result = await service.getByUserId('user-1', query)
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith({
      page: 1,
      size: 20,
      where: { userId: 'user-1' },
      order: { target: 'createdAt', direction: 'asc' },
      include,
      ignoreDeleted: true,
    })
    expect(result.data).toEqual([mockResponse])
    expect(result.pagination).toEqual(mockMeta)
  })

  it('getByTenantId() should return paginated user-tenant list', async () => {
    ;(mockRepo.findAllPaginated as jest.Mock).mockResolvedValue({
      data: [mockFull],
      pagination: mockMeta,
    })
    const query: UserTenantQueryDto = { page: 1, size: 20 }
    const result = await service.getByTenantId('tenant-1', query)
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith({
      page: 1,
      size: 20,
      where: { tenantId: 'tenant-1' },
      order: { target: 'createdAt', direction: 'asc' },
      include,
      ignoreDeleted: true,
    })
    expect(result.data).toEqual([mockResponse])
    expect(result.pagination).toEqual(mockMeta)
  })

  it('delete() should softDelete via composite key', async () => {
    const result = await service.delete('user-1', 'tenant-1')
    expect(mockRepo.softDelete).toHaveBeenCalledWith({
      userId_tenantId: { userId: 'user-1', tenantId: 'tenant-1' },
    })
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
