import { NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { AuthRepository } from '@auth/auth.repository'
import { NewAccountRequestDTO } from '@auth/dtos/new-account-request.dto'
import { AccountRefreshToken } from '@auth/types/account/account-refresh-token.type'
import { AccountRepository } from '@auth/types/account/account-repository.type'
import { Account } from '@auth/types/account/account.type'
import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

const mockAccount: AccountRepository = {
  id: 'acc-001',
  email: 'john@example.com',
  password: '$2b$10$hashed',
  hashedRefreshToken: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: null,
  role: { code: 3, description: 'MERCHANT' },
}

const mockAccountCreated: Account = {
  id: 'acc-001',
  email: 'john@example.com',
  createdAt: new Date(),
  updatedAt: new Date(),
  role: { code: 3, description: 'MERCHANT' },
}

const mockAccountRefreshToken: AccountRefreshToken = {
  id: 'acc-001',
  email: 'john@example.com',
  hashedRefreshToken: '$2b$10$refreshHash',
  role: { code: 3 },
}

const mockPrisma = {
  account: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}

const mockPrismaErrorService = {
  handleError: jest.fn(),
}

const newAccountPayload: NewAccountRequestDTO = {
  email: 'john@example.com',
  password: 'hashed-password',
  role: 3,
}

describe('AuthRepository', () => {
  let repository: AuthRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthRepository,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PrismaErrorService, useValue: mockPrismaErrorService },
      ],
    }).compile()

    repository = module.get<AuthRepository>(AuthRepository)
    jest.clearAllMocks()
  })

  it('should create an account and return the created account', async () => {
    mockPrisma.account.create.mockResolvedValue(mockAccountCreated)

    const result = await repository.createAccount(newAccountPayload)

    expect(result).toEqual(mockAccountCreated)
    expect(mockPrisma.account.create).toHaveBeenCalledWith({
      data: {
        hashedRefreshToken: null,
        email: newAccountPayload.email,
        password: newAccountPayload.password,
        role: {
          connect: {
            code: newAccountPayload.role as unknown as number,
          },
        },
      },
      include: {
        role: {
          omit: {
            id: true,
          },
        },
      },
      omit: {
        hashedRefreshToken: true,
        roleId: true,
        password: true,
        userId: true,
      },
    })
  })

  it('should call PrismaErrorService when create account fails', async () => {
    const error = new Error('Prisma error')
    mockPrisma.account.create.mockRejectedValue(error)

    try {
      await repository.createAccount(newAccountPayload)
    } catch {}

    expect(mockPrismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('should find an account by email with correct query params', async () => {
    mockPrisma.account.findFirst.mockResolvedValue(mockAccount)

    const result = await repository.findAccountByEmail('john@example.com')

    expect(result).toEqual(mockAccount)
    expect(mockPrisma.account.findFirst).toHaveBeenCalledWith({
      where: { email: 'john@example.com' },
      omit: {
        roleId: true,
      },
      include: {
        role: {
          omit: {
            id: true,
          },
        },
      },
    })
  })

  it('should return null when account is not found by email', async () => {
    mockPrisma.account.findFirst.mockResolvedValue(null)

    const result = await repository.findAccountByEmail('notfound@example.com')

    expect(result).toBeNull()
  })

  it('should call PrismaErrorService when findAccountByEmail fails', async () => {
    const error = new Error('Prisma error')
    mockPrisma.account.findFirst.mockRejectedValue(error)

    try {
      await repository.findAccountByEmail('john@example.com')
    } catch {}

    expect(mockPrismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('should get refresh token data for an account', async () => {
    mockPrisma.account.findUnique.mockResolvedValue(mockAccountRefreshToken)

    const result = await repository.getRefreshToken('acc-001')

    expect(result).toEqual(mockAccountRefreshToken)
    expect(mockPrisma.account.findUnique).toHaveBeenCalledWith({
      where: { id: 'acc-001' },
      select: {
        id: true,
        email: true,
        hashedRefreshToken: true,
        role: { select: { code: true } },
      },
    })
  })

  it('should call PrismaErrorService with NotFoundException when account is not found for refresh token', async () => {
    mockPrisma.account.findUnique.mockResolvedValue(null)

    await repository.getRefreshToken('non-existent')

    expect(mockPrismaErrorService.handleError).toHaveBeenCalledWith(
      expect.any(NotFoundException),
    )
  })

  it('should call PrismaErrorService when getRefreshToken fails', async () => {
    const error = new Error('Prisma error')
    mockPrisma.account.findUnique.mockRejectedValue(error)

    try {
      await repository.getRefreshToken('acc-001')
    } catch {}

    expect(mockPrismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('should remove hashed refresh token from account', async () => {
    mockPrisma.account.update.mockResolvedValue(mockAccount)

    await repository.removeHashedRefreshToken('acc-001')

    expect(mockPrisma.account.update).toHaveBeenCalledWith({
      where: { id: 'acc-001' },
      data: { hashedRefreshToken: null },
    })
  })

  it('should call PrismaErrorService when removeHashedRefreshToken fails', async () => {
    const error = new Error('Prisma error')
    mockPrisma.account.update.mockRejectedValue(error)

    try {
      await repository.removeHashedRefreshToken('acc-001')
    } catch {}

    expect(mockPrismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('should update account password', async () => {
    mockPrisma.account.update.mockResolvedValue(mockAccount)

    await repository.updateAccountPassword('john@example.com', 'new-hashed-pw')

    expect(mockPrisma.account.update).toHaveBeenCalledWith({
      where: { email: 'john@example.com' },
      data: { password: 'new-hashed-pw' },
    })
  })

  it('should call PrismaErrorService when updateAccountPassword fails', async () => {
    const error = new Error('Prisma error')
    mockPrisma.account.update.mockRejectedValue(error)

    try {
      await repository.updateAccountPassword('john@example.com', 'new-pw')
    } catch {}

    expect(mockPrismaErrorService.handleError).toHaveBeenCalledWith(error)
  })

  it('should update refresh token for account', async () => {
    mockPrisma.account.update.mockResolvedValue(mockAccount)

    await repository.updateRefreshToken('acc-001', 'hashed-refresh-token')

    expect(mockPrisma.account.update).toHaveBeenCalledWith({
      where: { id: 'acc-001' },
      data: { hashedRefreshToken: 'hashed-refresh-token' },
    })
  })

  it('should call PrismaErrorService when updateRefreshToken fails', async () => {
    const error = new Error('Prisma error')
    mockPrisma.account.update.mockRejectedValue(error)

    try {
      await repository.updateRefreshToken('acc-001', 'hashed-token')
    } catch {}

    expect(mockPrismaErrorService.handleError).toHaveBeenCalledWith(error)
  })
})
