import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CredentialsRepository } from './credential.repository'

describe('CredentialsRepository', () => {
  let repository: CredentialsRepository
  let prismaService: PrismaService
  let prismaErrorService: PrismaErrorService

  const mockCredential = {
    id: 'cred-id',
    userId: 'user-id',
    email: 'test@test.com',
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CredentialsRepository,
        {
          provide: PrismaService,
          useValue: {
            authCredential: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
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

    repository = module.get<CredentialsRepository>(CredentialsRepository)
    prismaService = module.get<PrismaService>(PrismaService)
    prismaErrorService = module.get<PrismaErrorService>(PrismaErrorService)
  })

  it('should create a credential successfully', async () => {
    jest
      .spyOn(prismaService.authCredential, 'create')
      .mockResolvedValue(mockCredential as any)
    const result = await repository.create({ userId: 'user-id' })
    expect(result).toEqual(mockCredential)
  })

  it('should call handleError when create throws an error', async () => {
    const error = new Error('db error')
    jest.spyOn(prismaService.authCredential, 'create').mockRejectedValue(error)
    await repository.create({ userId: 'user-id' })
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('should get a list of credentials by user id', async () => {
    jest
      .spyOn(prismaService.authCredential, 'findMany')
      .mockResolvedValue([mockCredential] as any)
    const result = await repository.getAll('user-id')
    expect(result).toEqual([mockCredential])
  })

  it('should call handleError when getListByUserId throws an error', async () => {
    const error = new Error('db error')
    jest
      .spyOn(prismaService.authCredential, 'findMany')
      .mockRejectedValue(error)
    await repository.getAll('user-id')
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('should get a credential by id', async () => {
    jest
      .spyOn(prismaService.authCredential, 'findUnique')
      .mockResolvedValue(mockCredential as any)
    const result = await repository.getById('cred-id')
    expect(result).toEqual(mockCredential)
  })

  it('should throw NotFoundException and call handleError when getById finds nothing', async () => {
    jest
      .spyOn(prismaService.authCredential, 'findUnique')
      .mockResolvedValue(null)
    await repository.getById('cred-id')
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('should get a credential by email', async () => {
    jest
      .spyOn(prismaService.authCredential, 'findFirst')
      .mockResolvedValue(mockCredential as any)
    const result = await repository.getByEmail('test@test.com')
    expect(result).toEqual(mockCredential)
  })

  it('should throw NotFoundException and call handleError when getByEmail finds nothing', async () => {
    jest
      .spyOn(prismaService.authCredential, 'findFirst')
      .mockResolvedValue(null)
    await repository.getByEmail('test@test.com')
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('should update a credential successfully', async () => {
    jest
      .spyOn(prismaService.authCredential, 'update')
      .mockResolvedValue(mockCredential as any)
    await repository.update('cred-id', { email: 'new@test.com' })
    expect(prismaService.authCredential.update).toHaveBeenCalled()
  })

  it('should call handleError when update throws an error', async () => {
    const error = new Error('db error')
    jest.spyOn(prismaService.authCredential, 'update').mockRejectedValue(error)
    await repository.update('cred-id', { email: 'new@test.com' })
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('should update password successfully', async () => {
    jest
      .spyOn(prismaService.authCredential, 'update')
      .mockResolvedValue(mockCredential as any)
    await repository.updatePassword('cred-id', 'new-password')
    expect(prismaService.authCredential.update).toHaveBeenCalledWith({
      where: { id: 'cred-id' },
      data: { password: 'new-password' },
    })
  })

  it('should call handleError when updatePassword throws', async () => {
    const error = new Error('db error')
    jest.spyOn(prismaService.authCredential, 'update').mockRejectedValue(error)
    await repository.updatePassword('cred-id', 'new-password')
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('should delete a credential successfully', async () => {
    jest
      .spyOn(prismaService.authCredential, 'delete')
      .mockResolvedValue(mockCredential as any)
    await repository.delete('cred-id')
    expect(prismaService.authCredential.delete).toHaveBeenCalled()
  })

  it('should call handleError when delete throws an error', async () => {
    const error = new Error('db error')
    jest.spyOn(prismaService.authCredential, 'delete').mockRejectedValue(error)
    await repository.delete('cred-id')
    expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
  })
})
