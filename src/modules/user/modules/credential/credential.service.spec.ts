import { UnauthorizedException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { Credential } from '@prisma/client'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { PasswordService } from '@shared/services/password/password.service'
import { PaginationMeta } from '@shared/types/pagination-meta.type'

import { CredentialRepository } from './credential.repository'
import { CredentialsService } from './credential.service'
import { CredentialResponse } from './types/credential.response.type'

describe(CredentialsService.name, () => {
  let service: CredentialsService

  const mockCredential: Credential = {
    id: 'cred-1',
    userId: 'user-1',
    email: 'test@test.com',
    password: 'hashed',
    providerCode: 'code-1',
    provider: 'local',
    emailVerifiedAt: null,
    resetTokenHash: null,
    resetTokenExpiresAt: null,
    emailVerificationTokenHash: null,
    emailVerificationExpiresAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockResponse: CredentialResponse = {
    id: mockCredential.id,
    email: mockCredential.email,
    providerCode: mockCredential.providerCode,
    provider: mockCredential.provider,
    emailVerifiedAt: null,
    resetTokenHash: null,
    resetTokenExpiresAt: null,
    emailVerificationTokenHash: null,
    emailVerificationExpiresAt: null,
    createdAt: mockCredential.createdAt,
    updatedAt: mockCredential.updatedAt,
  }

  const mockMeta: PaginationMeta = {
    total: 1,
    page: 1,
    size: 10,
    totalPages: 1,
    previousPage: null,
    nextPage: null,
  }

  const mockRepo: Pick<
    CredentialRepository,
    'findAllPaginated' | 'findItem' | 'insert' | 'updateItem' | 'softDelete'
  > = {
    findAllPaginated: jest.fn(),
    findItem: jest.fn().mockResolvedValue(mockCredential),
    insert: jest.fn().mockResolvedValue(mockCredential),
    updateItem: jest.fn().mockResolvedValue(mockCredential),
    softDelete: jest
      .fn()
      .mockResolvedValue({ message: 'Deleted successfully' }),
  }

  const mockPasswordService: jest.Mocked<
    Pick<PasswordService, 'hash' | 'compare'>
  > = {
    hash: jest.fn().mockResolvedValue('hashed-new'),
    compare: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CredentialsService,
        { provide: CredentialRepository, useValue: mockRepo },
        { provide: PasswordService, useValue: mockPasswordService },
      ],
    }).compile()

    service = module.get<CredentialsService>(CredentialsService)
  })

  it('getAll() should return paginated credentials', async () => {
    ;(mockRepo.findAllPaginated as jest.Mock).mockResolvedValue({
      data: [mockCredential],
      pagination: mockMeta,
    })
    const query: PaginatedQueryDto = { page: 1, size: 10 }
    const result = await service.getAll(query, 'user-1')
    expect(mockRepo.findAllPaginated).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      order: { target: 'createdAt', direction: 'asc' },
      page: 1,
      size: 10,
    })
    expect(result.data).toEqual([mockResponse])
    expect(result.pagination).toEqual(mockMeta)
  })

  it('getById() should return mapped credential', async () => {
    const result = await service.getById('cred-1')
    expect(mockRepo.findItem).toHaveBeenCalledWith({ where: { id: 'cred-1' } })
    expect(result).toEqual(mockResponse)
  })

  it('getByEmail() should return mapped credential', async () => {
    const result = await service.getByEmail('test@test.com')
    expect(mockRepo.findItem).toHaveBeenCalledWith({
      where: { email: 'test@test.com', provider: 'local' },
    })
    expect(result).toEqual(mockResponse)
  })

  it('getByEmailWithPassword() should return raw credential', async () => {
    const result = await service.getByEmailWithPassword('test@test.com')
    expect(mockRepo.findItem).toHaveBeenCalledWith({
      where: { email: 'test@test.com', provider: 'local' },
    })
    expect(result).toEqual(mockCredential)
  })

  it('create() should hash password and insert', async () => {
    const dto = { userId: 'user-1', password: 'raw' }
    const result = await service.create(dto)
    expect(mockPasswordService.hash).toHaveBeenCalledWith('raw')
    expect(mockRepo.insert).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        password: 'hashed-new',
      }),
    })
    expect(result).toEqual(mockResponse)
  })

  it('create() should not hash if no password', async () => {
    const dto = { userId: 'user-1', email: 'test@test.com' }
    await service.create(dto)
    expect(mockPasswordService.hash).not.toHaveBeenCalled()
    expect(mockRepo.insert).toHaveBeenCalledWith({
      data: expect.objectContaining({ userId: 'user-1' }),
    })
  })

  it('update() should hash password and updateItem', async () => {
    const result = await service.update('cred-1', { password: 'new' })
    expect(mockPasswordService.hash).toHaveBeenCalledWith('new')
    expect(mockRepo.updateItem).toHaveBeenCalledWith({
      where: { id: 'cred-1' },
      data: { password: 'hashed-new' },
    })
    expect(result).toEqual(mockResponse)
  })

  it('update() should not hash if no password', async () => {
    await service.update('cred-1', { email: 'new@test.com' })
    expect(mockPasswordService.hash).not.toHaveBeenCalled()
    expect(mockRepo.updateItem).toHaveBeenCalledWith({
      where: { id: 'cred-1' },
      data: { email: 'new@test.com' },
    })
  })

  it('delete() should soft delete with id object', async () => {
    const result = await service.delete('cred-1')
    expect(mockRepo.softDelete).toHaveBeenCalledWith({ id: 'cred-1' })
    expect(result).toEqual({ message: 'Deleted successfully' })
  })

  it('changePassword() should update password when old matches', async () => {
    mockPasswordService.compare.mockResolvedValue(true)
    const result = await service.changePassword('user-1', 'old', 'new')
    expect(mockRepo.findItem).toHaveBeenCalledWith({ where: { id: 'user-1' } })
    expect(mockPasswordService.compare).toHaveBeenCalledWith('old', 'hashed')
    expect(mockRepo.updateItem).toHaveBeenCalledWith({
      where: { id: 'cred-1' },
      data: { password: 'hashed-new' },
    })
    expect(result).toEqual({ message: 'Password updated successfully' })
  })

  it('changePassword() should throw if credential has no password', async () => {
    ;(mockRepo.findItem as jest.Mock).mockResolvedValueOnce({
      ...mockCredential,
      password: null,
    })
    await expect(
      service.changePassword('user-1', 'old', 'new'),
    ).rejects.toThrow(UnauthorizedException)
  })

  it('changePassword() should throw if old password does not match', async () => {
    mockPasswordService.compare.mockResolvedValue(false)
    await expect(
      service.changePassword('user-1', 'old', 'new'),
    ).rejects.toThrow(UnauthorizedException)
  })
})
