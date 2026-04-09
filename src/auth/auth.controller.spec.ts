import { Test, TestingModule } from '@nestjs/testing'
import { AuthController } from './auth.controller'
import { AuthService } from '@auth/auth.service'
import { UserRegisterRequestDTO } from '@auth/dtos/user-register-request.dto'
import { LoginRequestDTO } from '@auth/dtos/login-request.dto'
import { ChangePasswordRequestDTO } from './dtos/change-password-request.dto'
import type { AuthRequest } from './types/user/user-auth-request.type'
import { UserCreated } from '@auth/types/user/user-created.type'
import { LoginResponse } from '@auth/types/login-response.type'
import { UserFound } from '@auth/types/user/user-found.type'
import { Tokens } from '@auth/types/tokens.type'

describe('AuthController', () => {
  let controller: AuthController
  let authService: jest.Mocked<AuthService>

  const mockAuthService = {
    createUser: jest.fn(),
    getUser: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
    changePassword: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile()

    controller = module.get<AuthController>(AuthController)
    authService = module.get(AuthService)
  })

  describe('AuthController Unit Tests', () => {
    it('should create user successfully', async () => {
      // Arrange
      const payload: UserRegisterRequestDTO = {
        email: 'test@example.com',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
        role: 1,
      }
      const expectedResult = { id: '1', ...payload } as unknown as UserCreated
      mockAuthService.createUser.mockResolvedValue(expectedResult)

      // Act
      const result = await controller.createUser(payload)

      // Assert
      expect(authService.createUser).toHaveBeenCalledWith(payload)
      expect(result).toEqual(expectedResult)
    })

    it('should get current user successfully', async () => {
      // Arrange
      const req: AuthRequest = {
        user: { sub: 'user-id', email: 'test@example.com', role: 1 },
      } as AuthRequest
      const expectedResult = { id: 'user-id', personalData: { email: 'test@example.com' } } as UserFound
      mockAuthService.getUser.mockResolvedValue(expectedResult)

      // Act
      const result = await controller.getCurrentUser(req)

      // Assert
      expect(authService.getUser).toHaveBeenCalledWith(req.user.email)
      expect(result).toEqual(expectedResult)
    })

    it('should login successfully', async () => {
      // Arrange
      const payload: LoginRequestDTO = { email: 'test@example.com', password: 'password' }
      const expectedResult: LoginResponse = {
        user: { id: '1' } as UserFound,
        tokens: { accessToken: 'at', refreshToken: 'rt' },
      }
      mockAuthService.login.mockResolvedValue(expectedResult)

      // Act
      const result = await controller.login(payload)

      // Assert
      expect(authService.login).toHaveBeenCalledWith(payload)
      expect(result).toEqual(expectedResult)
    })

    it('should delegate logout to authService with user sub', async () => {
      // Arrange
      const req: AuthRequest = {
        user: { sub: 'user-id', email: 'test@example.com', role: 1 },
      } as AuthRequest
      mockAuthService.logout.mockResolvedValue(undefined)

      // Act
      const result = await controller.logout(req)

      // Assert
      expect(authService.logout).toHaveBeenCalledWith('user-id')
      expect(result).toEqual({ message: 'Logout bem-sucedido' })
    })

    it('should delegate refreshToken to authService with user sub and token', async () => {
      // Arrange
      const req = {
        user: { sub: 'user-id', refreshToken: 'refresh-token' },
      } as unknown as AuthRequest
      const expectedResult: Tokens = {
        accessToken: 'new-token',
        refreshToken: 'new-refresh',
      }
      mockAuthService.refreshToken.mockResolvedValue(expectedResult)

      // Act
      const result = await controller.refreshToken(req)

      // Assert
      expect(authService.refreshToken).toHaveBeenCalledWith(
        'user-id',
        'refresh-token',
      )
      expect(result).toEqual(expectedResult)
    })

    it('should delegate changePassword to authService with request and body', async () => {
      // Arrange
      const req: AuthRequest = {
        user: { sub: 'user-id', email: 'test@example.com', role: 1 },
      } as AuthRequest
      const body: ChangePasswordRequestDTO = {
        oldPassword: 'old',
        newPassword: 'new',
      }
      const expectedResult = { message: 'Password changed successfully' }
      mockAuthService.changePassword.mockResolvedValue(expectedResult)

      // Act
      const result = await controller.changePassword(req, body)

      // Assert
      expect(authService.changePassword).toHaveBeenCalledWith(req, body)
      expect(result).toEqual(expectedResult)
    })
  })
})
