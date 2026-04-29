import { UnauthorizedException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'

describe('AuthController', () => {
  let controller: AuthController
  let service: AuthService

  const mockUser = { id: 'u1', roleId: 'r1' }
  const mockTokens = { accessToken: 'access-token', refreshToken: 'refresh-token' }

  const mockReq = (cookies: Record<string, string> = {}) => ({
    ip: '127.0.0.1',
    headers: { 'user-agent': 'jest' },
    cookies,
  })

  const mockRes = () => ({
    cookie: jest.fn(),
    clearCookie: jest.fn(),
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

  it('should login, set cookie and return user + accessToken', async () => {
    jest.spyOn(service, 'login').mockResolvedValue({ user: mockUser, tokens: mockTokens } as any)
    const req = mockReq()
    const res = mockRes()

    const result = await controller.login({ email: 'a@a.com', password: '123' }, req as any, res as any)

    expect(service.login).toHaveBeenCalledWith({ email: 'a@a.com', password: '123' }, req.ip, req.headers['user-agent'])
    expect(res.cookie).toHaveBeenCalledWith('refreshToken', mockTokens.refreshToken, expect.any(Object))
    expect(result).toEqual({ user: mockUser, accessToken: mockTokens.accessToken })
  })

  it('should register and return the created user', async () => {
    jest.spyOn(service, 'register').mockResolvedValue(mockUser as any)
    const dto = { name: 'N', email: 'a@a.com', password: '123', role: 'ADMIN' }

    const result = await controller.register(dto)

    expect(service.register).toHaveBeenCalledWith(dto)
    expect(result).toEqual(mockUser)
  })

  it('should refresh token, set cookie and return accessToken', async () => {
    jest.spyOn(service, 'refresh').mockResolvedValue(mockTokens)
    const req = mockReq({ refreshToken: 'old-refresh' })
    const res = mockRes()

    const result = await controller.refresh(req as any, res as any)

    expect(service.refresh).toHaveBeenCalledWith('old-refresh', req.ip, req.headers['user-agent'])
    expect(res.cookie).toHaveBeenCalledWith('refreshToken', mockTokens.refreshToken, expect.any(Object))
    expect(result).toEqual({ accessToken: mockTokens.accessToken })
  })

  it('should throw UnauthorizedException when refreshToken cookie is missing', async () => {
    const req = mockReq()
    const res = mockRes()

    await expect(controller.refresh(req as any, res as any)).rejects.toThrow(UnauthorizedException)
    expect(service.refresh).not.toHaveBeenCalled()
  })

  it('should logout, clear cookie and return message', async () => {
    jest.spyOn(service, 'logout').mockResolvedValue(undefined)
    const req = mockReq({ refreshToken: 'some-token' })
    const res = mockRes()

    const result = await controller.logout(req as any, res as any)

    expect(service.logout).toHaveBeenCalledWith('some-token')
    expect(res.clearCookie).toHaveBeenCalledWith('refreshToken')
    expect(result).toEqual({ message: 'Logged out' })
  })

  it('should logout without calling service when cookie is missing', async () => {
    jest.spyOn(service, 'logout').mockResolvedValue(undefined)
    const req = mockReq()
    const res = mockRes()

    const result = await controller.logout(req as any, res as any)

    expect(service.logout).not.toHaveBeenCalled()
    expect(res.clearCookie).toHaveBeenCalledWith('refreshToken')
    expect(result).toEqual({ message: 'Logged out' })
  })
})
