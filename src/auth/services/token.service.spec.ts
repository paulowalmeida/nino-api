import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

import { TokenService } from '@auth/services/token.service'
import { AccountTokenData } from '@auth/types/account/account-token.data.type'
import { Tokens } from '@auth/types/tokens.type'

const mockJwtService = {
  signAsync: jest.fn<Promise<string>>(),
}

const mockConfigService = {
  get: jest.fn<string | undefined>(),
}

const mockAccountTokenData: AccountTokenData = {
  sub: 'acc-001',
  email: 'john@example.com',
  role: 3,
}

describe('TokenService', () => {
  let service: TokenService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile()

    service = module.get<TokenService>(TokenService)
    jest.clearAllMocks()
    mockConfigService.get.mockReturnValue('mock-jwt-secret')
    mockJwtService.signAsync.mockResolvedValue('mocked-jwt-token')
  })

  it('should return access and refresh tokens with correct configuration', async () => {
    mockJwtService.signAsync
      .mockResolvedValueOnce('mocked-access-token')
      .mockResolvedValueOnce('mocked-refresh-token')

    const result: Tokens = await service.getTokens(mockAccountTokenData)

    expect(result).toEqual({
      accessToken: 'mocked-access-token',
      refreshToken: 'mocked-refresh-token',
    })
    expect(mockConfigService.get).toHaveBeenCalledWith('JWT_SECRET')
    expect(mockConfigService.get).toHaveBeenCalledWith('JWT_REFRESH_SECRET')
    expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2)
    expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(1, mockAccountTokenData, {
      secret: 'mock-jwt-secret',
      expiresIn: '15m',
    })
    expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(2, mockAccountTokenData, {
      secret: 'mock-jwt-secret',
      expiresIn: '7d',
    })
  })

  it('should use role 0 when account role is undefined', async () => {
    mockJwtService.signAsync
      .mockResolvedValueOnce('access')
      .mockResolvedValueOnce('refresh')

    const tokenDataWithoutRole: AccountTokenData = {
      sub: 'acc-001',
      email: 'john@example.com',
      role: 0,
    }

    await service.getTokens(tokenDataWithoutRole)

    const expectedPayload: AccountTokenData = {
      sub: 'acc-001',
      email: 'john@example.com',
      role: 0,
    }
    expect(mockJwtService.signAsync).toHaveBeenCalledWith(expectedPayload, {
      secret: 'mock-jwt-secret',
      expiresIn: '7d',
    })
  })

  it('should propagate error when jwtService.signAsync fails', async () => {
    mockJwtService.signAsync.mockRejectedValue(new Error('JWT sign failed'))

    await expect(service.getTokens(mockAccountTokenData)).rejects.toThrow(
      'JWT sign failed',
    )
  })
})
