import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'

import { AccountTokenData } from '@auth/types/account/account-token.data.type'
import { Request } from 'express'

import { JwtRefreshStrategy } from '@auth/jwt-refresh.strategy'

const mockConfigService = {
  get: jest.fn<string | undefined, [string]>(),
}

describe('JwtRefreshStrategy', () => {
  let strategy: JwtRefreshStrategy

  beforeEach(async () => {
    jest.clearAllMocks()
    mockConfigService.get.mockReturnValue('jwt-refresh-secret')

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtRefreshStrategy,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile()

    strategy = module.get<JwtRefreshStrategy>(JwtRefreshStrategy)
  })

  it('should throw Error when JWT_REFRESH_SECRET is not defined', () => {
    mockConfigService.get.mockReturnValue(undefined)

    expect(
      () =>
        new JwtRefreshStrategy(mockConfigService as unknown as ConfigService),
    ).toThrow(
      "JWT_REFRESH_SECRET don't be defined in the environment variables.",
    )
  })

  it('should attach hashedRefreshToken to account and return data with account payload', async () => {
    const mockRequest = {
      headers: { authorization: 'Bearer some-refresh-token' },
    } as unknown as Request

    const payload: AccountTokenData = {
      sub: 'acc-001',
      email: 'john@example.com',
      role: 3,
    }

    const result = await strategy.validate(mockRequest, payload)

    expect(result).toEqual({
      sub: 'acc-001',
      email: 'john@example.com',
      role: 3,
      hashedRefreshToken: 'some-refresh-token',
    })
    expect(mockRequest['account']).toEqual({
      sub: 'acc-001',
      email: 'john@example.com',
      role: 3,
      hashedRefreshToken: 'some-refresh-token',
    })
  })

  it('should use empty string when authorization header is missing', async () => {
    const mockRequest = {
      headers: {},
    } as unknown as Request

    const payload: AccountTokenData = {
      sub: 'acc-001',
      email: 'john@example.com',
      role: 3,
    }

    const result = await strategy.validate(mockRequest, payload)

    expect(result.hashedRefreshToken).toEqual('')
  })

  it('should extract token when authorization header does not start with Bearer', async () => {
    const mockRequest = {
      headers: { authorization: 'SomeToken' },
    } as unknown as Request

    const payload: AccountTokenData = {
      sub: 'acc-001',
      email: 'john@example.com',
      role: 3,
    }

    const result = await strategy.validate(mockRequest, payload)

    expect(result.hashedRefreshToken).toEqual('SomeToken')
  })
})
