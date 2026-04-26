import { Injectable, NotFoundException } from '@nestjs/common'

import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreateCredentialDto } from './dto/create-credentail.dto'
import { UpdateCredentialDto } from './dto/update-credential.dto'
import { CredentialRepository } from './types/credential-repository.type'

@Injectable()
export class CredentialsRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaErrorService: PrismaErrorService,
  ) {}

  async create(data: CreateCredentialDto): Promise<CredentialRepository> {
    try {
      return await this.prisma.authCredential.create({
        data,
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async getAll(userId: string): Promise<CredentialRepository[]> {
    try {
      return await this.prisma.authCredential.findMany({
        where: { userId },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async getById(id: string): Promise<CredentialRepository> {
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

  async getByEmail(email: string): Promise<CredentialRepository> {
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

  async update(
    id: string,
    data: UpdateCredentialDto,
  ): Promise<CredentialRepository> {
    try {
      return await this.prisma.authCredential.update({
        where: { id },
        data,
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async updatePassword(id: string, password: string): Promise<void> {
    try {
      await this.prisma.authCredential.update({
        where: { id },
        data: { password },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      await this.prisma.authCredential.delete({
        where: { id },
      })
      return { message: 'Credential deleted successfully' }
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }
}
