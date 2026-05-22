import { UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'

import { TokenService } from './token.service'

describe('TokenService', () => {
  let service: TokenService
  let jwtService: JwtService
  let _configService: ConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'JWT_SECRET') return 'secret1'
              if (key === 'JWT_REFRESH_SECRET') return 'secret2'
              return null
            }),
          },
        },
      ],
    }).compile()

    service = module.get<TokenService>(TokenService)
    jwtService = module.get<JwtService>(JwtService)
    _configService = module.get<ConfigService>(ConfigService)
  })

  it('should generate access and refresh tokens', async () => {
    jest
      .spyOn(jwtService, 'signAsync')
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token')

    const payload = { sub: 'user-id', role: 'role-id' }
    const result = await service.generateTokens(payload)

    expect(jwtService.signAsync).toHaveBeenCalledWith(payload, {
      secret: 'secret1',
      expiresIn: '15m',
    })
    expect(jwtService.signAsync).toHaveBeenCalledWith(payload, {
      secret: 'secret2',
      expiresIn: '7d',
    })
    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    })
  })

  it('should verify a valid refresh token', async () => {
    const payload = { sub: 'user-id', role: 'role-id' }
    jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(payload)

    const result = await service.verifyRefreshToken('valid-token')

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token', {
      secret: 'secret2',
    })
    expect(result).toEqual(payload)
  })

  it('should throw UnauthorizedException if refresh token is invalid', async () => {
    jest
      .spyOn(jwtService, 'verifyAsync')
      .mockRejectedValue(new Error('jwt expired'))

    await expect(service.verifyRefreshToken('invalid-token')).rejects.toThrow(
      UnauthorizedException,
    )
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('invalid-token', {
      secret: 'secret2',
    })
  })
})
