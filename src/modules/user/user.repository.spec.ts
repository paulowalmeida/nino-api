import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { UserRepository } from './user.repository'

describe(UserRepository.name, () => {
  let repository: UserRepository

  const mockUser = {
    id: 'user-id',
    name: 'John Doe',
    phone: null,
    globalRoleId: 'role-id',
    isActive: true,
    lastLoginAt: null,
    locale: null,
    timezone: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    globalRole: { id: 'role-id', name: 'ADMIN' },
    credentials: [],
  }

  const mockUserWithCred = {
    ...mockUser,
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
  }

  const mockPrisma = {
    user: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
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
        UserRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
        PaginationService,
      ],
    }).compile()

    repository = module.get<UserRepository>(UserRepository)
    mockPrisma.user.count.mockResolvedValue(0)
  })

  afterEach(() => jest.resetAllMocks())

  it('should create a user successfully', async () => {
    mockPrisma.user.create.mockResolvedValue(mockUser)
    const result = await repository.create({ name: 'John Doe', globalRoleId: 'role-id' } as never)
    expect(result).toEqual(mockUser)
    expect(mockPrisma.user.create).toHaveBeenCalled()
  })

  it('should throw on create db error', async () => {
    mockPrisma.user.create.mockRejectedValue(new Error('db error'))
    await expect(
      repository.create({ name: 'John Doe', globalRoleId: 'role-id' } as never),
    ).rejects.toThrow('db error')
  })

  it('should get all users with pagination', async () => {
    mockPrisma.user.findMany.mockResolvedValue([mockUser])
    mockPrisma.user.count.mockResolvedValue(1)
    const result = await repository.getAll({ page: 1, size: 20 })
    expect(result.data).toHaveLength(1)
    expect(result.pagination.total).toBe(1)
  })

  it('should throw on getAll db error', async () => {
    mockPrisma.user.findMany.mockRejectedValue(new Error('db error'))
    await expect(repository.getAll({ page: 1, size: 10 })).rejects.toThrow('db error')
  })

  it('should get a user by id', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(mockUser)
    const result = await repository.getById('user-id')
    expect(result.id).toBe('user-id')
    expect((result as Record<string, unknown>).deletedAt).toBeUndefined()
  })

  it('should throw NotFoundException when getById finds nothing', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null)
    await expect(repository.getById('user-id')).rejects.toThrow(NotFoundException)
  })

  it('should get users by companyId', async () => {
    mockPrisma.user.findMany.mockResolvedValue([mockUser])
    const result = await repository.getByCompanyId('company-id')
    expect(result).toHaveLength(1)
  })

  it('should throw on getByCompanyId db error', async () => {
    mockPrisma.user.findMany.mockRejectedValue(new Error('db error'))
    await expect(repository.getByCompanyId('company-id')).rejects.toThrow('db error')
  })

  it('should update a user successfully', async () => {
    mockPrisma.user.update.mockResolvedValue(mockUser)
    await repository.update('user-id', { name: 'Jane Doe' })
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-id' },
      data: { name: 'Jane Doe' },
    })
  })

  it('should throw on update db error', async () => {
    mockPrisma.user.update.mockRejectedValue(new Error('db error'))
    await expect(repository.update('user-id', { name: 'Jane' })).rejects.toThrow('db error')
  })

  it('should soft delete a user', async () => {
    mockPrisma.user.update.mockResolvedValue({ ...mockUser, deletedAt: new Date() })
    await repository.delete('user-id')
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-id' },
      data: { deletedAt: expect.any(Date) },
    })
  })

  it('should throw on delete db error', async () => {
    mockPrisma.user.update.mockRejectedValue(new Error('db error'))
    await expect(repository.delete('user-id')).rejects.toThrow('db error')
  })

  it('should map credentials fields in toResponse', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(mockUserWithCred)
    const result = await repository.getById('user-id')
    expect(result.credentials[0]).not.toHaveProperty('password')
    expect(result.credentials[0]).not.toHaveProperty('deletedAt')
    expect(result.credentials[0].email).toBe('test@test.com')
  })
})
