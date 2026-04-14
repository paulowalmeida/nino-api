import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { User } from '@user/types/user.type'
import { UserDTO } from './dto/user.dto'

@Injectable()
export class UserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaErrorService: PrismaErrorService,
  ) {}

  private readonly userSelect = {
    omit: { roleId: true },
    include: {
      credentials: {
        omit: { userId: true, hashedRefreshToken: true, password: true },
      },
      notifications: { omit: { userId: true } },
      role: true,
      subscription: { omit: { userId: true } },
      tenants: { omit: { userId: true } },
      contacts: { omit: { userId: true } },
    },
  }

  async create(data: UserDTO, password: string): Promise<User> {
    // Usamos transação para garantir que se a credencial falhar, o usuário não seja criado (e vice-versa)
    return await this.prisma.$transaction(async (tx) => {
      return await tx.user.create({
        data: {
          companyName: data.companyName,
          cnpj: data.cnpj,
          isActive: data.isActive ?? true,
          locale: data.locale ?? 'pt-BR',
          timezone: data.timezone ?? 'America/Belem',

          // Relacionamento com Role
          role: {
            connect: { id: data.roleId },
          },

          // CRIANDO A CREDENCIAL JUNTO (Nested Write)
          credentials: {
            create: {
              email: data.email,
              password
            },
          },
        },
        include: {
          role: true, // {id, description}
          credentials: true, // {email, password, ...props}
          contacts: true, // []
          tenants: true, // []
          subscription: true, // null
          notifications: true, // []
        },
      })
    })
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.prisma.user.findMany(this.userSelect)
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async findById(id: string): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        ...this.userSelect,
      })

      if (!user) throw new NotFoundException('User not found')

      return user
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async findByCnpj(cnpj: string): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { cnpj },
        ...this.userSelect,
      })

      if (!user) throw new NotFoundException('User not found')

      return user
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id },
        data: { lastLoginAt: new Date() },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async deactivate(id: string): Promise<void> {
    try {
      const user = await this.findById(id)

      if (!user.isActive)
        throw new ConflictException('User is already deanactive')

      await this.prisma.user.update({
        where: { id },
        data: { isActive: false },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async activate(id: string): Promise<void> {
    try {
      const user = await this.findById(id)

      if (user.isActive) throw new ConflictException('User is already active')

      await this.prisma.user.update({
        where: { id },
        data: { isActive: true },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async update(id: string, payload: UserDTO): Promise<User> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: { ...payload },
        ...this.userSelect,
      })

      return user
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async updatePreferences(
    id: string,
    locale?: string,
    timezone?: string,
  ): Promise<User> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          ...(locale && { locale }),
          ...(timezone && { timezone }),
        },
        ...this.userSelect,
      })

      return user
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async updateRole(id: string, roleId: number): Promise<User> {
    try {
      const user = await this.findById(id)

      if (user.role.id === roleId)
        throw new ConflictException('Role ID already set')

      return await this.prisma.user.update({
        where: { id },
        data: { roleId },
        ...this.userSelect,
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  // async getLoginHistory(id: string, limit: number = 10): Promise<any[]> {
  //   try {
  //     return await this.prisma.user.findUnique({
  //       where: { id },
  //       select: {
  //         lastLoginAt: true,
  //       },
  //     })
  //   } catch (error) {
  //     this.prismaErrorService.handleError(error)
  //   }
  // }
}
