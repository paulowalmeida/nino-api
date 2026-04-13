import { Injectable, NotFoundException } from '@nestjs/common'

import { AuthCredentialRefreshToken } from '@auth/types/auth-credential-refresh-token.type'
import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

@Injectable()
export class AuthRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaErrorService: PrismaErrorService,
  ) {}

  async getRefreshToken(
    userId: string,
  ): Promise<AuthCredentialRefreshToken> {
    try {
      const result = await this.prisma.authCredential.findFirst({
        where: { userId, provider: 'local' },
        select: {
          id: true,
          userId: true,
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
    userId: string,
    hashedRefreshToken: string,
  ): Promise<void> {
    try {
      await this.prisma.authCredential.updateMany({
        where: { userId, provider: 'local' },
        data: { hashedRefreshToken },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async removeRefreshToken(userId: string): Promise<void> {
    try {
      await this.prisma.authCredential.updateMany({
        where: { userId, provider: 'local' },
        data: { hashedRefreshToken: null },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }
}
