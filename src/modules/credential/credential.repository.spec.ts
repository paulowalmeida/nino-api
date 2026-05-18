import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { Credential } from '@prisma/client'

import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreateCredentialDto } from './dto/create-credentail.dto'
import { CredentialRepository } from './credential.repository'

describe(CredentialRepository.name, () => {
  let repository: CredentialRepository

  const mockCredential: Credential = {
    id: 'cred-id',
    userId: 'user-id',
    email: 'test@test.com',
    password: 'hashed',
    providerCode: 'provider-code',
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

  const mockCreateDto: CreateCredentialDto = {
    userId: 'user-id',
    email: 'test@test.com',
    provider: 'local',
    password: 'hashed',
  }

  const mockResponse = {
    id: 'cred-id',
    email: 'test@test.com',
    provider: 'local',
    providerCode: 'provider-code',
    createdAt: expect.any(Date),
    updatedAt: expect.any(Date),
  }

  const mockPrisma = {
    credential: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      deleteMany: jest.fn(),
    },
  }

  const mockErrorService: jest.Mocked<Pick<ErrorService, 'handle'>> = {
    handle: jest.fn<never, [unknown, string?]>(),
  }

  beforeEach(async () => {
    mockErrorService.handle.mockImplementation((e: unknown): never => { throw e as never })
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CredentialRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ErrorService, useValue: mockErrorService },
      ],
    }).compile()

    repository = module.get<CredentialRepository>(CredentialRepository)
  })

  afterEach(() => jest.resetAllMocks())

  it('should create a credential successfully', async () => {
    mockPrisma.credential.create.mockResolvedValue(mockCredential)
    const result = await repository.create(mockCreateDto)
    expect(result).toMatchObject(mockResponse)
    expect((result as Record<string, unknown>).password).toBeUndefined()
    expect((result as Record<string, unknown>).userId).toBeUndefined()
  })

  it('should throw on create db error', async () => {
    mockPrisma.credential.create.mockRejectedValue(new Error('db error'))
    await expect(repository.create(mockCreateDto)).rejects.toThrow('db error')
  })

  it('should get credentials by userId', async () => {
    mockPrisma.credential.findMany.mockResolvedValue([mockCredential])
    const result = await repository.getAll('user-id')
    expect(result[0]).toMatchObject(mockResponse)
    expect((result[0] as Record<string, unknown>).password).toBeUndefined()
  })

  it('should throw on getAll db error', async () => {
    mockPrisma.credential.findMany.mockRejectedValue(new Error('db error'))
    await expect(repository.getAll('user-id')).rejects.toThrow('db error')
  })

  it('should get a credential by id', async () => {
    mockPrisma.credential.findFirst.mockResolvedValue(mockCredential)
    const result = await repository.getById('cred-id')
    expect(result).toMatchObject(mockResponse)
    expect((result as Record<string, unknown>).password).toBeUndefined()
  })

  it('should throw NotFoundException when getById finds nothing', async () => {
    mockPrisma.credential.findFirst.mockResolvedValue(null)
    await expect(repository.getById('cred-id')).rejects.toThrow(NotFoundException)
  })

  it('should get a credential by email', async () => {
    mockPrisma.credential.findFirst.mockResolvedValue(mockCredential)
    const result = await repository.getByEmail('test@test.com')
    expect(result).toMatchObject(mockResponse)
  })

  it('should throw NotFoundException when getByEmail finds nothing', async () => {
    mockPrisma.credential.findFirst.mockResolvedValue(null)
    await expect(repository.getByEmail('test@test.com')).rejects.toThrow(NotFoundException)
  })

  it('should get a credential by id with password', async () => {
    mockPrisma.credential.findFirst.mockResolvedValue(mockCredential)
    const result = await repository.getByIdWithPassword('cred-id')
    expect(result).toEqual(mockCredential)
    expect(result.password).toBe('hashed')
  })

  it('should throw NotFoundException when getByIdWithPassword finds nothing', async () => {
    mockPrisma.credential.findFirst.mockResolvedValue(null)
    await expect(repository.getByIdWithPassword('cred-id')).rejects.toThrow(NotFoundException)
  })

  it('should throw on getByIdWithPassword db error', async () => {
    mockPrisma.credential.findFirst.mockRejectedValue(new Error('db error'))
    await expect(repository.getByIdWithPassword('cred-id')).rejects.toThrow('db error')
  })

  it('should get a credential by email with password', async () => {
    mockPrisma.credential.findFirst.mockResolvedValue(mockCredential)
    const result = await repository.getByEmailWithPassword('test@test.com')
    expect(result).toEqual(mockCredential)
    expect(result.password).toBe('hashed')
  })

  it('should throw NotFoundException when getByEmailWithPassword finds nothing', async () => {
    mockPrisma.credential.findFirst.mockResolvedValue(null)
    await expect(
      repository.getByEmailWithPassword('test@test.com'),
    ).rejects.toThrow(NotFoundException)
  })

  it('should throw on getByEmailWithPassword db error', async () => {
    mockPrisma.credential.findFirst.mockRejectedValue(new Error('db error'))
    await expect(
      repository.getByEmailWithPassword('test@test.com'),
    ).rejects.toThrow('db error')
  })

  it('should update a credential successfully', async () => {
    const updated = { ...mockCredential, email: 'new@test.com' }
    mockPrisma.credential.update.mockResolvedValue(updated)
    const result = await repository.update('cred-id', { email: 'new@test.com' })
    expect(result.email).toBe('new@test.com')
    expect((result as Record<string, unknown>).password).toBeUndefined()
  })

  it('should throw on update db error', async () => {
    mockPrisma.credential.update.mockRejectedValue(new Error('db error'))
    await expect(repository.update('cred-id', { email: 'x@x.com' })).rejects.toThrow('db error')
  })

  it('should update password successfully', async () => {
    mockPrisma.credential.update.mockResolvedValue(undefined)
    await repository.updatePassword('cred-id', 'new-password')
    expect(mockPrisma.credential.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'cred-id' },
        data: { password: 'new-password' },
      }),
    )
  })

  it('should throw on updatePassword db error', async () => {
    mockPrisma.credential.update.mockRejectedValue(new Error('db error'))
    await expect(repository.updatePassword('cred-id', 'new-password')).rejects.toThrow('db error')
  })

  it('should soft delete a credential successfully', async () => {
    mockPrisma.credential.update.mockResolvedValue({})
    expect(await repository.delete('cred-id')).toEqual({ message: 'Deleted successfully' })
  })

  it('should throw on delete db error', async () => {
    mockPrisma.credential.update.mockRejectedValue(new Error('db error'))
    await expect(repository.delete('cred-id')).rejects.toThrow('db error')
  })
})
