import { Injectable, NotFoundException } from '@nestjs/common'

import { NewAccountRequestDTO } from '@auth/dtos/new-account-request.dto'
import { AccountRefreshToken } from '@auth/types/account/account-refresh-token.type'
import { AccountRepository } from '@auth/types/account/account-repository.type'
import { Account } from '@auth/types/account/account.type'
import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

@Injectable()
export class AuthRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaErrorService: PrismaErrorService,
  ) {}

  async createAccount(newAccount: NewAccountRequestDTO): Promise<Account> {
    try {
      const accountCreated = await this.prisma.account.create({
        data: {
          hashedRefreshToken: null,
          email: newAccount.email,
          password: newAccount.password,
          role: {
            connect: {
              code: newAccount.role as unknown as number,
            },
          },
        },
        include: {
          role: {
            omit: {
              id: true,
            },
          },
        },
        omit: {
          hashedRefreshToken: true,
          roleId: true,
          password: true,
          userId: true,
        },
      })
      return accountCreated
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async findAccountByEmail(email: string): Promise<AccountRepository | null> {
    try {
      return await this.prisma.account.findFirst({
        where: { email },
        omit: {
          roleId: true,
        },
        include: {
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

  async getRefreshToken(id: string): Promise<AccountRefreshToken> {
    try {
      const result = await this.prisma.account.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          hashedRefreshToken: true,
          role: { select: { code: true } },
        },
      })

      if (!result) throw new NotFoundException('Account not found')

      return result
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async removeHashedRefreshToken(id: string): Promise<void> {
    try {
      await this.prisma.account.update({
        where: { id },
        data: { hashedRefreshToken: null },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async updateAccountPassword(
    email: string,
    newPassword: string,
  ): Promise<void> {
    try {
      await this.prisma.account.update({
        where: { email },
        data: { password: newPassword },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async updateRefreshToken(
    accountId: string,
    hashedRefreshToken: string,
  ): Promise<void> {
    try {
      await this.prisma.account.update({
        where: { id: accountId },
        data: { hashedRefreshToken },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }
}
