import { Injectable, UnauthorizedException } from '@nestjs/common'

import { PasswordService } from '@shared/services/password/password.service'
import { CredentialsRepository } from './credential.repository'
import { CreateCredentialDto } from './dto/create-credentail.dto'
import { UpdateCredentialDto } from './dto/update-credential.dto'
import { CredentialRepositoryType } from './types/credential-repository.type'
import { CredentialResponse } from './types/credential.response.type'

@Injectable()
export class CredentialsService {
  constructor(
    private readonly credentialsRepository: CredentialsRepository,
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

    if (!credential || !credential.password) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const isOldValid = await this.passwordService.compare(
      oldPass,
      credential.password,
    )
    if (!isOldValid) {
      throw new UnauthorizedException('Old password does not match')
    }

    const hashedNewPass = await this.passwordService.hash(newPass)
    await this.credentialsRepository.updatePassword(
      credential.id,
      hashedNewPass,
    )
  }

  async delete(id: string): Promise<{ message: string }> {
    return await this.credentialsRepository.delete(id)
  }
}
