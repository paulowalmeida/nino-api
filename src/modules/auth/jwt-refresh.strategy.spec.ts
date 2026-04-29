import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'

import { JwtRefreshStrategy } from './jwt-refresh.strategy'

describe('JwtRefreshStrategy', () => {
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

  it('should throw when JWT_REFRESH_SECRET is not set', () => {
    expect(
      () =>
        new JwtRefreshStrategy({
          get: jest.fn().mockReturnValue(undefined),
        } as any),
    ).toThrow("JWT_REFRESH_SECRET don't be defined in the environment variables.")
  })

  it('should validate and return payload with hashedRefreshToken', async () => {
    const req = { headers: { authorization: 'Bearer my-token' }, user: undefined } as any
    const payload = { sub: 'u1', role: 'admin' } as any

    const result = await strategy.validate(req, payload)

    expect(result).toEqual({ ...payload, hashedRefreshToken: 'my-token' })
    expect(req['user']).toEqual(result)
  })

  it('should use empty string when authorization header is absent', async () => {
    const req = { headers: {}, user: undefined } as any
    const payload = { sub: 'u1', role: 'admin' } as any

    const result = await strategy.validate(req, payload)

    expect(result.hashedRefreshToken).toBe('')
  })
})
