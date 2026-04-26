import { Injectable, NotFoundException } from '@nestjs/common'

import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreateUserDto } from './dtos/create-user.dto'
import { UpdateUserDto } from './dtos/update-user.dto'
import { User } from './types/user.type'

@Injectable()
export class UserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaErrorService: PrismaErrorService,
  ) {}

  async create(data: CreateUserDto): Promise<User> {
    try {
      return await this.prisma.user.create({ data })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async getAll(): Promise<User[]> {
    try {
      return await this.prisma.user.findMany()
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async getById(id: string): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      })

      if (!user) throw new NotFoundException('User not found')

      return user
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async getByCompanyId(companyId: string): Promise<User[]> {
    try {
      return await this.prisma.user.findMany({
        where: { companyId },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async update(id: string, data: UpdateUserDto): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id },
        data,
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }
}
