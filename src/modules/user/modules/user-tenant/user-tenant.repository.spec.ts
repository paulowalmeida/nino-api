import { NotFoundException } from '@nestjs/common'
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
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
  }

  const mockErrorService: Pick<ErrorService, 'handle'> = {
    handle: jest.fn<never, [unknown, string?]>().mockImplementation((e) => { throw e }),
  }

  beforeEach(async () => {
    mockErrorService.handle.mockImplementation((e: unknown): never => { throw e as never })
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

  afterEach(() => jest.resetAllMocks())

  describe('create()', () => {
    it('should create and return UserTenantResponse without userId', async () => {
      mockPrisma.userTenant.create.mockResolvedValue(mockUserTenant)
      const result = await repository.create({
        userId: 'user-uuid-1',
        tenantId: 'tenant-uuid-1',
        tenantRoleId: 'role-uuid-1',
      })
      expect(result.tenantId).toBe('tenant-uuid-1')
      expect((result as Record<string, unknown>).userId).toBeUndefined()
    })

    it('should throw on db error', async () => {
      mockPrisma.userTenant.create.mockRejectedValue(new Error('db error'))
      await expect(
        repository.create({
          userId: 'user-uuid-1',
          tenantId: 'tenant-uuid-1',
          tenantRoleId: 'role-uuid-1',
        }),
      ).rejects.toThrow('db error')
    })
  })

  describe('getByUserId()', () => {
    it('should return paginated results', async () => {
      mockPrisma.userTenant.findMany.mockResolvedValue([mockUserTenant])
      mockPrisma.userTenant.count.mockResolvedValue(1)
      const result = await repository.getByUserId('user-uuid-1', { page: 1, size: 20 })
      expect(result.data).toHaveLength(1)
      expect(result.pagination.total).toBe(1)
    })

    it('should throw on db error', async () => {
      mockPrisma.userTenant.findMany.mockRejectedValue(new Error('db error'))
      await expect(
        repository.getByUserId('user-uuid-1', { page: 1, size: 10 }),
      ).rejects.toThrow('db error')
    })
  })

  describe('getByTenantId()', () => {
    it('should return paginated results', async () => {
      mockPrisma.userTenant.findMany.mockResolvedValue([mockUserTenant])
      mockPrisma.userTenant.count.mockResolvedValue(1)
      const result = await repository.getByTenantId('tenant-uuid-1', { page: 1, size: 20 })
      expect(result.data).toHaveLength(1)
      expect(result.pagination.total).toBe(1)
    })
  })

  describe('delete()', () => {
    it('should soft delete and return success message', async () => {
      mockPrisma.userTenant.update.mockResolvedValue(mockUserTenant)
      const result = await repository.delete('user-uuid-1', 'tenant-uuid-1')
      expect(result).toEqual({ message: 'Deleted successfully' })
      expect(mockPrisma.userTenant.update).toHaveBeenCalledWith({
        where: {
          userId_tenantId: { userId: 'user-uuid-1', tenantId: 'tenant-uuid-1' },
        },
        data: { deletedAt: expect.any(Date) },
        include: undefined,
      })
    })

    it('should throw NotFoundException when not found', async () => {
      mockPrisma.userTenant.update.mockRejectedValue(new NotFoundException())
      await expect(
        repository.delete('user-uuid-1', 'tenant-uuid-1'),
      ).rejects.toThrow(NotFoundException)
    })

    it('should throw on db error', async () => {
      mockPrisma.userTenant.update.mockRejectedValue(new Error('db error'))
      await expect(
        repository.delete('user-uuid-1', 'tenant-uuid-1'),
      ).rejects.toThrow('db error')
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
    const result = await repository.getByUserId('user-uuid-1', { page: 1, size: 20 })
    expect(result.data[0]).toBeDefined()
  })
})
