import { Injectable, NotFoundException } from '@nestjs/common'

import { Account } from '@account/types/account.type'
import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

@Injectable()
export class AccountRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaErrorService: PrismaErrorService,
  ) {}

  private readonly accountSelect = {
    omit: { roleId: true },
    include: {
      credentials: {
        omit: { accountId: true, hashedRefreshToken: true, password: true },
      },
      notifications: { omit: { accountId: true } },
      role: { omit: { id: true } },
      subscription: { omit: { accountId: true } },
      tenants: { omit: { accountId: true } },
      user: { omit: { accountId: true } },
    },
  }

  async create(roleId: string): Promise<Account> {
    try {
      const account = await this.prisma.account.create({
        data: { roleId },
        include: {
          credentials: {
            omit: { accountId: true, hashedRefreshToken: true, password: true },
          },
        },
      })

      return await this.findById(account.id)
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async findAll(): Promise<Account[]> {
    try {
      return await this.prisma.account.findMany(this.accountSelect)
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async findById(id: string): Promise<Account> {
    try {
      const account = await this.prisma.account.findUnique({
        where: { id },
        ...this.accountSelect,
      })

      if (!account) throw new NotFoundException('Account not found')

      return account
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async findByEmail(email: string): Promise<Account> {
    try {
      const account = await this.prisma.account.findFirst({
        where: {
          credentials: {
            some: { email },
          },
        },
        ...this.accountSelect,
      })

      if (!account) throw new NotFoundException('Account not found')

      return account
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    try {
      await this.prisma.account.update({
        where: { id },
        data: { lastLoginAt: new Date() },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async deactivate(id: string): Promise<void> {
    try {
      await this.prisma.account.update({
        where: { id },
        data: { isActive: false },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async activate(id: string): Promise<void> {
    try {
      await this.prisma.account.update({
        where: { id },
        data: { isActive: true },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async updatePreferences(
    id: string,
    locale?: string,
    timezone?: string,
  ): Promise<Account> {
    try {
      const account = await this.prisma.account.update({
        where: { id },
        data: {
          ...(locale && { locale }),
          ...(timezone && { timezone }),
        },
        ...this.accountSelect,
      })

      return account
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async updateRole(id: string, roleId: string): Promise<Account> {
    try {
      const account = await this.prisma.account.update({
        where: { id },
        data: { roleId },
        ...this.accountSelect,
      })

      return account
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  // async getLoginHistory(id: string, limit: number = 10): Promise<any[]> {
  //   try {
  //     return await this.prisma.account.findUnique({
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
