import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { PaginationMeta } from '@shared/types/pagination-meta.type'

import { SessionRepository } from './session.repository'
import { SessionService } from './session.service'
import { CreateSessionDto } from './dtos/create-session.dto'
import { SessionFull } from './types/session-full.type'
import { SessionOrderBy } from './types/session-order-by.type'
import { SessionResponse } from './types/session.response.type'

describe(SessionService.name, () => {
  let service: SessionService

  const createdAt = new Date()
  const updatedAt = new Date()

  const mockSessionFull = {
    id: 'session-id',
    expiresAt: new Date(),
    ipAddress: null,
    userAgent: null,
    createdAt,
    updatedAt,
    refreshToken: 'token',
    userId: 'user-id',
    user: {
      id: 'user-id',
      name: 'Test',
      phone: null,
      isActive: true,
      lastLoginAt: null,
      locale: null,
      timezone: null,
      globalRoleId: 'role-id',
      createdAt,
      updatedAt,
      deletedAt: null,
      globalRole: { id: 'role-id', name: 'ADMIN' },
      credentials: [],
    },
  } as unknown as SessionFull

  const mockSessionResponse = {
    id: 'session-id',
    expiresAt: mockSessionFull.expiresAt,
    ipAddress: null,
    userAgent: null,
    createdAt,
    updatedAt,
    user: {
      id: 'user-id',
      name: 'Test',
      phone: null,
      isActive: true,
      lastLoginAt: null,
      locale: null,
      timezone: null,
      createdAt,
      updatedAt,
      role: { id: 'role-id', name: 'ADMIN' },
      credentials: [],
    },
  } as unknown as SessionResponse

  const mockMeta: PaginationMeta = {
    total: 1,
    page: 1,
    size: 20,
    totalPages: 1,
    previousPage: null,
    nextPage: null,
  }

  const mockRepo: Pick<
    SessionRepository,
    'findAllPaginated' | 'findItem' | 'insert' | 'updateItem' | 'deleteMany'
  > = {
    findAllPaginated: jest
      .fn()
      .mockResolvedValue({ data: [mockSessionFull], pagination: mockMeta }),
    findItem: jest.fn().mockResolvedValue(mockSessionFull),
    insert: jest.fn().mockResolvedValue(mockSessionFull),
    updateItem: jest.fn().mockResolvedValue(mockSessionFull),
    deleteMany: jest.fn().mockResolvedValue(undefined),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        { provide: SessionRepository, useValue: mockRepo },
      ],
    }).compile()

    service = module.get<SessionService>(SessionService)
  })

  it('getAll() should return paginated mapped SessionResponse', async () => {
    const query = { page: 1, size: 20, target: SessionOrderBy.CREATED_AT }
    const result = await service.getAll(query as never)
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ ignoreDeleted: true, page: 1, size: 20 }),
    )
    expect(
      (result.data[0] as Record<string, unknown>).refreshToken,
    ).toBeUndefined()
  })

  it('create() should insert and return Session', async () => {
    const dto: CreateSessionDto = {
      userId: 'user-id',
      refreshToken: 'token',
      expiresAt: new Date(),
    }
    await service.create(dto)
    expect(mockRepo.insert).toHaveBeenCalledWith({ data: dto })
  })

  it('getListByUserId() should return paginated mapped SessionResponse', async () => {
    const query = {
      page: 1,
      size: 20,
      target: SessionOrderBy.CREATED_AT,
    }
    const result = await service.getListByUserId('user-id', query as never)
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-id' },
        ignoreDeleted: true,
        page: 1,
        size: 20,
      }),
    )
    expect(
      (result.data[0] as Record<string, unknown>).refreshToken,
    ).toBeUndefined()
    expect((result.data[0] as Record<string, unknown>).userId).toBeUndefined()
  })

  it('getById() should return mapped SessionResponse', async () => {
    const result = await service.getById('session-id')
    expect(mockRepo.findItem).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'session-id' },
        ignoreDeleted: true,
      }),
    )
    expect((result as Record<string, unknown>).refreshToken).toBeUndefined()
  })

  it('getByRefreshToken() should return Session', async () => {
    await service.getByRefreshToken('token')
    expect(mockRepo.findItem).toHaveBeenCalledWith({
      where: { refreshToken: 'token' },
      ignoreDeleted: true,
    })
  })

  it('findByRefreshToken() should return null when NotFoundException', async () => {
    ;(mockRepo.findItem as jest.Mock).mockRejectedValueOnce(
      new NotFoundException(),
    )
    const result = await service.findByRefreshToken('missing')
    expect(result).toBeNull()
  })

  it('findByRefreshToken() should rethrow non-NotFoundException', async () => {
    ;(mockRepo.findItem as jest.Mock).mockRejectedValueOnce(new Error('db'))
    await expect(service.findByRefreshToken('token')).rejects.toThrow('db')
  })

  it('deleteAllByUserId() should call deleteMany with userId', async () => {
    const result = await service.deleteAllByUserId('user-id')
    expect(mockRepo.deleteMany).toHaveBeenCalledWith({ userId: 'user-id' })
    expect(result).toEqual({ message: 'Sessions deleted successfully' })
  })

  it('update() should call updateItem then getById', async () => {
    const result = await service.update('session-id', { refreshToken: 'new' })
    expect(mockRepo.updateItem).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'session-id' } }),
    )
    expect(mockRepo.findItem).toHaveBeenCalled()
    expect((result as Record<string, unknown>).refreshToken).toBeUndefined()
  })

  it('delete() should call deleteMany with id', async () => {
    const result = await service.delete('session-id')
    expect(mockRepo.deleteMany).toHaveBeenCalledWith({ id: 'session-id' })
    expect(result).toEqual({ message: 'Session deleted successfully' })
  })
})
