import { UnauthorizedException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { PasswordService } from '@shared/services/password/password.service'
import { CredentialsRepository } from './credential.repository'
import { CredentialsService } from './credential.service'

describe('CredentialsService', () => {
  let service: CredentialsService
  let repository: CredentialsRepository
  let passwordService: PasswordService

  const mockCredential = {
    id: 'cred-id',
    userId: 'user-id',
    email: 'test@test.com',
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CredentialsService,
        {
          provide: CredentialsRepository,
          useValue: {
            create: jest.fn().mockResolvedValue(mockCredential),
            getAll: jest.fn().mockResolvedValue([mockCredential]),
            getById: jest.fn().mockResolvedValue(mockCredential),
            getByIdWithPassword: jest.fn().mockResolvedValue(mockCredential),
            getByEmail: jest.fn().mockResolvedValue(mockCredential),
            update: jest.fn().mockResolvedValue(undefined),
            updatePassword: jest.fn().mockResolvedValue(undefined),
            delete: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: PasswordService,
          useValue: {
            hash: jest.fn().mockResolvedValue('hashed-password'),
            compare: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<CredentialsService>(CredentialsService)
    repository = module.get<CredentialsRepository>(CredentialsRepository)
    passwordService = module.get<PasswordService>(PasswordService)
  })

  it('should create a credential with a hashed password if provided', async () => {
    const result = await service.create({ userId: 'user-id', password: '123' })
    expect(passwordService.hash).toHaveBeenCalledWith('123')
    expect(repository.create).toHaveBeenCalledWith({
      userId: 'user-id',
      password: 'hashed-password',
    })
    expect(result).toEqual(mockCredential)
  })

  it('should create a credential without hashing if password is not provided', async () => {
    const result = await service.create({
      userId: 'user-id',
      email: 'test@test.com',
    })
    expect(passwordService.hash).not.toHaveBeenCalled()
    expect(repository.create).toHaveBeenCalledWith({
      userId: 'user-id',
      email: 'test@test.com',
    })
    expect(result).toEqual(mockCredential)
  })

  it('should get a list of credentials by user id', async () => {
    const result = await service.getAll('user-id')
    expect(repository.getAll).toHaveBeenCalledWith('user-id')
    expect(result).toEqual([mockCredential])
  })

  it('should get a credential by id', async () => {
    const result = await service.getById('cred-id')
    expect(repository.getById).toHaveBeenCalledWith('cred-id')
    expect(result).toEqual(mockCredential)
  })

  it('should get a credential by email', async () => {
    const result = await service.getByEmail('test@test.com')
    expect(repository.getByEmail).toHaveBeenCalledWith('test@test.com')
    expect(result).toEqual(mockCredential)
  })

  it('should update a credential hashing the password if provided', async () => {
    await service.update('cred-id', { password: '123' })
    expect(passwordService.hash).toHaveBeenCalledWith('123')
    expect(repository.update).toHaveBeenCalledWith('cred-id', {
      password: 'hashed-password',
    })
  })

  it('should update a credential without hashing if password is not provided', async () => {
    await service.update('cred-id', { email: 'new@test.com' })
    expect(passwordService.hash).not.toHaveBeenCalled()
    expect(repository.update).toHaveBeenCalledWith('cred-id', {
      email: 'new@test.com',
    })
  })

  it('should delete a credential', async () => {
    await service.delete('cred-id')
    expect(repository.delete).toHaveBeenCalledWith('cred-id')
  })

  it('should change password successfully', async () => {
    jest
      .spyOn(repository, 'getByIdWithPassword')
      .mockResolvedValue({ id: 'cred-id', password: 'hashed-old' } as any)
    jest.spyOn(passwordService, 'compare').mockResolvedValue(true)
    jest.spyOn(passwordService, 'hash').mockResolvedValue('hashed-new')

    await service.changePassword('user-id', 'old', 'new')

    expect(passwordService.compare).toHaveBeenCalledWith('old', 'hashed-old')
    expect(repository.updatePassword).toHaveBeenCalledWith(
      'cred-id',
      'hashed-new',
    )
  })

  it('should throw UnauthorizedException when credential has no password', async () => {
    jest
      .spyOn(repository, 'getByIdWithPassword')
      .mockResolvedValue({ id: 'cred-id', password: null } as any)

    await expect(
      service.changePassword('user-id', 'old', 'new'),
    ).rejects.toThrow(UnauthorizedException)
  })

  it('should throw UnauthorizedException when old password does not match', async () => {
    jest
      .spyOn(repository, 'getByIdWithPassword')
      .mockResolvedValue({ id: 'cred-id', password: 'hashed-old' } as any)
    jest.spyOn(passwordService, 'compare').mockResolvedValue(false)

    await expect(
      service.changePassword('user-id', 'old', 'new'),
    ).rejects.toThrow(UnauthorizedException)
  })
})
