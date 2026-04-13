import { Injectable, NotFoundException } from '@nestjs/common'

import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { User } from '@user/types/user/user-repository.type'
import { UserDto } from './user.dto'

@Injectable()
export class UserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaErrorService: PrismaErrorService,
  ) {}

  async create(id: string, user: UserDto): Promise<User> {
    try {
      return await this.prisma.user.create({
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          companyName: user.companyName,
          cnpj: user.cnpj,
          cpf: user.cpf,
          accountId: id,
        },
        include: {
          addresses: true,
          contacts: true,
        },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async getList(): Promise<User[]> {
    try {
      return await this.prisma.user.findMany({
        include: {
          addresses: { omit: { userId: true } },
          contacts: { omit: { userId: true } },
        },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async getById(id: string): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },

        include: {
          addresses: { omit: { userId: true } },
          contacts: { omit: { userId: true } },
        },
      })

      if (!user) throw new NotFoundException('User not found')

      return user
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async update(id: string, user: UserDto): Promise<User> {
    try {
      return await this.prisma.user.update({
        data: {
          firstName: user.firstName,
          lastName: user.lastName,
          companyName: user.companyName,
          cnpj: user.cnpj,
          cpf: user.cpf,
        },
        where: { id },
        include: {
          addresses: true,
          contacts: true,
        },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({ where: { id } })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }
}
