import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'

import { ErrorService } from '@shared/services/error/error.service'
import { CredentialsRepository } from './credential.repository'
import { Credential } from './entities/credential.entity'

describe('CredentialsRepository', () => {
  let repository: CredentialsRepository

  const mockCredential = {
    id: 'cred-id',
    userId: 'user-id',
    email: 'test@test.com',
    provider: 'local',
    password: 'hashed',
  }

  const mockResponse = { id: 'cred-id', email: 'test@test.com', provider: 'local' }

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  }

  const mockErrorService = { handle: jest.fn() }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CredentialsRepository,
        { provide: getRepositoryToken(Credential), useValue: mockRepository },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compile()

    repository = module.get<CredentialsRepository>(CredentialsRepository)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create a credential successfully', async () => {
    mockRepository.create.mockReturnValue(mockCredential)
    mockRepository.save.mockResolvedValue(mockCredential)

    const result = await repository.create({ userId: 'user-id' } as any)

    expect(result).toEqual(mockResponse)
    expect(mockRepository.save).toHaveBeenCalled()
  })

  it('should call errorService.handle when create throws', async () => {
    const error = new Error('db error')
    mockRepository.create.mockReturnValue({})
    mockRepository.save.mockRejectedValue(error)

    await repository.create({ userId: 'user-id' } as any)

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should get credentials by userId', async () => {
    mockRepository.find.mockResolvedValue([mockCredential])

    const result = await repository.getAll('user-id')

    expect(result).toEqual([mockResponse])
    expect(mockRepository.find).toHaveBeenCalledWith({ where: { userId: 'user-id' } })
  })

  it('should call errorService.handle when getAll throws', async () => {
    const error = new Error('db error')
    mockRepository.find.mockRejectedValue(error)

    await repository.getAll('user-id')

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should get a credential by id', async () => {
    mockRepository.findOne.mockResolvedValue(mockCredential)

    const result = await repository.getById('cred-id')

    expect(result).toEqual(mockResponse)
    expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 'cred-id' } })
  })

  it('should call errorService.handle with NotFoundException when getById finds nothing', async () => {
    mockRepository.findOne.mockResolvedValue(null)

    await repository.getById('cred-id')

    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('should get a credential by email', async () => {
    mockRepository.findOneBy.mockResolvedValue(mockCredential)

    const result = await repository.getByEmail('test@test.com')

    expect(result).toEqual(mockResponse)
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({
      email: 'test@test.com',
      provider: 'local',
    })
  })

  it('should call errorService.handle with NotFoundException when getByEmail finds nothing', async () => {
    mockRepository.findOneBy.mockResolvedValue(null)

    await repository.getByEmail('test@test.com')

    expect(mockErrorService.handle).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('should update a credential successfully', async () => {
    const updated = { ...mockCredential, email: 'new@test.com' }
    mockRepository.findOne.mockResolvedValue(mockCredential)
    mockRepository.save.mockResolvedValue(updated)

    const result = await repository.update('cred-id', { email: 'new@test.com' })

    expect(result).toEqual({ ...mockResponse, email: 'new@test.com' })
    expect(mockRepository.save).toHaveBeenCalled()
  })

  it('should call errorService.handle when update throws', async () => {
    const error = new Error('db error')
    mockRepository.findOne.mockResolvedValue(mockCredential)
    mockRepository.save.mockRejectedValue(error)

    await repository.update('cred-id', { email: 'new@test.com' })

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should update password successfully', async () => {
    mockRepository.findOne.mockResolvedValue({ ...mockCredential })
    mockRepository.save.mockResolvedValue(undefined)

    await repository.updatePassword('cred-id', 'new-password')

    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ password: 'new-password' }),
    )
  })

  it('should call errorService.handle when updatePassword throws', async () => {
    const error = new Error('db error')
    mockRepository.findOne.mockResolvedValue(mockCredential)
    mockRepository.save.mockRejectedValue(error)

    await repository.updatePassword('cred-id', 'new-password')

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })

  it('should delete a credential successfully', async () => {
    mockRepository.findOne.mockResolvedValue(mockCredential)
    mockRepository.delete.mockResolvedValue(undefined)

    const result = await repository.delete('cred-id')

    expect(result).toEqual({ message: 'Credential deleted successfully' })
    expect(mockRepository.delete).toHaveBeenCalledWith('cred-id')
  })

  it('should call errorService.handle when delete throws', async () => {
    const error = new Error('db error')
    mockRepository.findOne.mockResolvedValue(mockCredential)
    mockRepository.delete.mockRejectedValue(error)

    await repository.delete('cred-id')

    expect(mockErrorService.handle).toHaveBeenCalledWith(error)
  })
})
