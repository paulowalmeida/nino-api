import { Test, TestingModule } from '@nestjs/testing'

import { SessionRepository } from './session.repository'
import { SessionService } from './session.service'

describe('SessionService', () => {
  let service: SessionService
  let repository: SessionRepository

  const mockSession = {
    id: 'session-id',
    userId: 'user-id',
    refreshToken: 'token',
    expiresAt: new Date(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: SessionRepository,
          useValue: {
            create: jest.fn().mockResolvedValue(mockSession),
            getListByUserId: jest.fn().mockResolvedValue({ data: [mockSession], pagination: { page: 1, size: 20, total: 1, totalPages: 1, previousPage: null, nextPage: null } }),
            getById: jest.fn().mockResolvedValue(mockSession),
            getByRefreshToken: jest.fn().mockResolvedValue(mockSession),
            findByRefreshToken: jest.fn().mockResolvedValue(mockSession),
            deleteAllByUserId: jest.fn().mockResolvedValue(undefined),
            update: jest.fn().mockResolvedValue(undefined),
            delete: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile()

    service = module.get<SessionService>(SessionService)
    repository = module.get<SessionRepository>(SessionRepository)
  })

  it('should create a session', async () => {
    const dto = {
      userId: 'user-id',
      refreshToken: 'token',
      expiresAt: new Date(),
    }
    const result = await service.create(dto)
    expect(repository.create).toHaveBeenCalledWith(dto)
    expect(result).toEqual(mockSession)
  })

  it('should get a list of sessions by user id with pagination', async () => {
    const query = { page: 1, size: 20 }
    const result = await service.getListByUserId('user-id', query)
    expect(repository.getListByUserId).toHaveBeenCalledWith('user-id', query)
    expect(result.data).toEqual([mockSession])
  })

  it('should get a session by id', async () => {
    const result = await service.getById('session-id')
    expect(repository.getById).toHaveBeenCalledWith('session-id')
    expect(result).toEqual(mockSession)
  })

  it('should get a session by refresh token', async () => {
    const result = await service.getByRefreshToken('token')
    expect(repository.getByRefreshToken).toHaveBeenCalledWith('token')
    expect(result).toEqual(mockSession)
  })

  it('should find a session by refresh token', async () => {
    const result = await service.findByRefreshToken('token')
    expect(repository.findByRefreshToken).toHaveBeenCalledWith('token')
    expect(result).toEqual(mockSession)
  })

  it('should delete all sessions by userId', async () => {
    await service.deleteAllByUserId('user-id')
    expect(repository.deleteAllByUserId).toHaveBeenCalledWith('user-id')
  })

  it('should update a session', async () => {
    const dto = { refreshToken: 'new-token' }
    await service.update('session-id', dto)
    expect(repository.update).toHaveBeenCalledWith('session-id', dto)
  })

  it('should delete a session', async () => {
    await service.delete('session-id')
    expect(repository.delete).toHaveBeenCalledWith('session-id')
  })
})
