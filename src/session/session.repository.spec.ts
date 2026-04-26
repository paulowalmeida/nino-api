import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { SessionRepository } from './session.repository'

describe('SessionRepository', () => {
  let repository: SessionRepository
  let prismaService: PrismaService
  let prismaErrorService: PrismaErrorService

  const mockSession = {
    id: 'session-id',
    userId: 'user-id',
    refreshToken: 'token',
    expiresAt: new Date(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionRepository,
        {
          provide: PrismaService,
          useValue: {
            session: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: PrismaErrorService,
          useValue: { handleError: jest.fn() },
        },
      ],
    }).compile()

    repository = module.get<SessionRepository>(SessionRepository)
    prismaService = module.get<PrismaService>(PrismaService)
    prismaErrorService = module.get<PrismaErrorService>(PrismaErrorService)
  })

  it('should create a session successfully', async () => {
    jest
      .spyOn(prismaService.session, 'create')
      .mockResolvedValue(mockSession as any)
    const result = await repository.create({
      userId: 'user-id',
      refreshToken: 'token',
      expiresAt: new Date(),
    })
    expect(result).toEqual(mockSession)
  })

  it('should call handleError when create throws an error', async () => {
    const error = new Error('db error')
    jest.spyOn(prismaService.session, 'create').mockRejectedValue(error)
    await repository.create({
      userId: 'user-id',
      refreshToken: 'token',
      expiresAt: new Date(),
    })
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('should get a list of sessions by user id', async () => {
    jest
      .spyOn(prismaService.session, 'findMany')
      .mockResolvedValue([mockSession] as any)
    const result = await repository.getListByUserId('user-id')
    expect(result).toEqual([mockSession])
  })

  it('should call handleError when getListByUserId throws an error', async () => {
    const error = new Error('db error')
    jest.spyOn(prismaService.session, 'findMany').mockRejectedValue(error)
    await repository.getListByUserId('user-id')
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('should get a session by id', async () => {
    jest
      .spyOn(prismaService.session, 'findUnique')
      .mockResolvedValue(mockSession as any)
    const result = await repository.getById('session-id')
    expect(result).toEqual(mockSession)
  })

  it('should throw NotFoundException and call handleError when getById finds nothing', async () => {
    jest.spyOn(prismaService.session, 'findUnique').mockResolvedValue(null)
    await repository.getById('session-id')
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('should get a session by refresh token', async () => {
    jest
      .spyOn(prismaService.session, 'findUnique')
      .mockResolvedValue(mockSession as any)
    const result = await repository.getByRefreshToken('token')
    expect(result).toEqual(mockSession)
  })

  it('should throw NotFoundException and call handleError when getByRefreshToken finds nothing', async () => {
    jest.spyOn(prismaService.session, 'findUnique').mockResolvedValue(null)
    await repository.getByRefreshToken('token')
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('should update a session successfully', async () => {
    jest
      .spyOn(prismaService.session, 'update')
      .mockResolvedValue(mockSession as any)
    await repository.update('session-id', { refreshToken: 'new-token' })
    expect(prismaService.session.update).toHaveBeenCalled()
  })

  it('should call handleError when update throws an error', async () => {
    const error = new Error('db error')
    jest.spyOn(prismaService.session, 'update').mockRejectedValue(error)
    await repository.update('session-id', { refreshToken: 'new-token' })
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('should delete a session successfully', async () => {
    jest
      .spyOn(prismaService.session, 'delete')
      .mockResolvedValue(mockSession as any)
    await repository.delete('session-id')
    expect(prismaService.session.delete).toHaveBeenCalled()
  })

  it('should call handleError when delete throws an error', async () => {
    const error = new Error('db error')
    jest.spyOn(prismaService.session, 'delete').mockRejectedValue(error)
    await repository.delete('session-id')
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })
})
