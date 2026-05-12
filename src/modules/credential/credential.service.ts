import { Injectable, UnauthorizedException } from '@nestjs/common'

import { PasswordService } from '@shared/services/password/password.service'
import { CredentialRepository } from './credential.repository'
import { CreateCredentialDto } from './dto/create-credentail.dto'
import { UpdateCredentialDto } from './dto/update-credential.dto'
import { CredentialRepositoryType } from './types/credential-repository.type'
import { CredentialResponse } from './types/credential.response.type'

@Injectable()
export class CredentialsService {
  constructor(
    private readonly credentialsRepository: CredentialRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async create(createDto: CreateCredentialDto): Promise<CredentialResponse> {
    if (createDto.password) {
      createDto.password = await this.passwordService.hash(createDto.password)
    }
    return await this.credentialsRepository.create(createDto)
  }

  async getAll(userId: string): Promise<CredentialResponse[]> {
    return await this.credentialsRepository.getAll(userId)
  }

  async getById(id: string): Promise<CredentialResponse> {
    return await this.credentialsRepository.getById(id)
  }

  async getByEmail(email: string): Promise<CredentialResponse> {
    return await this.credentialsRepository.getByEmail(email)
  }

  async getByEmailWithPassword(
    email: string,
  ): Promise<CredentialRepositoryType> {
    return await this.credentialsRepository.getByEmailWithPassword(email)
  }

  async update(
    id: string,
    updateDto: UpdateCredentialDto,
  ): Promise<CredentialResponse> {
    if (updateDto.password) {
      updateDto.password = await this.passwordService.hash(updateDto.password)
    }
    return await this.credentialsRepository.update(id, updateDto)
  }

  async changePassword(
    userId: string,
    oldPass: string,
    newPass: string,
  ): Promise<void> {
    const credential =
      await this.credentialsRepository.getByIdWithPassword(userId)
    await this.assertOldPassword(credential.password, oldPass)
    const hashedNewPass = await this.passwordService.hash(newPass)
    await this.credentialsRepository.updatePassword(credential.id, hashedNewPass)
  }

  private async assertOldPassword(
    stored: string | null,
    oldPass: string,
  ): Promise<void> {
    if (!stored) throw new UnauthorizedException('Invalid credentials')
    const isValid = await this.passwordService.compare(oldPass, stored)
    if (!isValid) throw new UnauthorizedException('Old password does not match')
  }

  async delete(id: string): Promise<{ message: string }> {
    return await this.credentialsRepository.delete(id)
  }
}
