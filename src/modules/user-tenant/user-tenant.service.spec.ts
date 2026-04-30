import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { UserTenantRepository } from './user-tenant.repository'
import { UserTenantService } from './user-tenant.service'

describe(UserTenantService.name, () => {
  let service: UserTenantService
  let repository: UserTenantRepository

  const mockUserTenantResponse = {
    tenantId: 'tenant-uuid-1',
    createdAt: new Date(),
    user: {
      id: 'user-uuid-1',
      name: 'Paulo',
      isActive: true,
      companyId: null,
      lastLoginAt: null,
      locale: null,
      timezone: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: { name: 'OWNER' },
    },
  }

  const mockRepository = {
    create: jest.fn(),
    getByUserId: jest.fn(),
    getByTenantId: jest.fn(),
    delete: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserTenantService,
        { provide: UserTenantRepository, useValue: mockRepository },
      ],
    }).compile()

    service = module.get<UserTenantService>(UserTenantService)
    repository = module.get<UserTenantRepository>(UserTenantRepository)
  })

  afterEach(() => jest.clearAllMocks())

  it('create() should create and return UserTenantResponse', async () => {
    mockRepository.create.mockResolvedValue(mockUserTenantResponse)

    const result = await service.create({ userId: 'user-uuid-1', tenantId: 'tenant-uuid-1' })

    expect(result).toEqual(mockUserTenantResponse)
    expect(repository.create).toHaveBeenCalledWith({ userId: 'user-uuid-1', tenantId: 'tenant-uuid-1' })
  })

  it('create() should throw ConflictException if already linked', async () => {
    mockRepository.create.mockRejectedValue(new ConflictException('User is already linked to this tenant'))

    await expect(service.create({ userId: 'user-uuid-1', tenantId: 'tenant-uuid-1' })).rejects.toThrow(ConflictException)
  })

  it('getByUserId() should return paginated list for a user', async () => {
    const paginated = { data: [mockUserTenantResponse], pagination: { page: 1, size: 20, total: 1, totalPages: 1, previousPage: null, nextPage: null } }
    mockRepository.getByUserId.mockResolvedValue(paginated)
    const query = { page: 1, size: 20 }

    const result = await service.getByUserId('user-uuid-1', query)

    expect(result).toEqual(paginated)
    expect(repository.getByUserId).toHaveBeenCalledWith('user-uuid-1', query)
  })

  it('getByTenantId() should return paginated list for a tenant', async () => {
    const paginated = { data: [mockUserTenantResponse], pagination: { page: 1, size: 20, total: 1, totalPages: 1, previousPage: null, nextPage: null } }
    mockRepository.getByTenantId.mockResolvedValue(paginated)
    const query = { page: 1, size: 20 }

    const result = await service.getByTenantId('tenant-uuid-1', query)

    expect(result).toEqual(paginated)
    expect(repository.getByTenantId).toHaveBeenCalledWith('tenant-uuid-1', query)
  })

  it('delete() should remove link and return message', async () => {
    mockRepository.delete.mockResolvedValue({ message: 'UserTenant link removed successfully' })

    const result = await service.delete('user-uuid-1', 'tenant-uuid-1')

    expect(result).toEqual({ message: 'UserTenant link removed successfully' })
    expect(repository.delete).toHaveBeenCalledWith('user-uuid-1', 'tenant-uuid-1')
  })

  it('delete() should throw NotFoundException if not found', async () => {
    mockRepository.delete.mockRejectedValue(new NotFoundException('UserTenant link not found'))

    await expect(service.delete('user-uuid-1', 'tenant-uuid-1')).rejects.toThrow(NotFoundException)
  })
})
