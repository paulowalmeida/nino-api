import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { SessionRepository } from './session.repository'

describe(SessionRepository.name, () => {
  let repository: SessionRepository

  const mockUser = {
    id: 'user-id',
    name: 'Test',
    deletedAt: null,
    globalRoleId: 'role-id',
    globalRole: { name: 'ADMIN' },
  }

  const mockSession = {
    id: 'session-id',
    userId: 'user-id',
    refreshToken: 'token',
    expiresAt: new Date(),
    ipAddress: null,
    userAgent: null,
    createdAt: new Date(),
    user: mockUser,
  }

  const mockPrisma = {
    session: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    credential: {
      findMany: jest.fn(),
    },
  }

  const mockErrorService = { handle: jest.fn() }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
        PaginationService,
      ],
    }).compile()

    repository = module.get<SessionRepository>(SessionRepository)
    mockPrisma.credential.findMany.mockResolvedValue([])
    mockPrisma.session.count.mockResolvedValue(0)
  })

  afterEach(() => { jest.clearAllMocks() })

  it('should create a session successfully', async () => {
    mockPrisma.session.create.mockResolvedValue(mockSession)
    const result = await repository.create({
      userId: 'user-id',
      refreshToken: 'token',
      expiresAt: new Date(),
    })
    expect(result).toEqual(mockSession)
  })

  it('should call errorService.handle when create throws', async () => {
    const error = new Error('db error')
    mockPrisma.session.create.mockRejectedValue(error)
    await repository.create({
      userId: 'user-id',
      refreshToken: 'token',
      expiresAt: new Date(),
    })
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should get sessions by userId with pagination', async () => {
    mockPrisma.session.findMany.mockResolvedValue([mockSession])
    mockPrisma.session.count.mockResolvedValue(1)
    const result = await repository.getListByUserId('user-id', {
      page: 1,
      size: 20,
    })
    expect(result.data).toHaveLength(1)
    expect((result.data[0] as any).refreshToken).toBeUndefined()
    expect(result.pagination.total).toBe(1)
  })

  it('should get a session by id', async () => {
    mockPrisma.session.findFirst.mockResolvedValue(mockSession)
    const result = await repository.getById('session-id')
    expect(result.id).toBe('session-id')
    expect((result as any).refreshToken).toBeUndefined()
  })

  it('should call errorService.handle with NotFoundException when getById finds nothing', async () => {
    mockPrisma.session.findFirst.mockResolvedValue(null)
    await repository.getById('session-id')
    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('should get a session by refresh token', async () => {
    mockPrisma.session.findUnique.mockResolvedValue(mockSession)
    const result = await repository.getByRefreshToken('token')
    expect(result).toEqual(mockSession)
  })

  it('should call errorService.handle with NotFoundException when getByRefreshToken finds nothing', async () => {
    mockPrisma.session.findUnique.mockResolvedValue(null)
    await repository.getByRefreshToken('token')
    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('should find a session by refresh token (returns null if not found)', async () => {
    mockPrisma.session.findUnique.mockResolvedValue(null)
    const result = await repository.findByRefreshToken('missing-token')
    expect(result).toBeNull()
  })

  it('should delete all sessions by userId', async () => {
    mockPrisma.session.deleteMany.mockResolvedValue(undefined)
    await repository.deleteAllByUserId('user-id')
    expect(mockPrisma.session.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-id' },
    })
  })

  it('should call errorService.handle when deleteAllByUserId throws', async () => {
    const error = new Error('db error')
    mockPrisma.session.deleteMany.mockRejectedValue(error)
    await repository.deleteAllByUserId('user-id')
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should update a session successfully', async () => {
    mockPrisma.session.findUnique.mockResolvedValue(mockSession)
    mockPrisma.session.update.mockResolvedValue(mockSession)
    await repository.update('session-id', { refreshToken: 'new-token' })
    expect(mockPrisma.session.update).toHaveBeenCalled()
  })

  it('should call errorService.handle with NotFoundException when update finds nothing', async () => {
    mockPrisma.session.findUnique.mockResolvedValue(null)
    await repository.update('session-id', { refreshToken: 'x' })
    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('should call errorService.handle when update prisma.update throws', async () => {
    const error = new Error('db error')
    mockPrisma.session.findUnique.mockResolvedValue(mockSession)
    mockPrisma.session.update.mockRejectedValue(error)
    await repository.update('session-id', { refreshToken: 'x' })
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should delete a session successfully', async () => {
    mockPrisma.session.findFirst.mockResolvedValue(mockSession)
    mockPrisma.session.delete.mockResolvedValue(undefined)
    await repository.delete('session-id')
    expect(mockPrisma.session.delete).toHaveBeenCalledWith({
      where: { id: 'session-id' },
    })
  })

  it('should call errorService.handle when delete prisma.delete throws', async () => {
    const error = new Error('db error')
    mockPrisma.session.findFirst.mockResolvedValue(mockSession)
    mockPrisma.session.delete.mockRejectedValue(error)
    await repository.delete('session-id')
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should call errorService.handle when getListByUserId throws', async () => {
    const error = new Error('db error')
    mockPrisma.session.findMany.mockRejectedValue(error)
    await repository.getListByUserId('user-id', { page: 1, size: 20 })
    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should map credentials in toResponse when credentials exist', async () => {
    mockPrisma.credential.findMany.mockResolvedValue([
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
    ])
    mockPrisma.session.findMany.mockResolvedValue([mockSession])
    mockPrisma.session.count.mockResolvedValue(1)
    const result = await repository.getListByUserId('user-id', {
      page: 1,
      size: 20,
    })
    expect(result.data[0]).toBeDefined()
  })
})
