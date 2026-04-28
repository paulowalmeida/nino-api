import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'

import { Session } from '@session/entities/session.entity'
import { ErrorService } from '@shared/services/error/error.service'
import { SessionRepository } from './session.repository'

describe('SessionRepository', () => {
  let repository: SessionRepository

  const mockSession = {
    id: 'session-id',
    userId: 'user-id',
    refreshToken: 'token',
    expiresAt: new Date(),
  }

  const mockRepository = {
    findBy: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  }

  const mockErrorService = { handle: jest.fn() }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionRepository,
        { provide: getRepositoryToken(Session), useValue: mockRepository },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compile()

    repository = module.get<SessionRepository>(SessionRepository)
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

  it('should get sessions by userId', async () => {
    mockRepository.findBy.mockResolvedValue([mockSession])

    const result = await repository.getListByUserId('user-id')

    expect(result).toEqual([mockSession])
    expect(mockRepository.findBy).toHaveBeenCalledWith({ userId: 'user-id' })
  })

  it('should call errorService.handle when getListByUserId throws', async () => {
    const error = new Error('db error')
    mockRepository.findBy.mockRejectedValue(error)

    await repository.getListByUserId('user-id')

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should get a session by id', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockSession)

    const result = await repository.getById('session-id')

    expect(result).toEqual(mockSession)
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: 'session-id' })
  })

  it('should call errorService.handle with NotFoundException when getById finds nothing', async () => {
    mockRepository.findOneBy.mockResolvedValue(null)

    await repository.getById('session-id')

    expect(mockErrorService.handle).toHaveBeenCalledWith(expect.any(NotFoundException))
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

    expect(mockErrorService.handle).toHaveBeenCalledWith(expect.any(NotFoundException))
  })

  it('should update a session successfully', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockSession)
    mockRepository.save.mockResolvedValue(undefined)

    await repository.update('session-id', { refreshToken: 'new-token' })

    expect(mockRepository.save).toHaveBeenCalled()
  })

  it('should call errorService.handle when update throws', async () => {
    const error = new Error('db error')
    mockRepository.findOneBy.mockResolvedValue(mockSession)
    mockRepository.save.mockRejectedValue(error)

    await repository.update('session-id', { refreshToken: 'new-token' })

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should delete a session successfully', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockSession)
    mockRepository.delete.mockResolvedValue(undefined)

    await repository.delete('session-id')

    expect(mockRepository.delete).toHaveBeenCalledWith('session-id')
  })

  it('should call errorService.handle when delete throws', async () => {
    const error = new Error('db error')
    mockRepository.findOneBy.mockResolvedValue(mockSession)
    mockRepository.delete.mockRejectedValue(error)

    await repository.delete('session-id')

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })
})
