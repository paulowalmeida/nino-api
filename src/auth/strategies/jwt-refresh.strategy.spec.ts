import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { JwtRefreshStrategy } from './jwt-refresh.strategy'
import { UserTokenData } from '@auth/types/user/user-token.data.type'
import { Request } from 'express'

describe('JwtRefreshStrategy', () => {
  let strategy: JwtRefreshStrategy
  let configService: jest.Mocked<ConfigService>

  const mockConfigService = {
    get: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    mockConfigService.get.mockReturnValue('refresh-secret')

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtRefreshStrategy,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile()

    strategy = module.get<JwtRefreshStrategy>(JwtRefreshStrategy)
    configService = module.get(ConfigService)
  })

  describe('JwtRefreshStrategy Unit Tests', () => {
    it('should be defined', () => {
      expect(strategy).toBeDefined()
    })

    it('should throw error if JWT_REFRESH_SECRET is not defined', () => {
      // Arrange
      mockConfigService.get.mockReturnValue(null)

      // Act & Assert
      expect(() => new JwtRefreshStrategy(configService as any)).toThrow(
        "JWT_REFRESH_SECRET don't be defined in the environment variables.",
      )
    })

    it('should validate and return payload with refreshToken', async () => {
      // Arrange
      const payload: UserTokenData = { sub: '1', email: 'test@example.com', role: 1 }
      const req = {
        headers: {
          authorization: 'Bearer refresh-token',
        },
      } as Request

      // Act
      const result = await strategy.validate(req, payload)

      // Assert
      expect(result).toEqual({
        ...payload,
        refreshToken: 'refresh-token',
      })
    })

    it('should return empty string if authorization header is missing', async () => {
      // Arrange
      const payload: UserTokenData = { sub: '1', email: 'test@example.com', role: 1 }
      const req = {
        headers: {},
      } as Request

      // Act
      const result = await strategy.validate(req, payload)

      // Assert
      expect(result.refreshToken).toBe('')
    })
  })
})
