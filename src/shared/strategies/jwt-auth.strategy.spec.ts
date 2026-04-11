import { UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { Request } from 'express'

import { AuthRepository } from '@auth/auth.repository'
import { AuthRequest } from '@auth/types/account/account-auth-request.type'
import { AccountRepository } from '@auth/types/account/account-repository.type'
import { AccountTokenData } from '@auth/types/account/account-token.data.type'
import { JwtAuthStrategy } from '@shared/strategies/jwt-auth.strategy'

const mockAccountRepository: AccountRepository = {
  id: 'acc-001',
  email: 'john@example.com',
  password: '$2b$10$hashedPassword',
  hashedRefreshToken: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  role: { code: 3, description: 'MERCHANT' },
}

const mockAuthRepository = {
  findAccountByEmail: jest.fn<Promise<AccountRepository | null>>(),
}

const mockConfigService = {
  get: jest.fn<string | undefined>(),
}

describe('JwtAuthStrategy', () => {
  let strategy: JwtAuthStrategy

  beforeEach(async () => {
    jest.clearAllMocks()
    mockConfigService.get.mockReturnValue('jwt-secret')

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthStrategy,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: AuthRepository, useValue: mockAuthRepository },
      ],
    }).compile()

    strategy = module.get<JwtAuthStrategy>(JwtAuthStrategy)
  })

  it('should throw Error when JWT_SECRET is not defined', () => {
    mockConfigService.get.mockReturnValue(undefined)

    expect(
      () =>
        new JwtAuthStrategy(
          mockConfigService as unknown as ConfigService,
          mockAuthRepository as unknown as AuthRepository,
        ),
    ).toThrow("JWT_SECRET don't be defined in the environment variables.")
  })

  it('should validate and return payload when account exists', async () => {
    mockAuthRepository.findAccountByEmail.mockResolvedValue(
      mockAccountRepository,
    )

    const mockRequest: AuthRequest = {
      headers: {},
    } as unknown as AuthRequest

    const payload: AccountTokenData = {
      sub: 'acc-001',
      email: 'john@example.com',
      role: 3,
    }

    const result = await strategy.validate(mockRequest, payload)

    expect(mockAuthRepository.findAccountByEmail).toHaveBeenCalledWith(
      'john@example.com',
    )
    expect(result).toEqual(payload)
    expect(mockRequest['account']).toEqual(payload)
  })

  it('should throw UnauthorizedException when account does not exist', async () => {
    mockAuthRepository.findAccountByEmail.mockResolvedValue(null)

    const mockRequest: AuthRequest = {
      headers: {},
    } as unknown as AuthRequest

    const payload: AccountTokenData = {
      sub: 'acc-001',
      email: 'deleted@example.com',
      role: 3,
    }

    await expect(
      strategy.validate(mockRequest, payload),
    ).rejects.toThrow(UnauthorizedException)
  })
})
