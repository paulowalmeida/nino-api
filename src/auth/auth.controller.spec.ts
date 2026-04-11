import { Test, TestingModule } from '@nestjs/testing'
import { ThrottlerGuard } from '@nestjs/throttler'

import { AuthController } from '@auth/auth.controller'
import { ChangePasswordRequestDTO } from '@auth/dtos/change-password-request.dto'
import { LoginRequestDTO } from '@auth/dtos/login-request.dto'
import { NewAccountRequestDTO } from '@auth/dtos/new-account-request.dto'
import { AuthService } from '@auth/services/auth.service'
import { JwtRefreshGuard } from '@auth/jwt-refresh.guard'
import type { AuthRequest } from '@auth/types/account/account-auth-request.type'
import { Account } from '@auth/types/account/account.type'
import { AccountTokenData } from '@auth/types/account/account-token.data.type'
import { LoginResponse } from '@auth/types/login-response.type'
import { Tokens } from '@auth/types/tokens.type'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'

const mockAuthService = {
  createAccount: jest.fn<Promise<Account>>(),
  getAccount: jest.fn<Promise<Account>>(),
  login: jest.fn<Promise<LoginResponse>>(),
  logout: jest.fn<Promise<void>>(),
  refreshToken: jest.fn<Promise<Tokens>>(),
  changePassword: jest.fn<Promise<{ message: string }>>(),
}

const tokenData: AccountTokenData = {
  sub: 'acc-001',
  email: 'john@example.com',
  role: 3,
}

const mockAccount: Account = {
  id: 'acc-001',
  email: 'john@example.com',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  role: { code: 3, description: 'MERCHANT' },
}

const mockLoginResponse: LoginResponse = {
  account: mockAccount,
  tokens: {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  },
}

const mockTokens: Tokens = {
  accessToken: 'new-access-token',
  refreshToken: 'new-refresh-token',
}

const newAccountBody: NewAccountRequestDTO = {
  email: 'john@example.com',
  password: 'password123',
  role: 3,
}

const loginBody: LoginRequestDTO = {
  email: 'john@example.com',
  password: 'password123',
}

const changePasswordBody: ChangePasswordRequestDTO = {
  oldPassword: 'password123',
  newPassword: 'newpassword1',
}

const mockAuthRequest: AuthRequest = {
  account: tokenData,
} as unknown as AuthRequest

describe('AuthController', () => {
  let controller: AuthController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      .overrideGuard(JwtRefreshGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<AuthController>(AuthController)
    jest.clearAllMocks()
  })

  it('should delegate to authService.createAccount and return created account', async () => {
    mockAuthService.createAccount.mockResolvedValue(mockAccount)

    const result = await controller.createAccount(newAccountBody)

    expect(result).toEqual(mockAccount)
    expect(mockAuthService.createAccount).toHaveBeenCalledWith(newAccountBody)
  })

  it('should delegate to authService.getAccount and return current account', async () => {
    mockAuthService.getAccount.mockResolvedValue(mockAccount)

    const result = await controller.getCurrentAccount(mockAuthRequest)

    expect(result).toEqual(mockAccount)
    expect(mockAuthService.getAccount).toHaveBeenCalledWith('john@example.com')
  })

  it('should delegate to authService.login and return login response', async () => {
    mockAuthService.login.mockResolvedValue(mockLoginResponse)

    const result = await controller.login(loginBody)

    expect(result).toEqual(mockLoginResponse)
    expect(mockAuthService.login).toHaveBeenCalledWith(loginBody)
  })

  it('should delegate to authService.logout and return success message', async () => {
    mockAuthService.logout.mockResolvedValue(undefined)

    const result = await controller.logout(mockAuthRequest)

    expect(result).toEqual({ message: 'Logout bem-sucedido' })
    expect(mockAuthService.logout).toHaveBeenCalledWith('acc-001')
  })

  it('should delegate to authService.refreshToken with account id and hashed refresh token', async () => {
    const requestWithHash: AuthRequest = {
      ...mockAuthRequest,
      account: {
        ...tokenData,
        hashedRefreshToken: 'some-plain-token',
      },
    } as unknown as AuthRequest

    mockAuthService.refreshToken.mockResolvedValue(mockTokens)

    const result = await controller.refreshToken(requestWithHash)

    expect(result).toEqual(mockTokens)
    expect(mockAuthService.refreshToken).toHaveBeenCalledWith(
      'acc-001',
      'some-plain-token',
    )
  })

  it('should delegate to authService.changePassword and return success message', async () => {
    mockAuthService.changePassword.mockResolvedValue({
      message: 'Password changed successfully',
    })

    const result = await controller.changePassword(
      mockAuthRequest,
      changePasswordBody,
    )

    expect(result).toEqual({ message: 'Password changed successfully' })
    expect(mockAuthService.changePassword).toHaveBeenCalledWith(
      mockAuthRequest,
      changePasswordBody,
    )
  })

  it('should propagate error from authService.createAccount', async () => {
    mockAuthService.createAccount.mockRejectedValue(
      new Error('Account creation failed'),
    )

    await expect(controller.createAccount(newAccountBody)).rejects.toThrow(
      'Account creation failed',
    )
  })

  it('should propagate error from authService.login', async () => {
    mockAuthService.login.mockRejectedValue(new Error('Login failed'))

    await expect(controller.login(loginBody)).rejects.toThrow('Login failed')
  })
})
