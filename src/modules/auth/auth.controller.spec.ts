import { UnauthorizedException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'

describe('AuthController', () => {
  let controller: AuthController
  let service: AuthService

  const mockUser = { id: 'u1', roleId: 'r1' }
  const mockTokens = { accessToken: 'access-token', refreshToken: 'refresh-token' }

  const mockReq = () => ({
    ip: '127.0.0.1',
    headers: { 'user-agent': 'jest' },
  })

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            register: jest.fn(),
            refresh: jest.fn(),
            logout: jest.fn(),
          },
        },
      ],
    }).compile()

    controller = module.get<AuthController>(AuthController)
    service = module.get<AuthService>(AuthService)
  })

  it('should login and return user + tokens', async () => {
    jest.spyOn(service, 'login').mockResolvedValue({ user: mockUser, tokens: mockTokens } as any)
    const req = mockReq()

    const result = await controller.login({ email: 'a@a.com', password: '123' }, req as any)

    expect(service.login).toHaveBeenCalledWith({ email: 'a@a.com', password: '123' }, req.ip, req.headers['user-agent'])
    expect(result).toEqual({ user: mockUser, tokens: mockTokens })
  })

  it('should register and return the created user', async () => {
    jest.spyOn(service, 'register').mockResolvedValue(mockUser as any)
    const dto = { name: 'N', email: 'a@a.com', password: '123', role: 'ADMIN' }

    const result = await controller.register(dto)

    expect(service.register).toHaveBeenCalledWith(dto)
    expect(result).toEqual(mockUser)
  })

  it('should refresh token and return tokens', async () => {
    jest.spyOn(service, 'refresh').mockResolvedValue(mockTokens)
    const req = mockReq()

    const result = await controller.refresh(`Bearer ${mockTokens.refreshToken}`, req as any)

    expect(service.refresh).toHaveBeenCalledWith(mockTokens.refreshToken, req.ip, req.headers['user-agent'])
    expect(result).toEqual({ tokens: mockTokens })
  })

  it('should throw UnauthorizedException when authorization header is missing', async () => {
    const req = mockReq()

    await expect(controller.refresh(undefined, req as any)).rejects.toThrow(UnauthorizedException)
    expect(service.refresh).not.toHaveBeenCalled()
  })

  it('should logout and return message', async () => {
    jest.spyOn(service, 'logout').mockResolvedValue(undefined)

    const result = await controller.logout(`Bearer ${mockTokens.refreshToken}`)

    expect(service.logout).toHaveBeenCalledWith(mockTokens.refreshToken)
    expect(result).toEqual({ message: 'Logged out' })
  })

  it('should logout without calling service when authorization header is missing', async () => {
    jest.spyOn(service, 'logout').mockResolvedValue(undefined)

    const result = await controller.logout(undefined)

    expect(service.logout).not.toHaveBeenCalled()
    expect(result).toEqual({ message: 'Logged out' })
  })
})
