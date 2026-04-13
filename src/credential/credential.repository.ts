import { Injectable, NotFoundException } from '@nestjs/common'

import { CredentialRepository } from '@credential/types/credential-repository.type'
import { Credential } from '@credential/types/credential.type'
import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

@Injectable()
export class CredentialsRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaErrorService: PrismaErrorService,
  ) {}

  async create(
    accountId: string,
    email: string,
    password: string,
    provider: string,
  ): Promise<Credential> {
    try {
      return await this.prisma.authCredential.create({
        data: {
          accountId,
          email,
          password,
          provider,
        },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async findListByAccountId(accountId: string): Promise<Credential[]> {
    try {
      return await this.prisma.authCredential.findMany({
        where: { accountId },
        omit: { hashedRefreshToken: true, password: true },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async findById(id: string): Promise<Credential> {
    try {
      const credential = await this.prisma.authCredential.findUnique({
        where: { id },
      })

      if (!credential) throw new NotFoundException('Credential not found')

      return credential
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async findByEmail(email: string): Promise<CredentialRepository> {
    try {
      const credential = await this.prisma.authCredential.findFirst({
        where: { email, provider: 'local' },
      })

      if (!credential) throw new NotFoundException('Credential not found')

      return credential
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async updateEmail(credentialId: string, newEmail: string): Promise<void> {
    try {
      await this.prisma.authCredential.update({
        where: { id: credentialId },
        data: { email: newEmail },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async updatePassword(
    credentialId: string,
    hashedPassword: string,
  ): Promise<void> {
    try {
      await this.prisma.authCredential.update({
        where: { id: credentialId },
        data: { password: hashedPassword },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.authCredential.delete({
        where: { id },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async getRefreshToken(accountId: string): Promise<CredentialRepository> {
    try {
      const result = await this.prisma.authCredential.findFirst({
        where: { accountId, provider: 'local' },
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
