import { ConflictException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'

import { ErrorService } from '@shared/services/error/error.service'
import { Credential } from '@credential/entities/credential.entity'
import { UserTenant } from '@user/entities/user-tenant.entity'
import { UserTenantRepository } from './user-tenant.repository'

describe(UserTenantRepository.name, () => {
  let repository: UserTenantRepository

  const mockUserTenant = {
    userId: 'user-uuid-1',
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
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  }

  const mockCredentialRepository = { find: jest.fn() }
  const mockErrorService = { handle: jest.fn() }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserTenantRepository,
        { provide: getRepositoryToken(UserTenant), useValue: mockRepository },
        { provide: getRepositoryToken(Credential), useValue: mockCredentialRepository },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compile()

    repository = module.get<UserTenantRepository>(UserTenantRepository)
    mockCredentialRepository.find.mockResolvedValue([])
  })

  afterEach(() => jest.clearAllMocks())

  describe('create()', () => {
    it('should create and return UserTenantResponse', async () => {
      mockRepository.findOneBy.mockResolvedValue(null)
      mockRepository.create.mockReturnValue(mockUserTenant)
      mockRepository.save.mockResolvedValue(mockUserTenant)
      mockRepository.findOne.mockResolvedValue(mockUserTenant)

      const result = await repository.create({
        userId: 'user-uuid-1',
        tenantId: 'tenant-uuid-1',
      })

      expect(result.tenantId).toBe('tenant-uuid-1')
      expect(result.user.role).toEqual({ name: 'OWNER' })
      expect((result as any).userId).toBeUndefined()
    })

    it('should call errorService.handle with ConflictException if already linked', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockUserTenant)

      await repository.create({
        userId: 'user-uuid-1',
        tenantId: 'tenant-uuid-1',
      })

      expect(mockErrorService.handle).toHaveBeenCalledWith(
        expect.any(ConflictException),
      )
      expect(mockRepository.save).not.toHaveBeenCalled()
    })

    it('should call errorService.handle on db error', async () => {
      const error = new Error('DB error')
      mockRepository.findOneBy.mockResolvedValue(null)
      mockRepository.create.mockReturnValue({})
      mockRepository.save.mockRejectedValue(error)

      await repository.create({
        userId: 'user-uuid-1',
        tenantId: 'tenant-uuid-1',
      })

      expect(mockErrorService.handle).toHaveBeenCalledWith(error)
    })
  })

  describe('getByUserId()', () => {
    it('should return UserTenantResponse[] for a user', async () => {
      mockRepository.find.mockResolvedValue([mockUserTenant])

      const result = await repository.getByUserId('user-uuid-1')

      expect(result).toHaveLength(1)
      expect(result[0].user.role).toEqual({ name: 'OWNER' })
      expect((result[0] as any).userId).toBeUndefined()
    })

    it('should call errorService.handle on error', async () => {
      const error = new Error('DB error')
      mockRepository.find.mockRejectedValue(error)

      await repository.getByUserId('user-uuid-1')

      expect(mockErrorService.handle).toHaveBeenCalledWith(error)
    })
  })

  describe('getByTenantId()', () => {
    it('should return UserTenantResponse[] for a tenant', async () => {
      mockRepository.find.mockResolvedValue([mockUserTenant])

      const result = await repository.getByTenantId('tenant-uuid-1')

      expect(result).toHaveLength(1)
      expect(result[0].tenantId).toBe('tenant-uuid-1')
    })

    it('should call errorService.handle on error', async () => {
      const error = new Error('DB error')
      mockRepository.find.mockRejectedValue(error)

      await repository.getByTenantId('tenant-uuid-1')

      expect(mockErrorService.handle).toHaveBeenCalledWith(error)
    })
  })

  describe('delete()', () => {
    it('should delete and return success message', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockUserTenant)
      mockRepository.delete.mockResolvedValue(undefined)

      const result = await repository.delete('user-uuid-1', 'tenant-uuid-1')

      expect(result).toEqual({
        message: 'UserTenant link removed successfully',
      })
      expect(mockRepository.delete).toHaveBeenCalledWith({
        userId: 'user-uuid-1',
        tenantId: 'tenant-uuid-1',
      })
    })

    it('should call errorService.handle with NotFoundException if not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null)

      await repository.delete('user-uuid-1', 'tenant-uuid-1')

      expect(mockErrorService.handle).toHaveBeenCalledWith(
        expect.any(NotFoundException),
      )
      expect(mockRepository.delete).not.toHaveBeenCalled()
    })

    it('should call errorService.handle on db error', async () => {
      const error = new Error('DB error')
      mockRepository.findOneBy.mockResolvedValue(mockUserTenant)
      mockRepository.delete.mockRejectedValue(error)

      await repository.delete('user-uuid-1', 'tenant-uuid-1')

      expect(mockErrorService.handle).toHaveBeenCalledWith(error)
    })
  })
})
