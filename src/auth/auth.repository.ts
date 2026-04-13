import { Injectable, NotFoundException } from '@nestjs/common'

import { AuthCredentialRefreshToken } from '@auth/types/auth-credential-refresh-token.type'
import { AuthCredentialRepository } from '@auth/types/auth-credential-repository.type'
import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

@Injectable()
export class AuthRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaErrorService: PrismaErrorService,
  ) {}

  async getRefreshToken(
    accountId: string,
  ): Promise<AuthCredentialRefreshToken> {
    try {
      const result = await this.prisma.authCredential.findFirst({
        where: { accountId, provider: 'local' },
        select: {
          id: true,
          accountId: true,
          email: true,
          hashedRefreshToken: true,
        },
      })

      if (!result) throw new NotFoundException('Credential not found')

      return result
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async updateRefreshToken(
    accountId: string,
    hashedRefreshToken: string,
  ): Promise<void> {
    try {
      await this.prisma.authCredential.updateMany({
        where: { accountId, provider: 'local' },
        data: { hashedRefreshToken },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async removeRefreshToken(accountId: string): Promise<void> {
    try {
      await this.prisma.authCredential.updateMany({
        where: { accountId, provider: 'local' },
        data: { hashedRefreshToken: null },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }
}
