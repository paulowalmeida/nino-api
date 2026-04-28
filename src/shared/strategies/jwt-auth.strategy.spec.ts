import { UnauthorizedException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'

import { UserRepository } from '@user/user.repository'
import { JwtAuthStrategy } from './jwt-auth.strategy'

describe('JwtAuthStrategy', () => {
  let strategy: JwtAuthStrategy
  let userRepository: UserRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthStrategy,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('test-secret') },
        },
        {
          provide: UserRepository,
          useValue: { getById: jest.fn() },
        },
      ],
    }).compile()

    strategy = module.get<JwtAuthStrategy>(JwtAuthStrategy)
    userRepository = module.get<UserRepository>(UserRepository)
  })

  it('should throw when JWT_SECRET is not set', () => {
    expect(
      () =>
        new JwtAuthStrategy(
          { get: jest.fn().mockReturnValue(undefined) } as any,
          {} as any,
        ),
    ).toThrow("JWT_SECRET don't be defined in the environment variables.")
  })

  it('should return payload when user exists', async () => {
    const payload = { sub: 'u1', role: 'admin' } as any
    jest.spyOn(userRepository, 'getById').mockResolvedValue({ id: 'u1' } as any)

    const result = await strategy.validate({} as any, payload)

    expect(result).toEqual(payload)
    expect(userRepository.getById).toHaveBeenCalledWith('u1')
  })

  it('should throw UnauthorizedException when user is not found', async () => {
    const payload = { sub: 'u1', role: 'admin' } as any
    jest.spyOn(userRepository, 'getById').mockResolvedValue(null as any)

    await expect(strategy.validate({} as any, payload)).rejects.toThrow(UnauthorizedException)
  })
})
