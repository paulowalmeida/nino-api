import { Injectable, UnauthorizedException } from '@nestjs/common'

import { Credential } from '@prisma/client'

import { BaseService } from '@shared/services/base/base.service'
import { PasswordService } from '@shared/services/password/password.service'
import { CredentialRepository } from './credential.repository'
import { CreateCredentialDto } from './dto/create-credentail.dto'
import { UpdateCredentialDto } from './dto/update-credential.dto'
import { CredentialResponse } from './types/credential.response.type'

@Injectable()
export class CredentialsService extends BaseService<
  CredentialResponse,
  CreateCredentialDto,
  UpdateCredentialDto,
  string
> {
  constructor(
    private repo: CredentialRepository,
    private readonly passwordService: PasswordService,
  ) {
    super(repo)
  }

  async create(data: CreateCredentialDto): Promise<CredentialResponse> {
    if (data.password)
      data.password = await this.passwordService.hash(data.password)
    return this.repo.create(data)
  }

  async update(
    id: string,
    data: UpdateCredentialDto,
  ): Promise<CredentialResponse> {
    if (data.password)
      data.password = await this.passwordService.hash(data.password)
    return this.repo.update(id, data)
  }

  async getByEmail(email: string): Promise<CredentialResponse> {
    return this.repo.getByEmail(email)
  }

  async getByEmailWithPassword(email: string): Promise<Credential> {
    return this.repo.getByEmailWithPassword(email)
  }

  async changePassword(
    userId: string,
    oldPass: string,
    newPass: string,
  ): Promise<{ message: string }> {
    const credential = await this.repo.getByIdWithPassword(userId)
    await this.assertOldPassword(credential.password, oldPass)
    const hashed = await this.passwordService.hash(newPass)
    return this.repo.updatePassword(credential.id, hashed)
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
