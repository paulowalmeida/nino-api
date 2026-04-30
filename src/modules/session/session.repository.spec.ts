import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { Credential } from '@credential/entities/credential.entity'
import { Session } from './entities/session.entity'
import { SessionRepository } from './session.repository'

describe('SessionRepository', () => {
  let repository: SessionRepository

  const mockUser = { id: 'user-id', name: 'Test', role: { name: 'ADMIN' } }

  const mockSession = {
    id: 'session-id',
    userId: 'user-id',
    refreshToken: 'token',
    expiresAt: new Date(),
    user: mockUser,
  }

  const mockRepository = {
    find: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  }

  const mockCredentialRepository = { find: jest.fn() }

  const mockErrorService = { handle: jest.fn() }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionRepository,
        { provide: getRepositoryToken(Session), useValue: mockRepository },
        { provide: getRepositoryToken(Credential), useValue: mockCredentialRepository },
        { provide: ErrorService, useValue: mockErrorService },
        PaginationService,
      ],
    }).compile()

    repository = module.get<SessionRepository>(SessionRepository)
    mockCredentialRepository.find.mockResolvedValue([])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create a session successfully', async () => {
    mockRepository.create.mockReturnValue(mockSession)
    mockRepository.save.mockResolvedValue(mockSession)

    const result = await repository.create({
      userId: 'user-id',
      refreshToken: 'token',
      expiresAt: new Date(),
    })

    expect(result).toEqual(mockSession)
    expect(mockRepository.save).toHaveBeenCalled()
  })

  it('should call errorService.handle when create throws', async () => {
    const error = new Error('db error')
    mockRepository.create.mockReturnValue({})
    mockRepository.save.mockRejectedValue(error)

    await repository.create({ userId: 'user-id', refreshToken: 'token', expiresAt: new Date() })

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should get sessions by userId with pagination', async () => {
    mockRepository.findAndCount.mockResolvedValue([[mockSession], 1])

    const result = await repository.getListByUserId('user-id', { page: 1, size: 20 })

    expect(result.data).toHaveLength(1)
    expect(result.data[0].id).toBe('session-id')
    expect((result.data[0] as any).refreshToken).toBeUndefined()
    expect(result.data[0].user.credentials).toEqual([])
    expect(result.pagination).toMatchObject({ page: 1, size: 20, total: 1 })
  })

  it('should call errorService.handle when getListByUserId throws', async () => {
    const error = new Error('db error')
    mockRepository.findAndCount.mockRejectedValue(error)

    await repository.getListByUserId('user-id', {})

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should get a session by id', async () => {
    mockRepository.findOne.mockResolvedValue(mockSession)

    const result = await repository.getById('session-id')

    expect(result.id).toBe('session-id')
    expect((result as any).refreshToken).toBeUndefined()
    expect(result.user.credentials).toEqual([])
  })

  it('should call errorService.handle with NotFoundException when getById finds nothing', async () => {
    mockRepository.findOne.mockResolvedValue(null)

    await repository.getById('session-id')

    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('should get a session by refresh token', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockSession)

    const result = await repository.getByRefreshToken('token')

    expect(result).toEqual(mockSession)
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ refreshToken: 'token' })
  })

  it('should call errorService.handle with NotFoundException when getByRefreshToken finds nothing', async () => {
    mockRepository.findOneBy.mockResolvedValue(null)

    await repository.getByRefreshToken('token')

    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('should find a session by refresh token (returns null if not found)', async () => {
    mockRepository.findOneBy.mockResolvedValue(null)

    const result = await repository.findByRefreshToken('missing-token')

    expect(result).toBeNull()
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ refreshToken: 'missing-token' })
  })

  it('should find a session by refresh token (returns session if found)', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockSession)

    const result = await repository.findByRefreshToken('token')

    expect(result).toEqual(mockSession)
  })

  it('should delete all sessions by userId', async () => {
    mockRepository.delete.mockResolvedValue(undefined)

    await repository.deleteAllByUserId('user-id')

    expect(mockRepository.delete).toHaveBeenCalledWith({ userId: 'user-id' })
  })

  it('should call errorService.handle when deleteAllByUserId throws', async () => {
    const error = new Error('db error')
    mockRepository.delete.mockRejectedValue(error)

    await repository.deleteAllByUserId('user-id')

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should update a session successfully', async () => {
    mockRepository.findOne.mockResolvedValue(mockSession)
    mockRepository.save.mockResolvedValue(undefined)

    await repository.update('session-id', { refreshToken: 'new-token' })

    expect(mockRepository.save).toHaveBeenCalled()
  })

  it('should call errorService.handle when update throws', async () => {
    const error = new Error('db error')
    mockRepository.findOne.mockResolvedValue(mockSession)
    mockRepository.save.mockRejectedValue(error)

    await repository.update('session-id', { refreshToken: 'new-token' })

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should delete a session successfully', async () => {
    mockRepository.findOne.mockResolvedValue(mockSession)
    mockRepository.delete.mockResolvedValue(undefined)

    await repository.delete('session-id')

    expect(mockRepository.delete).toHaveBeenCalledWith('session-id')
  })

  it('should call errorService.handle when delete throws', async () => {
    const error = new Error('db error')
    mockRepository.findOne.mockResolvedValue(mockSession)
    mockRepository.delete.mockRejectedValue(error)

    await repository.delete('session-id')

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })
})
