import { Injectable } from '@nestjs/common'

import { NewUserRequestDTO } from '@auth/dtos/user-register-request.dto'
import { UserCreated } from '@auth/types/user/user-created.type'
import { UserFoundRepository } from '@auth/types/user/user-found.repository.type'
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
      console.log(error)
      this.prismaErrorService.handleError(error)
    }
  }

  // async findUserById(id: string): Promise<User | null> {
  //   const userFound = await this.prisma.user.findUnique({
  //     where: { id },
  //     include: {
  //       personalData: true,
  //       role: true,
  //     },
  //   })

  //   return userFound ? UserSchema.parse(userFound) : null
  // }

  // async getRefreshTokenHash(id: string): Promise<string | null> {
  //   const userFound = await this.prisma.user.findUnique({
  //     where: { id },
  //     select: { hashedRefreshToken: true },
  //   })

  //   if (!userFound) {
  //     throw new NotFoundException('User not found')
  //   }

  //   return userFound.hashedRefreshToken
  // }

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
