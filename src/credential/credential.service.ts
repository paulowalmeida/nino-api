import { Injectable } from '@nestjs/common'

import { CredentialRepository } from '@credential/types/credential-repository.type'
import { Credential } from '@credential/types/credential.type'
import { PasswordService } from '@shared/services/password/password.service'
import { CredentialsRepository } from './credential.repository'

@Injectable()
export class CredentialsService {
  constructor(
    private readonly credentialsRepository: CredentialsRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async create(
    userId: string,
    email: string,
    password: string,
    provider: string,
  ): Promise<Credential> {
    return this.credentialsRepository.create(
      userId,
      email,
      password,
      provider,
    )
  }

  async getListByUserId(userId: string): Promise<Credential[]> {
    return this.credentialsRepository.findListByUserId(userId)
  }

  async getById(id: string): Promise<Credential> {
    return await this.credentialsRepository.findById(id)
  }

  async getByEmail(email: string): Promise<CredentialRepository> {
    return this.credentialsRepository.findByEmail(email)
  }

  async updateEmail(credentialId: string, newEmail: string): Promise<void> {
    return this.credentialsRepository.updateEmail(credentialId, newEmail)
  }

  async updatePassword(
    credentialId: string,
    newPassword: string,
  ): Promise<void> {
    const hashedPassword = await this.passwordService.hash(newPassword)
    return this.credentialsRepository.updatePassword(
      credentialId,
      hashedPassword,
    )
  }

  async delete(id: string): Promise<void> {
    return this.credentialsRepository.delete(id)
  }

  async getRefreshToken(userId: string) {
    return this.credentialsRepository.getRefreshToken(userId)
  }

  async updateRefreshToken(
    userId: string,
    hashedRefreshToken: string,
  ): Promise<void> {
    return this.credentialsRepository.updateRefreshToken(
      userId,
      hashedRefreshToken,
    )
  }

  async removeRefreshToken(userId: string): Promise<void> {
    return this.credentialsRepository.removeRefreshToken(userId)
  }
}
