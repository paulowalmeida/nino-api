import { Injectable, UnauthorizedException } from '@nestjs/common'

import { randomUUID } from 'crypto'
import { Credential } from '@prisma/client'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { PasswordService } from '@shared/services/password/password.service'

import { CredentialRepository } from './credential.repository'
import { CreateCredentialDto } from './dto/create-credentail.dto'
import { UpdateCredentialDto } from './dto/update-credential.dto'
import { CredentialPaginatedResponse } from './types/credential-paginated-response.type'
import { CredentialResponse } from './types/credential.response.type'

@Injectable()
export class CredentialsService {
  constructor(
    private readonly repo: CredentialRepository,
    private readonly passwordService: PasswordService,
  ) {}

  private toResponse(credential: Credential): CredentialResponse {
    const { userId: _, password: __, deletedAt: ___, ...rest } = credential
    return rest
  }

  async getAll(
    query: PaginatedQueryDto,
    userId?: string,
  ): Promise<CredentialPaginatedResponse> {
    const result = await this.repo.findAllPaginated<Credential>({
      where: { userId },
      order: {
        target: query.target ?? 'createdAt',
        direction: query.direction ?? 'asc',
      },
      page: query.page,
      size: query.size,
    })
    return { ...result, data: result.data.map((c) => this.toResponse(c)) }
  }

  async getById(id: string): Promise<CredentialResponse> {
    const c = await this.repo.findItem<Credential>({ where: { id } })
    return this.toResponse(c)
  }

  async getByEmail(email: string): Promise<CredentialResponse> {
    const c = await this.repo.findItem<Credential>({
      where: { email, provider: 'local' },
    })
    return this.toResponse(c)
  }

  async getByEmailWithPassword(email: string): Promise<Credential> {
    return this.repo.findItem<Credential>({
      where: { email, provider: 'local' },
    })
  }

  async create(data: CreateCredentialDto): Promise<CredentialResponse> {
    if (data.password)
      data.password = await this.passwordService.hash(data.password)
    const c = await this.repo.insert<CreateCredentialDto, Credential>({
      data: { ...data, providerCode: data.providerCode ?? randomUUID() },
    })
    return this.toResponse(c)
  }

  async update(
    id: string,
    data: UpdateCredentialDto,
  ): Promise<CredentialResponse> {
    if (data.password)
      data.password = await this.passwordService.hash(data.password)
    const c = await this.repo.updateItem<UpdateCredentialDto, Credential>({
      where: { id },
      data,
    })
    return this.toResponse(c)
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.repo.softDelete({ id })
  }

  async changePassword(
    userId: string,
    oldPass: string,
    newPass: string,
  ): Promise<{ message: string }> {
    const credential = await this.repo.findItem<Credential>({
      where: { id: userId },
    })
    await this.assertOldPassword(credential.password, oldPass)
    const hashed = await this.passwordService.hash(newPass)
    await this.repo.updateItem<{ password: string }, Credential>({
      where: { id: credential.id },
      data: { password: hashed },
    })
    return { message: 'Password updated successfully' }
  }

  private async assertOldPassword(
    stored: string | null,
    oldPass: string,
  ): Promise<void> {
    if (!stored) throw new UnauthorizedException('Invalid credentials')
    const isValid = await this.passwordService.compare(oldPass, stored)
    if (!isValid) throw new UnauthorizedException('Old password does not match')
  }
}
