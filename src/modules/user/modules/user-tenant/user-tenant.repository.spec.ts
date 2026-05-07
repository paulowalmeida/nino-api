import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { UserTenantRepository } from './user-tenant.repository'

describe(UserTenantRepository.name, () => {
  let repository: UserTenantRepository

  const mockUserTenant = {
    userId: 'user-uuid-1',
    tenantId: 'tenant-uuid-1',
    tenantRoleId: 'role-uuid-1',
    isCurrent: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    tenantRole: { id: 'role-uuid-1', name: 'OWNER' },
    user: {
      id: 'user-uuid-1',
      name: 'Paulo',
      phone: null,
      globalRoleId: 'global-role-id',
      isActive: true,
      lastLoginAt: null,
      locale: null,
      timezone: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      globalRole: { id: 'global-role-id', name: 'MERCHANT' },
      credentials: [],
    },
  }

  const mockPrisma = {
    userTenant: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  }

  const mockErrorService = { handle: jest.fn() }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserTenantRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
        PaginationService,
      ],
    }).compile()

    repository = module.get<UserTenantRepository>(UserTenantRepository)
    mockPrisma.userTenant.count.mockResolvedValue(0)
  })

  afterEach(() => jest.clearAllMocks())

  describe('create()', () => {
    it('should create and return UserTenantResponse without userId', async () => {
      mockPrisma.userTenant.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockUserTenant)
      mockPrisma.userTenant.create.mockResolvedValue(mockUserTenant)

      const result = await repository.create({
        userId: 'user-uuid-1',
        tenantId: 'tenant-uuid-1',
        tenantRoleId: 'role-uuid-1',
      })

      expect(result.tenantId).toBe('tenant-uuid-1')
      expect((result as any).userId).toBeUndefined()
    })

    it('should call errorService.handle with ConflictException if already linked', async () => {
      mockPrisma.userTenant.findUnique.mockResolvedValue(mockUserTenant)
      await repository.create({
        userId: 'user-uuid-1',
        tenantId: 'tenant-uuid-1',
        tenantRoleId: 'role-uuid-1',
      })
      expect(mockErrorService.handle).toHaveBeenCalledWith(
        expect.any(ConflictException),
      )
      expect(mockPrisma.userTenant.create).not.toHaveBeenCalled()
    })
  })

  describe('getByUserId()', () => {
    it('should return paginated results', async () => {
      mockPrisma.userTenant.findMany.mockResolvedValue([mockUserTenant])
      mockPrisma.userTenant.count.mockResolvedValue(1)
      const result = await repository.getByUserId('user-uuid-1', {
        page: 1,
        size: 20,
      })
      expect(result.data).toHaveLength(1)
      expect(result.pagination.total).toBe(1)
    })

    it('should call errorService.handle on error', async () => {
      const error = new Error('DB error')
      mockPrisma.userTenant.findMany.mockRejectedValue(error)
      await repository.getByUserId('user-uuid-1', {})
      expect(mockErrorService.handle).toHaveBeenCalledWith(error)
    })
  })

  describe('getByTenantId()', () => {
    it('should return paginated results', async () => {
      mockPrisma.userTenant.findMany.mockResolvedValue([mockUserTenant])
      mockPrisma.userTenant.count.mockResolvedValue(1)
      const result = await repository.getByTenantId('tenant-uuid-1', {
        page: 1,
        size: 20,
      })
      expect(result.data).toHaveLength(1)
      expect(result.pagination.total).toBe(1)
    })
  })

  describe('delete()', () => {
    it('should delete and return success message', async () => {
      mockPrisma.userTenant.findUnique.mockResolvedValue(mockUserTenant)
      mockPrisma.userTenant.delete.mockResolvedValue(undefined)
      const result = await repository.delete('user-uuid-1', 'tenant-uuid-1')
      expect(result).toEqual({ message: 'UserTenant link removed successfully' })
    })

    it('should call errorService.handle with NotFoundException if not found', async () => {
      mockPrisma.userTenant.findUnique.mockResolvedValue(null)
      await repository.delete('user-uuid-1', 'tenant-uuid-1')
      expect(mockErrorService.handle).toHaveBeenCalledWith(
        expect.any(NotFoundException),
      )
      expect(mockPrisma.userTenant.delete).not.toHaveBeenCalled()
    })

    it('should call errorService.handle when prisma.delete throws', async () => {
      const error = new Error('db error')
      mockPrisma.userTenant.findUnique.mockResolvedValue(mockUserTenant)
      mockPrisma.userTenant.delete.mockRejectedValue(error)
      await repository.delete('user-uuid-1', 'tenant-uuid-1')
      expect(mockErrorService.handle).toHaveBeenCalledWith(error)
    })
  })

  it('should map credentials in toResponse when credentials exist', async () => {
    const withCred = {
      ...mockUserTenant,
      user: {
        ...mockUserTenant.user,
        credentials: [
          {
            id: 'cred-id',
            email: 'test@test.com',
            provider: 'local',
            providerCode: null,
            password: 'hashed',
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          },
        ],
      },
    }
    mockPrisma.userTenant.findMany.mockResolvedValue([withCred])
    mockPrisma.userTenant.count.mockResolvedValue(1)
    const result = await repository.getByUserId('user-uuid-1', {
      page: 1,
      size: 20,
    })
    expect(result.data[0]).toBeDefined()
  })
})
