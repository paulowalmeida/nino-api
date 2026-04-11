import { HttpException, UnauthorizedException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { AuthService } from '@auth/services/auth.service'
import { AuthRepository } from '@auth/auth.repository'
import { PasswordService } from '@auth/services/password.service'
import { TokenService } from '@auth/services/token.service'
import { ChangePasswordRequestDTO } from '@auth/dtos/change-password-request.dto'
import { LoginRequestDTO } from '@auth/dtos/login-request.dto'
import { NewAccountRequestDTO } from '@auth/dtos/new-account-request.dto'
import type { AuthRequest } from '@auth/types/account/account-auth-request.type'
import { Account } from '@auth/types/account/account.type'
import { AccountTokenData } from '@auth/types/account/account-token.data.type'
import { AccountRepository } from '@auth/types/account/account-repository.type'
import { LoginResponse } from '@auth/types/login-response.type'
import { Tokens } from '@auth/types/tokens.type'

// ─── Mock dependencies ───────────────────────
const mockAuthRepository = {
  findAccountByEmail: jest.fn<Promise<AccountRepository | null>, [string]>(), // Espera um string
  createAccount: jest.fn<Promise<Account>, [NewAccountRequestDTO]>(), // Espera um DTO
  getRefreshToken: jest.fn<Promise<AccountRepository | null>, [string]>(), // Espera um string
  updateRefreshToken: jest.fn<Promise<void>, [string, string]>(), // Espera dois strings
  removeHashedRefreshToken: jest.fn<Promise<void>, [string]>(), // Espera um string
  updateAccountPassword: jest.fn<Promise<void>, [string, string]>(), // Espera dois strings
}

const mockPasswordService = {
  hash: jest.fn<Promise<string>, [string]>(), // Espera um string
  compare: jest.fn<Promise<boolean>, [string, string]>(), // Espera dois strings
  validate: jest.fn<Promise<void>, [string, string]>(), // Espera dois strings
}

const mockTokenService = {
  getTokens: jest.fn<Promise<Tokens>, [AccountTokenData]>(), // Espera um tipo específico
}

// ─── Fixtures ────────────────────────────────
const mockAccountRepository: AccountRepository = {
  id: 'acc-001',
  email: 'john@example.com',
  password: '$2b$10$hashedPassword',
  hashedRefreshToken: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  role: { code: 3, description: 'MERCHANT' },
  userId: '1',
}

const mockAccount: Account = {
  id: 'acc-001',
  email: 'john@example.com',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  role: { code: 3, description: 'MERCHANT' },
}

const mockAccountRefreshData = {
  id: 'acc-001',
  userId: '1',
  email: 'john@example.com',
  password: '$2b$10$hashedPassword',
  hashedRefreshToken: '$2b$10$hashedRefresh',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  role: { code: 3, description: 'MERCHANT' },
}

const mockTokens: Tokens = {
  accessToken: 'access-token',
  refreshToken: 'refresh-token',
}

const loginPayload: LoginRequestDTO = {
  email: 'john@example.com',
  password: 'password123',
}

const newAccountPayload: NewAccountRequestDTO = {
  email: 'john@example.com',
  password: 'password123',
  role: 3,
}

const changePasswordPayload: ChangePasswordRequestDTO = {
  oldPassword: 'password123',
  newPassword: 'newpassword1',
}

const mockAuthRequest: AuthRequest = {
  account: {
    sub: 'acc-001',
    email: 'john@example.com',
    role: 3,
  },
} as unknown as AuthRequest

describe('AuthService', () => {
  let service: AuthService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthRepository, useValue: mockAuthRepository },
        { provide: PasswordService, useValue: mockPasswordService },
        { provide: TokenService, useValue: mockTokenService },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    jest.clearAllMocks()
    mockPasswordService.hash.mockResolvedValue('hashed-value')
    mockPasswordService.validate.mockResolvedValue(undefined)
    mockTokenService.getTokens.mockResolvedValue(mockTokens)
  })

  it('should change password successfully and return success message', async () => {
    mockAuthRepository.findAccountByEmail.mockResolvedValue(
      mockAccountRepository,
    )

    const result = await service.changePassword(
      mockAuthRequest,
      changePasswordPayload,
    )

    expect(result).toEqual({ message: 'Password changed successfully' })
    expect(mockAuthRepository.findAccountByEmail).toHaveBeenCalledWith(
      'john@example.com',
    )
    expect(mockPasswordService.validate).toHaveBeenCalledWith(
      'password123',
      '$2b$10$hashedPassword',
    )
    expect(mockPasswordService.hash).toHaveBeenCalledWith('newpassword1')
    expect(mockAuthRepository.updateAccountPassword).toHaveBeenCalledWith(
      'john@example.com',
      'hashed-value',
    )
  })

  it('should throw UnauthorizedException when account is not found for change password', async () => {
    mockAuthRepository.findAccountByEmail.mockResolvedValue(null)

    await expect(
      service.changePassword(mockAuthRequest, changePasswordPayload),
    ).rejects.toThrow(UnauthorizedException)
  })

  it('should throw UnauthorizedException when old password is incorrect', async () => {
    mockAuthRepository.findAccountByEmail.mockResolvedValue(
      mockAccountRepository,
    )
    mockPasswordService.validate.mockRejectedValue(
      new UnauthorizedException('Invalid credentials'),
    )

    await expect(
      service.changePassword(mockAuthRequest, changePasswordPayload),
    ).rejects.toThrow(UnauthorizedException)
  })

  it('should create account with hashed password', async () => {
    mockAuthRepository.createAccount.mockResolvedValue(mockAccount)

    const result = await service.createAccount(newAccountPayload)

    expect(mockPasswordService.hash).toHaveBeenCalledWith('password123')
    expect(mockAuthRepository.createAccount).toHaveBeenCalledWith({
      ...newAccountPayload,
      password: 'hashed-value',
    })
    expect(result).toEqual(mockAccount)
  })

  it('should return account without sensitive fields', async () => {
    mockAuthRepository.findAccountByEmail.mockResolvedValue(
      mockAccountRepository,
    )

    const result = await service.getAccount('john@example.com')

    expect(result).toEqual({
      id: 'acc-001',
      email: 'john@example.com',
      createdAt: mockAccountRepository.createdAt,
      updatedAt: mockAccountRepository.updatedAt,
      role: mockAccountRepository.role,
    })
  })

  it('should throw UnauthorizedException when account is not found for getAccount', async () => {
    mockAuthRepository.findAccountByEmail.mockResolvedValue(null)

    await expect(service.getAccount('unknown@email.com')).rejects.toThrow(
      UnauthorizedException,
    )
  })

  it('should return login response with account and tokens', async () => {
    mockAuthRepository.findAccountByEmail.mockResolvedValue(
      mockAccountRepository,
    )

    const result: LoginResponse = await service.login(loginPayload)

    expect(mockPasswordService.validate).toHaveBeenCalledWith(
      'password123',
      '$2b$10$hashedPassword',
    )
    expect(mockTokenService.getTokens).toHaveBeenCalledWith({
      sub: 'acc-001',
      email: 'john@example.com',
      role: 3,
    })
    expect(mockPasswordService.hash).toHaveBeenCalledWith('refresh-token')
    expect(mockAuthRepository.updateRefreshToken).toHaveBeenCalledWith(
      'acc-001',
      'hashed-value',
    )
    expect(result.account).toEqual(mockAccount)
    expect(result.tokens).toEqual(mockTokens)
  })

  it('should throw UnauthorizedException when account is not found for login', async () => {
    mockAuthRepository.findAccountByEmail.mockResolvedValue(null)

    await expect(service.login(loginPayload)).rejects.toThrow(
      UnauthorizedException,
    )
  })

  it('should throw UnauthorizedException when password is incorrect for login', async () => {
    mockAuthRepository.findAccountByEmail.mockResolvedValue(
      mockAccountRepository,
    )
    mockPasswordService.validate.mockRejectedValue(
      new UnauthorizedException('Invalid credentials'),
    )

    await expect(service.login(loginPayload)).rejects.toThrow(
      UnauthorizedException,
    )
  })

  it('should throw HttpException when account role is not found', async () => {
    const accountNoRole: AccountRepository = {
      ...mockAccountRepository,
      role: { code: 0, description: 'UNSPECIFIED' },
    }
    mockAuthRepository.findAccountByEmail.mockResolvedValue(accountNoRole)

    await expect(service.login(loginPayload)).rejects.toThrow(HttpException)
  })

  it('should remove hashed refresh token from account on logout', async () => {
    mockAuthRepository.removeHashedRefreshToken.mockResolvedValue(undefined)

    await service.logout('acc-001')

    expect(mockAuthRepository.removeHashedRefreshToken).toHaveBeenCalledWith(
      'acc-001',
    )
  })

  it('should issue new tokens and update refresh token', async () => {
    mockAuthRepository.getRefreshToken.mockResolvedValue(mockAccountRefreshData)

    const result: Tokens = await service.refreshToken(
      'acc-001',
      'some-plain-token',
    )

    expect(mockAuthRepository.getRefreshToken).toHaveBeenCalledWith('acc-001')
    expect(mockPasswordService.validate).toHaveBeenCalledWith(
      'some-plain-token',
      '$2b$10$hashedRefresh',
    )
    expect(mockTokenService.getTokens).toHaveBeenCalledWith({
      sub: 'acc-001',
      email: 'john@example.com',
      role: 3,
    })
    expect(mockPasswordService.hash).toHaveBeenCalledWith('refresh-token')
    expect(mockAuthRepository.updateRefreshToken).toHaveBeenCalledWith(
      'acc-001',
      'hashed-value',
    )
    expect(result).toEqual(mockTokens)
  })

  it('should throw UnauthorizedException when refresh token is undefined', async () => {
    mockAuthRepository.getRefreshToken.mockResolvedValue(mockAccountRefreshData)

    await expect(service.refreshToken('acc-001', undefined)).rejects.toThrow(
      UnauthorizedException,
    )
  })

  it('should throw UnauthorizedException when hashed refresh token is null', async () => {
    mockAuthRepository.getRefreshToken.mockResolvedValue({
      ...mockAccountRefreshData,
      hashedRefreshToken: null,
    })

    await expect(service.refreshToken('acc-001', 'some-token')).rejects.toThrow(
      UnauthorizedException,
    )
  })

  it('should throw UnauthorizedException when refresh token does not match hash', async () => {
    mockAuthRepository.getRefreshToken.mockResolvedValue(mockAccountRefreshData)
    mockPasswordService.validate.mockRejectedValue(
      new UnauthorizedException('Invalid credentials'),
    )

    await expect(
      service.refreshToken('acc-001', 'wrong-token'),
    ).rejects.toThrow(UnauthorizedException)
  })
})
