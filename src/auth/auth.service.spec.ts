import { UnauthorizedException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { CredentialsService } from '@credential/credential.service'
import { SessionService } from '@session/session.service'
import { PasswordService } from '@shared/services/password/password.service'
import { TokenService } from '@shared/services/token/token.service'
import { UserService } from '@user/user.service'
import { AuthService } from './auth.service'

describe('AuthService', () => {
  let service: AuthService
  let userService: UserService
  let credService: CredentialsService
  let sessionService: SessionService
  let passService: PasswordService
  let tokenService: TokenService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: { findById: jest.fn(), create: jest.fn() },
        },
        {
          provide: CredentialsService,
          useValue: { getByEmail: jest.fn(), create: jest.fn() },
        },
        {
          provide: SessionService,
          useValue: {
            create: jest.fn(),
            getByRefreshToken: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: PasswordService,
          useValue: { compare: jest.fn(), hash: jest.fn() },
        },
        {
          provide: TokenService,
          useValue: {
            generateTokens: jest.fn(),
            verifyRefreshToken: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    userService = module.get<UserService>(UserService)
    credService = module.get<CredentialsService>(CredentialsService)
    sessionService = module.get<SessionService>(SessionService)
    passService = module.get<PasswordService>(PasswordService)
    tokenService = module.get<TokenService>(TokenService)
  })

  // it('should login successfully', async () => {
  //   const mockCred = { userId: 'u1', password: 'hash' }
  //   const mockUser = { id: 'u1', roleId: 'r1' }
  //   const mockTokens = { accessToken: 'a', refreshToken: 'r' }

  //   jest.spyOn(credService, 'getByEmail').mockResolvedValue(mockCred as any)
  //   jest.spyOn(passService, 'compare').mockResolvedValue(true)
  //   jest.spyOn(userService, 'getById').mockResolvedValue(mockUser as any)
  //   jest.spyOn(tokenService, 'generateTokens').mockResolvedValue(mockTokens)

  //   const result = await service.login({ email: 't@t.com', password: '123' })
  //   expect(result.user).toEqual(mockUser)
  //   expect(sessionService.create).toHaveBeenCalled()
  // })

  it('should throw UnauthorizedException on invalid password', async () => {
    jest
      .spyOn(credService, 'getByEmail')
      .mockResolvedValue({ password: 'hash' } as any)
    jest.spyOn(passService, 'compare').mockResolvedValue(false)

    await expect(
      service.login({ email: 't@t.com', password: '123' }),
    ).rejects.toThrow(UnauthorizedException)
  })

  it('should register a new user and credentials', async () => {
    const dto = { name: 'N', email: 'e', password: 'p', roleId: 'r' }
    jest.spyOn(userService, 'create').mockResolvedValue({ id: 'u1' } as any)

    await service.register(dto)
    expect(userService.create).toHaveBeenCalled()
    expect(credService.create).toHaveBeenCalled()
  })

  it('should logout by deleting session', async () => {
    jest
      .spyOn(sessionService, 'getByRefreshToken')
      .mockResolvedValue({ id: 's1' } as any)
    await service.logout('token')
    expect(sessionService.delete).toHaveBeenCalledWith('s1')
  })

  it('should refresh tokens', async () => {
    jest
      .spyOn(tokenService, 'verifyRefreshToken')
      .mockResolvedValue({ sub: 'u1', role: 'r' })
    jest
      .spyOn(sessionService, 'getByRefreshToken')
      .mockResolvedValue({ id: 's1' } as any)
    jest
      .spyOn(tokenService, 'generateTokens')
      .mockResolvedValue({ accessToken: 'new-a', refreshToken: 'new-r' })

    const result = await service.refresh('old-r')
    expect(result.accessToken).toBe('new-a')
    expect(sessionService.update).toHaveBeenCalled()
  })
})
