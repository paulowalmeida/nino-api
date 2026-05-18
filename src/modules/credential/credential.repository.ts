import { Injectable } from '@nestjs/common'

import { randomUUID } from 'crypto'
import { Credential, Prisma } from '@prisma/client'

import type { IBaseLookupRepository } from '@shared/interfaces/base-lookup-repository.interface'
import { BaseRepository } from '@shared/repositories/base/base.repository'
import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreateCredentialDto } from './dto/create-credentail.dto'
import { UpdateCredentialDto } from './dto/update-credential.dto'
import { CredentialResponse } from './types/credential.response.type'

@Injectable()
export class CredentialRepository
  extends BaseRepository<Prisma.CredentialDelegate>
  implements IBaseLookupRepository<
    CredentialResponse,
    CreateCredentialDto,
    UpdateCredentialDto,
    string
  > {
  constructor(prisma: PrismaService, errorService: ErrorService) {
    super(errorService, prisma.credential, 'Credential')
  }

  private toResponse(c: Credential): CredentialResponse {
    const { userId: _, password: __, deletedAt: ___, ...rest } = c
    return rest
  }

  async create(data: CreateCredentialDto): Promise<CredentialResponse> {
    const credential = await this.insert<CreateCredentialDto, Credential>({
      data: { ...data, providerCode: data.providerCode ?? randomUUID() },
    })
    return this.toResponse(credential)
  }

  async getAll(userId?: string): Promise<CredentialResponse[]> {
    const items = await this.findAll<Credential>({ where: { userId } })
    return items.map((c) => this.toResponse(c))
  }

  async getById(id: string): Promise<CredentialResponse> {
    const c = await this.findItem<Credential>({ where: { id } })
    return this.toResponse(c)
  }

  async getByIdWithPassword(id: string): Promise<Credential> {
    return this.findItem<Credential>({ where: { id } })
  }

  async getByEmail(email: string): Promise<CredentialResponse> {
    const c = await this.findItem<Credential>({
      where: { email, provider: 'local' },
    })
    return this.toResponse(c)
  }

  async getByEmailWithPassword(email: string): Promise<Credential> {
    return this.findItem<Credential>({ where: { email, provider: 'local' } })
  }

  async update(
    id: string,
    data: UpdateCredentialDto,
  ): Promise<CredentialResponse> {
    const updated = await this.updateItem<UpdateCredentialDto, Credential>({
      where: { id },
      data,
    })
    return this.toResponse(updated)
  }

  async updatePassword(id: string, password: string): Promise<{ message: string }> {
    await this.updateItem<{ password: string }, Credential>({
      where: { id },
      data: { password },
    })
    return { message: 'Password updated successfully' }
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.softDelete(id)
  }
}
