import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { AuthRepository } from '@auth/auth.repository'
import { JwtAuthStrategy } from './jwt-auth.strategy'
import { UserTokenData } from '@auth/types/user/user-token.data.type'

describe('JwtAuthStrategy', () => {
  let strategy: JwtAuthStrategy
  let configService: jest.Mocked<ConfigService>
  let authRepository: jest.Mocked<AuthRepository>

  const mockConfig = {
    get: jest.fn().mockReturnValue('jwt-secret'),
  }

  const mockAuthRepository = {
    findUserByEmail: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    mockConfig.get.mockReturnValue('jwt-secret')

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthStrategy,
        { provide: ConfigService, useValue: mockConfig },
        { provide: AuthRepository, useValue: mockAuthRepository },
      ],
    }).compile()

    strategy = module.get<JwtAuthStrategy>(JwtAuthStrategy)
    configService = module.get(ConfigService)
    authRepository = module.get(AuthRepository)
  })

  describe('JwtAuthStrategy Unit Tests', () => {
    it('should throw error if JWT_SECRET is not defined', () => {
      mockConfig.get.mockReturnValue(null)
      expect(
        () => new JwtAuthStrategy(configService as any, authRepository as any),
      ).toThrow("JWT_SECRET don't be defined in the environment variables.")
    })

    it('should validate and return payload when user exists', async () => {
      const payload: UserTokenData = {
        sub: 'user-id',
        email: 'test@example.com',
        role: 1,
      }
      mockAuthRepository.findUserByEmail.mockResolvedValue({
        id: payload.sub,
        email: payload.email,
      } as any)

      const result = await strategy.validate(payload)

      expect(authRepository.findUserByEmail).toHaveBeenCalledWith(payload.email)
      expect(result).toEqual(payload)
    })

    it('should throw UnauthorizedException when user does not exist', async () => {
      const payload: UserTokenData = {
        sub: 'user-id',
        email: 'deleted@example.com',
        role: 1,
      }
      mockAuthRepository.findUserByEmail.mockResolvedValue(null)

      await expect(strategy.validate(payload)).rejects.toThrow(
        'Token inválido ou usuário não existe mais.',
      )
    })
  })
})
