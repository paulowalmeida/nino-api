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
    },
  }

  const mockErrorService = { handle: jest.fn() }

  beforeEach(async () => {
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

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create a user successfully', async () => {
    mockPrisma.user.create.mockResolvedValue(mockUser)
    const result = await repository.create({
      name: 'John Doe',
      globalRoleId: 'role-id',
    } as any)
    expect(result).toEqual(mockUser)
    expect(mockPrisma.user.create).toHaveBeenCalled()
  })

  it('should call errorService.handle when create throws', async () => {
    const error = new Error('db error')
    mockPrisma.user.create.mockRejectedValue(error)
    await repository.create({ name: 'John Doe', globalRoleId: 'role-id' } as any)
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should get all users with pagination', async () => {
    mockPrisma.user.findMany.mockResolvedValue([mockUser])
    mockPrisma.user.count.mockResolvedValue(1)
    const result = await repository.getAll({ page: 1, size: 20 })
    expect(result.data).toHaveLength(1)
    expect(result.pagination.total).toBe(1)
  })

  it('should call errorService.handle when getAll throws', async () => {
    const error = new Error('db error')
    mockPrisma.user.findMany.mockRejectedValue(error)
    await repository.getAll({})
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should get a user by id', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(mockUser)
    const result = await repository.getById('user-id')
    expect(result.id).toBe('user-id')
    expect((result as any).deletedAt).toBeUndefined()
  })

  it('should call errorService.handle with NotFoundException when getById finds nothing', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null)
    await repository.getById('user-id')
    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('should get users by companyId', async () => {
    mockPrisma.user.findMany.mockResolvedValue([mockUser])
    const result = await repository.getByCompanyId('company-id')
    expect(result).toHaveLength(1)
  })

  it('should update a user successfully', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(mockUser)
    mockPrisma.user.update.mockResolvedValue(mockUser)
    await repository.update('user-id', { name: 'Jane Doe' })
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-id' },
      data: { name: 'Jane Doe' },
    })
  })

  it('should soft delete a user', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(mockUser)
    mockPrisma.user.update.mockResolvedValue({
      ...mockUser,
      deletedAt: new Date(),
    })
    await repository.delete('user-id')
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-id' },
      data: { deletedAt: expect.any(Date) },
    })
  })

  it('should map credentials fields in toResponse', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(mockUserWithCred)
    const result = await repository.getById('user-id')
    expect(result.credentials[0]).not.toHaveProperty('password')
    expect(result.credentials[0]).not.toHaveProperty('deletedAt')
    expect(result.credentials[0].email).toBe('test@test.com')
  })

  it('should call errorService.handle with NotFoundException when update finds nothing', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null)
    await repository.update('user-id', { name: 'Jane' })
    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('should call errorService.handle when update prisma.update throws', async () => {
    const error = new Error('db error')
    mockPrisma.user.findFirst.mockResolvedValue(mockUser)
    mockPrisma.user.update.mockRejectedValue(error)
    await repository.update('user-id', { name: 'Jane' })
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should call errorService.handle when delete prisma.update throws', async () => {
    const error = new Error('db error')
    mockPrisma.user.findFirst.mockResolvedValue(mockUser)
    mockPrisma.user.update.mockRejectedValue(error)
    await repository.delete('user-id')
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should call errorService.handle when getByCompanyId throws', async () => {
    const error = new Error('db error')
    mockPrisma.user.findMany.mockRejectedValue(error)
    await repository.getByCompanyId('company-id')
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })
})
