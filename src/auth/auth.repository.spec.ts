import { Test, TestingModule } from '@nestjs/testing'
import { AuthRepository } from './auth.repository'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { UserRegisterRequestDTO } from '@auth/dtos/user-register-request.dto'
import { NotFoundException } from '@nestjs/common'

describe('AuthRepository', () => {
  let repository: AuthRepository
  let prisma: jest.Mocked<PrismaService>
  let prismaErrorService: jest.Mocked<PrismaErrorService>

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    personalData: {
      update: jest.fn(),
    },
  }

  const mockPrismaErrorService = {
    handleError: jest.fn().mockImplementation((error) => {
      throw error
    }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthRepository,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PrismaErrorService, useValue: mockPrismaErrorService },
      ],
    }).compile()

    repository = module.get<AuthRepository>(AuthRepository)
    prisma = module.get(PrismaService)
    prismaErrorService = module.get(PrismaErrorService)
  })

  describe('AuthRepository Unit Tests', () => {
    it('should create user successfully', async () => {
      // Arrange
      const payload: UserRegisterRequestDTO = {
        email: 'test@example.com',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
        role: 1,
      }
      const newUser = { id: '1', ...payload }
      mockPrismaService.user.create.mockResolvedValue(newUser)

      // Act
      const result = await repository.createUser(payload)

      // Assert
      expect(prisma.user.create).toHaveBeenCalled()
      expect(result).toEqual(newUser)
    })

    it('should handle error when creating user fails', async () => {
      // Arrange
      const payload: UserRegisterRequestDTO = { email: 'test@example.com' } as any
      const error = new Error('Database error')
      mockPrismaService.user.create.mockRejectedValue(error)

      // Act & Assert
      await expect(repository.createUser(payload)).rejects.toThrow(error)
      expect(prismaErrorService.handleError).toHaveBeenCalledWith(error, 'User already exists')
    })

    it('should find user by email successfully', async () => {
      // Arrange
      const email = 'test@example.com'
      const user = { id: '1', personalData: { email } }
      mockPrismaService.user.findFirst.mockResolvedValue(user)

      // Act
      const result = await repository.findUserByEmail(email)

      // Assert
      expect(prisma.user.findFirst).toHaveBeenCalledWith(expect.objectContaining({
        where: { personalData: { email } }
      }))
      expect(result).toEqual(user)
    })

    it('should handle error when findUserByEmail fails', async () => {
      // Arrange
      const email = 'test@example.com'
      const error = new Error('Database error')
      mockPrismaService.user.findFirst.mockRejectedValue(error)

      // Act & Assert
      await expect(repository.findUserByEmail(email)).rejects.toThrow(error)
      expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
    })

    it('should get refresh token successfully', async () => {
      // Arrange
      const id = '1'
      const user = { id, hashedRefreshToken: 'hashed' }
      mockPrismaService.user.findUnique.mockResolvedValue(user)

      // Act
      const result = await repository.getRefreshToken(id)

      // Assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({
        where: { id }
      }))
      expect(result).toEqual(user)
    })

    it('should throw NotFoundException when user is not found during getRefreshToken', async () => {
      // Arrange
      const id = '1'
      mockPrismaService.user.findUnique.mockResolvedValue(null)

      // Act & Assert
      await expect(repository.getRefreshToken(id)).rejects.toThrow(NotFoundException)
    })

    it('should handle error when getRefreshToken fails', async () => {
      // Arrange
      const id = '1'
      const error = new Error('Database error')
      mockPrismaService.user.findUnique.mockRejectedValue(error)

      // Act & Assert
      await expect(repository.getRefreshToken(id)).rejects.toThrow(error)
      expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
    })

    it('should remove hashed refresh token successfully', async () => {
      // Arrange
      const id = '1'
      mockPrismaService.user.update.mockResolvedValue({})

      // Act
      await repository.removeHashedRefreshToken(id)

      // Assert
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id },
        data: { hashedRefreshToken: null },
      })
    })

    it('should handle error when removeHashedRefreshToken fails', async () => {
      // Arrange
      const id = '1'
      const error = new Error('Database error')
      mockPrismaService.user.update.mockRejectedValue(error)

      // Act & Assert
      await expect(repository.removeHashedRefreshToken(id)).rejects.toThrow(error)
      expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
    })

    it('should update user password successfully', async () => {
      // Arrange
      const email = 'test@example.com'
      const newPassword = 'newPassword'
      mockPrismaService.personalData.update.mockResolvedValue({})

      // Act
      await repository.updateUserPassword(email, newPassword)

      // Assert
      expect(prisma.personalData.update).toHaveBeenCalledWith({
        where: { email },
        data: { password: newPassword },
      })
    })

    it('should handle error when updateUserPassword fails', async () => {
      // Arrange
      const email = 'test@example.com'
      const error = new Error('Database error')
      mockPrismaService.personalData.update.mockRejectedValue(error)

      // Act & Assert
      await expect(repository.updateUserPassword(email, 'new')).rejects.toThrow(error)
      expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
    })

    it('should update refresh token successfully', async () => {
      // Arrange
      const userId = '1'
      const hashedRefreshToken = 'hashed'
      mockPrismaService.user.update.mockResolvedValue({})

      // Act
      await repository.updateRefreshToken(userId, hashedRefreshToken)

      // Assert
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { hashedRefreshToken },
      })
    })

    it('should handle error when updateRefreshToken fails', async () => {
      // Arrange
      const userId = '1'
      const error = new Error('Database error')
      mockPrismaService.user.update.mockRejectedValue(error)

      // Act & Assert
      await expect(repository.updateRefreshToken(userId, 'hashed')).rejects.toThrow(error)
      expect(prismaErrorService.handleError).toHaveBeenCalledWith(error)
    })
  })
})
