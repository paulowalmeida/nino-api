import { Injectable, NotFoundException } from '@nestjs/common'

import { NewUserRequestDTO } from '@auth/dtos/user-register-request.dto'
import { UserCreated } from '@auth/types/user/user-created.type'
import { UserFoundRepository } from '@auth/types/user/user-found.repository.type'
import { UserRefreshTokenRespository } from '@auth/types/user/user-refresh-token.repository.type'
import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

@Injectable()
export class AuthRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaErrorService: PrismaErrorService,
  ) {}

  async createUser(newRegister: NewUserRequestDTO): Promise<UserCreated> {
    try {
      const newUser = await this.prisma.user.create({
        data: {
          hashedRefreshToken: null,
          role: {
            connect: {
              code: newRegister.role as unknown as number,
            },
          },
          personalData: {
            create: {
              email: newRegister.email,
              password: newRegister.password,
              firstName: newRegister.firstName,
              lastName: newRegister.lastName,
            },
          },
        },
        include: {
          personalData: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          role: {
            omit: {
              id: true,
            },
          },
        },
        omit: {
          hashedRefreshToken: true,
          personalDataId: true,
          roleId: true,
        },
      })

      return newUser
    } catch (error) {
      this.prismaErrorService.handleError(error, 'User already exists')
    }
  }

  async findUserByEmail(email: string): Promise<UserFoundRepository | null> {
    try {
      return await this.prisma.user.findFirst({
        where: {
          personalData: { email },
        },
        omit: {
          hashedRefreshToken: true,
          personalDataId: true,
          roleId: true,
        },
        include: {
          personalData: {
            omit: {
              id: true,
            },
          },
          role: {
            omit: {
              id: true,
            },
          },
        },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async getRefreshToken(id: string): Promise<UserRefreshTokenRespository> {
    try {
      const result = await this.prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          hashedRefreshToken: true,
          personalData: { select: { email: true } },
          role: { select: { code: true } },
        },
      })

      if (!result) throw new NotFoundException('User not found')

      return result
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async removeHashedRefreshToken(id: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id },
        data: { hashedRefreshToken: null },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async updateRefreshToken(
    userId: string,
    hashedRefreshToken: string,
  ): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { hashedRefreshToken },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }
}
