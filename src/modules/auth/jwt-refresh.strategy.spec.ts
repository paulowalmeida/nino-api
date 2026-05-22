import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { UserTokenData } from '@user/types/user-token.data.type'
import { RefreshRequest } from './types/refresh-request.type'
import { JwtRefreshStrategy } from './jwt-refresh.strategy'

describe(JwtRefreshStrategy.name, () => {
  let strategy: JwtRefreshStrategy

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtRefreshStrategy,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test-refresh-secret') },
        },
      ],
    }).compile()

    strategy = module.get<JwtRefreshStrategy>(JwtRefreshStrategy)
  })

  afterEach(() => jest.clearAllMocks())

  it('should throw when JWT_REFRESH_SECRET is not set', () => {
    const config: Pick<ConfigService, 'get'> = {
      get: jest.fn().mockReturnValue(undefined),
    }

    expect(() => new JwtRefreshStrategy(config)).toThrow(
      "JWT_REFRESH_SECRET don't be defined in the environment variables.",
    )
  })

  it('should validate and return payload with hashedRefreshToken', () => {
    const req: RefreshRequest = {
      headers: { authorization: 'Bearer my-token' },
      user: undefined,
    }
    const payload: UserTokenData = { sub: 'u1', role: 'admin' }

    const result = strategy.validate(req, payload)

    expect(result).toEqual({ ...payload, hashedRefreshToken: 'my-token' })
    expect(req['user']).toEqual(result)
  })

  it('should use empty string when authorization header is absent', () => {
    const req: RefreshRequest = { headers: {}, user: undefined }
    const payload: UserTokenData = { sub: 'u1', role: 'admin' }

    const result = strategy.validate(req, payload)

    expect(result.hashedRefreshToken).toBe('')
  })
})
