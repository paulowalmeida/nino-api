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
    phone: null,
    isActive: true,
    lastLoginAt: null,
    locale: null,
    timezone: null,
    deletedAt: null,
    globalRoleId: 'role-id',
    createdAt: new Date(),
    updatedAt: new Date(),
    globalRole: { id: 'role-id', name: 'ADMIN' },
    credentials: [],
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
        SessionRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
        PaginationService,
      ],
    }).compile()

    repository = module.get<SessionRepository>(SessionRepository)
    mockPrisma.session.count.mockResolvedValue(0)
  })

  afterEach(() => jest.resetAllMocks())

  it('should create a session successfully', async () => {
    mockPrisma.session.create.mockResolvedValue(mockSession)
    const result = await repository.create({
      userId: 'user-id',
      refreshToken: 'token',
      expiresAt: new Date(),
    })
    expect(result).toEqual(mockSession)
  })

  it('should throw on create db error', async () => {
    mockPrisma.session.create.mockRejectedValue(new Error('db error'))
    await expect(
      repository.create({ userId: 'user-id', refreshToken: 'token', expiresAt: new Date() }),
    ).rejects.toThrow('db error')
  })

  it('should get sessions by userId with pagination', async () => {
    mockPrisma.session.findMany.mockResolvedValue([mockSession])
    mockPrisma.session.count.mockResolvedValue(1)
    const result = await repository.getListByUserId('user-id', { page: 1, size: 20 })
    expect(result.data).toHaveLength(1)
    expect((result.data[0] as Record<string, unknown>).refreshToken).toBeUndefined()
    expect(result.pagination.total).toBe(1)
  })

  it('should throw on getListByUserId db error', async () => {
    mockPrisma.session.findMany.mockRejectedValue(new Error('db error'))
    await expect(
      repository.getListByUserId('user-id', { page: 1, size: 20 }),
    ).rejects.toThrow('db error')
  })

  it('should get a session by id', async () => {
    mockPrisma.session.findFirst.mockResolvedValue(mockSession)
    const result = await repository.getById('session-id')
    expect(result.id).toBe('session-id')
    expect((result as Record<string, unknown>).refreshToken).toBeUndefined()
  })

  it('should throw NotFoundException when getById finds nothing', async () => {
    mockPrisma.session.findFirst.mockResolvedValue(null)
    await expect(repository.getById('session-id')).rejects.toThrow(NotFoundException)
  })

  it('should get a session by refresh token', async () => {
    mockPrisma.session.findFirst.mockResolvedValue(mockSession)
    const result = await repository.getByRefreshToken('token')
    expect(result).toEqual(mockSession)
  })

  it('should throw NotFoundException when getByRefreshToken finds nothing', async () => {
    mockPrisma.session.findFirst.mockResolvedValue(null)
    await expect(repository.getByRefreshToken('token')).rejects.toThrow(NotFoundException)
  })

  it('should return null when findByRefreshToken finds nothing', async () => {
    mockPrisma.session.findFirst.mockResolvedValue(null)
    const result = await repository.findByRefreshToken('missing-token')
    expect(result).toBeNull()
  })

  it('should rethrow non-NotFoundException from findByRefreshToken', async () => {
    mockPrisma.session.findFirst.mockRejectedValue(new Error('db error'))
    await expect(repository.findByRefreshToken('token')).rejects.toThrow('db error')
  })

  it('should delete all sessions by userId', async () => {
    mockPrisma.session.deleteMany.mockResolvedValue(undefined)
    await repository.deleteAllByUserId('user-id')
    expect(mockPrisma.session.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-id' },
    })
  })

  it('should throw on deleteAllByUserId db error', async () => {
    mockPrisma.session.deleteMany.mockRejectedValue(new Error('db error'))
    await expect(repository.deleteAllByUserId('user-id')).rejects.toThrow('db error')
  })

  it('should update a session successfully', async () => {
    mockPrisma.session.update.mockResolvedValue(mockSession)
    await repository.update('session-id', { refreshToken: 'new-token' })
    expect(mockPrisma.session.update).toHaveBeenCalledWith({
      where: { id: 'session-id' },
      data: { refreshToken: 'new-token' },
    })
  })

  it('should throw on update db error', async () => {
    mockPrisma.session.update.mockRejectedValue(new Error('db error'))
    await expect(
      repository.update('session-id', { refreshToken: 'x' }),
    ).rejects.toThrow('db error')
  })

  it('should delete a session by id', async () => {
    mockPrisma.session.deleteMany.mockResolvedValue(undefined)
    await repository.delete('session-id')
    expect(mockPrisma.session.deleteMany).toHaveBeenCalledWith({
      where: { id: 'session-id' },
    })
  })

  it('should throw on delete db error', async () => {
    mockPrisma.session.deleteMany.mockRejectedValue(new Error('db error'))
    await expect(repository.delete('session-id')).rejects.toThrow('db error')
  })

  it('should map credentials in toResponse when they exist', async () => {
    const sessionWithCred = {
      ...mockSession,
      user: {
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
      },
    }
    mockPrisma.session.findMany.mockResolvedValue([sessionWithCred])
    mockPrisma.session.count.mockResolvedValue(1)
    const result = await repository.getListByUserId('user-id', { page: 1, size: 20 })
    const cred = result.data[0].user.credentials[0]
    expect(cred).not.toHaveProperty('password')
    expect(cred).not.toHaveProperty('deletedAt')
  })
})
