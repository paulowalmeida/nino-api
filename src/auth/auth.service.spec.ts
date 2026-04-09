import {
  HttpException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import * as bcrypt from 'bcrypt'

import { AuthRepository } from '@auth/auth.repository'
import { AuthService } from '@auth/auth.service'
import { ChangePasswordRequestDTO } from '@auth/dtos/change-password-request.dto'
import { LoginRequestDTO } from '@auth/dtos/login-request.dto'
import { UserRegisterRequestDTO } from '@auth/dtos/user-register-request.dto'
import { AuthRequest } from '@auth/types/user/user-auth-request.type'
import { UserCreated } from '@auth/types/user/user-created.type'
import { UserFoundRepository } from '@auth/types/user/user-found.repository.type'
import { UserTokenData } from '@auth/types/user/user-token.data.type'

jest.mock('bcrypt')

describe('AuthService', () => {
  let service: AuthService
  let authRepository: jest.Mocked<AuthRepository>
  let jwtService: jest.Mocked<JwtService>
  let configService: jest.Mocked<ConfigService>

  const mockAuthRepository = {
    updateUserPassword: jest.fn(),
    createUser: jest.fn(),
    findUserByEmail: jest.fn(),
    removeHashedRefreshToken: jest.fn(),
    getRefreshToken: jest.fn(),
    updateRefreshToken: jest.fn(),
  }

  const mockJwtService = {
    signAsync: jest.fn(),
  }

  const mockConfigService = {
    get: jest.fn(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AuthRepository, useValue: mockAuthRepository },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    authRepository = module.get(AuthRepository)
    jwtService = module.get(JwtService)
    configService = module.get(ConfigService)
  })

  describe('AuthService Unit Tests', () => {
    it('should change password successfully', async () => {
      // Arrange
      const request = {
        user: { email: 'test@example.com' },
      } as AuthRequest
      const body: ChangePasswordRequestDTO = {
        oldPassword: 'oldPassword',
        newPassword: 'newPassword',
      }
      const userFound = {
        personalData: { email: 'test@example.com', password: 'hashedOldPassword' },
        role: { code: 1 },
      } as UserFoundRepository
      mockAuthRepository.findUserByEmail.mockResolvedValue(userFound)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword')

      // Act
      const result = await service.changePassword(request, body)

      // Assert
      expect(authRepository.findUserByEmail).toHaveBeenCalledWith(request.user.email)
      expect(bcrypt.compare).toHaveBeenCalledWith(body.oldPassword, userFound.personalData.password)
      expect(bcrypt.hash).toHaveBeenCalledWith(body.newPassword, 10)
      expect(authRepository.updateUserPassword).toHaveBeenCalledWith(request.user.email, 'hashedNewPassword')
      expect(result).toEqual({ message: 'Password changed successfully' })
    })

    it('should throw NotFoundException when user is not found during changePassword', async () => {
      // Arrange
      const request = { user: { email: 'test@example.com' } } as AuthRequest
      const body = { oldPassword: 'old', newPassword: 'new' } as ChangePasswordRequestDTO
      mockAuthRepository.findUserByEmail.mockResolvedValue(null)

      // Act & Assert
      await expect(service.changePassword(request, body)).rejects.toThrow(UnauthorizedException)
    })

    it('should create user successfully', async () => {
      // Arrange
      const payload: UserRegisterRequestDTO = {
        email: 'test@example.com',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
        role: 1,
      }
      const userCreated = { id: '1', ...payload } as unknown as UserCreated
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword')
      mockAuthRepository.createUser.mockResolvedValue(userCreated)

      // Act
      const result = await service.createUser(payload)

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(payload.password, 10)
      expect(authRepository.createUser).toHaveBeenCalledWith({
        ...payload,
        password: 'hashedPassword',
      })
      expect(result).toEqual(userCreated)
    })

    it('should get user by email successfully', async () => {
      // Arrange
      const email = 'test@example.com'
      const userFoundRepository = {
        id: '1',
        personalData: { email, password: 'hashedPassword', firstName: 'John', lastName: 'Doe' },
        role: { code: 1, name: 'USER' },
      } as UserFoundRepository
      mockAuthRepository.findUserByEmail.mockResolvedValue(userFoundRepository)

      // Act
      const result = await service.getUser(email)

      // Assert
      expect(authRepository.findUserByEmail).toHaveBeenCalledWith(email)
      expect(result.personalData).not.toHaveProperty('password')
      expect(result.id).toBe(userFoundRepository.id)
    })

    it('should login successfully', async () => {
      // Arrange
      const payload: LoginRequestDTO = { email: 'test@example.com', password: 'password' }
      const userFound = {
        id: '1',
        personalData: { email: 'test@example.com', password: 'hashedPassword' },
        role: { code: 1 },
      } as UserFoundRepository
      mockAuthRepository.findUserByEmail.mockResolvedValue(userFound)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashedRefreshToken')
      mockJwtService.signAsync.mockResolvedValueOnce('accessToken').mockResolvedValueOnce('refreshToken')
      mockConfigService.get.mockReturnValue('secret')

      // Act
      const result = await service.login(payload)

      // Assert
      expect(authRepository.findUserByEmail).toHaveBeenCalledWith(payload.email)
      expect(bcrypt.compare).toHaveBeenCalledWith(payload.password, userFound.personalData.password)
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2)
      expect(authRepository.updateRefreshToken).toHaveBeenCalledWith(userFound.id, 'hashedRefreshToken')
      expect(result).toEqual({
        user: expect.anything(),
        tokens: { accessToken: 'accessToken', refreshToken: 'refreshToken' },
      })
    })

    it('should throw UnauthorizedException when login fails due to invalid password', async () => {
      // Arrange
      const payload: LoginRequestDTO = { email: 'test@example.com', password: 'wrongPassword' }
      const userFound = {
        personalData: { password: 'hashedPassword' },
        role: { code: 1 },
      } as UserFoundRepository
      mockAuthRepository.findUserByEmail.mockResolvedValue(userFound)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      // Act & Assert
      await expect(service.login(payload)).rejects.toThrow(UnauthorizedException)
    })

    it('should throw UnauthorizedException when login fails because user not found', async () => {
      // Arrange
      const payload: LoginRequestDTO = { email: 'notfound@example.com', password: 'password' }
      mockAuthRepository.findUserByEmail.mockResolvedValue(null)

      // Act & Assert
      await expect(service.login(payload)).rejects.toThrow(UnauthorizedException)
    })

    it('should throw HttpException when user has no role during login', async () => {
      // Arrange
      const payload: LoginRequestDTO = { email: 'test@example.com', password: 'password' }
      const userFound = {
        id: '1',
        personalData: { email: 'test@example.com', password: 'hashedPassword' },
        role: { code: 0 },
      } as UserFoundRepository
      mockAuthRepository.findUserByEmail.mockResolvedValue(userFound)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      // Act & Assert
      await expect(service.login(payload)).rejects.toThrow(HttpException)
      await expect(service.login(payload)).rejects.toThrow('User role not found')
    })

    it('should logout successfully', async () => {
      // Arrange
      const userId = '1'
      mockAuthRepository.removeHashedRefreshToken.mockResolvedValue(undefined)

      // Act
      await service.logout(userId)

      // Assert
      expect(authRepository.removeHashedRefreshToken).toHaveBeenCalledWith(userId)
    })

    it('should refresh token successfully', async () => {
      // Arrange
      const userId = '1'
      const token = 'oldRefreshToken'
      const userRefreshToken = {
        id: userId,
        hashedRefreshToken: 'hashedOldRefreshToken',
        personalData: { email: 'test@example.com' },
        role: { code: 1 },
      }
      mockAuthRepository.getRefreshToken.mockResolvedValue(userRefreshToken)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewRefreshToken')
      mockJwtService.signAsync.mockResolvedValueOnce('newAccessToken').mockResolvedValueOnce('newRefreshToken')
      mockConfigService.get.mockReturnValue('secret')

      // Act
      const result = await service.refreshToken(userId, token)

      // Assert
      expect(authRepository.getRefreshToken).toHaveBeenCalledWith(userId)
      expect(bcrypt.compare).toHaveBeenCalledWith(token, userRefreshToken.hashedRefreshToken)
      expect(authRepository.updateRefreshToken).toHaveBeenCalledWith(userId, 'hashedNewRefreshToken')
      expect(result).toEqual({
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      })
    })

    it('should throw UnauthorizedException during refreshToken if hashedRefreshToken is null', async () => {
      // Arrange
      const userId = '1'
      const token = 'token'
      mockAuthRepository.getRefreshToken.mockResolvedValue({
        hashedRefreshToken: null,
      })

      // Act & Assert
      await expect(service.refreshToken(userId, token)).rejects.toThrow(UnauthorizedException)
    })

    it('should throw UnauthorizedException during refreshToken if compare fails', async () => {
      // Arrange
      const userId = '1'
      const token = 'invalidToken'
      mockAuthRepository.getRefreshToken.mockResolvedValue({
        hashedRefreshToken: 'hashedToken',
      })
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      // Act & Assert
      await expect(service.refreshToken(userId, token)).rejects.toThrow(UnauthorizedException)
    })
  })
})
