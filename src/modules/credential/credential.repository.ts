import { Injectable, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'

import { Credential } from '@prisma/client'

import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreateCredentialDto } from './dto/create-credentail.dto'
import { UpdateCredentialDto } from './dto/update-credential.dto'
import { CredentialResponse } from './types/credential.response.type'

@Injectable()
export class CredentialsRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorService: ErrorService,
  ) {}

  private toResponse(c: Credential): CredentialResponse {
    const { userId: _, password: __, deletedAt: ___, ...rest } = c
    return rest
  }

  async create(data: CreateCredentialDto): Promise<CredentialResponse> {
    try {
      const saved = await this.prisma.credential.create({
        data: { ...data, providerCode: data.providerCode ?? randomUUID() },
      })
      return this.toResponse(saved)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getAll(userId: string): Promise<CredentialResponse[]> {
    try {
      const items = await this.prisma.credential.findMany({
        where: { userId, deletedAt: null },
      })
      return items.map((c) => this.toResponse(c))
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getById(id: string): Promise<CredentialResponse> {
    try {
      const c = await this.prisma.credential.findFirst({
        where: { id, deletedAt: null },
      })
      if (!c) throw new NotFoundException('Credential not found')
      return this.toResponse(c)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getByIdWithPassword(id: string): Promise<Credential> {
    try {
      const c = await this.prisma.credential.findFirst({
        where: { id, deletedAt: null },
      })
      if (!c) throw new NotFoundException('Credential not found')
      return c
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getByEmail(email: string): Promise<CredentialResponse> {
    try {
      const c = await this.prisma.credential.findFirst({
        where: { email, provider: 'local', deletedAt: null },
      })
      if (!c) throw new NotFoundException('Credential not found')
      return this.toResponse(c)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getByEmailWithPassword(email: string): Promise<Credential> {
    try {
      const c = await this.prisma.credential.findFirst({
        where: { email, provider: 'local', deletedAt: null },
      })
      if (!c) throw new NotFoundException('Credential not found')
      return c
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async update(
    id: string,
    data: UpdateCredentialDto,
  ): Promise<CredentialResponse> {
    try {
      const exists = await this.prisma.credential.findFirst({
        where: { id, deletedAt: null },
      })
      if (!exists) throw new NotFoundException('Credential not found')
      const saved = await this.prisma.credential.update({
        where: { id },
        data,
      })
      return this.toResponse(saved)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async updatePassword(id: string, password: string): Promise<void> {
    try {
      const exists = await this.prisma.credential.findFirst({
        where: { id, deletedAt: null },
      })
      if (!exists) throw new NotFoundException('Credential not found')
      await this.prisma.credential.update({
        where: { id },
        data: { password },
      })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      await this.getById(id)
      await this.prisma.credential.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
      return { message: 'Credential deleted successfully' }
    } catch (error) {
      this.errorService.handle(error)
    }
  }
}
