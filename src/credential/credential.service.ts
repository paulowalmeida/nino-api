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
    accountId: string,
    email: string,
    password: string,
    provider: string,
  ): Promise<Credential> {
    return this.credentialsRepository.create(
      accountId,
      email,
      password,
      provider,
    )
  }

  async getListByAccountId(accountId: string): Promise<Credential[]> {
    return this.credentialsRepository.findListByAccountId(accountId)
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

  async getRefreshToken(accountId: string) {
    return this.credentialsRepository.getRefreshToken(accountId)
  }

  async updateRefreshToken(
    accountId: string,
    hashedRefreshToken: string,
  ): Promise<void> {
    return this.credentialsRepository.updateRefreshToken(
      accountId,
      hashedRefreshToken,
    )
  }

  async removeRefreshToken(accountId: string): Promise<void> {
    return this.credentialsRepository.removeRefreshToken(accountId)
  }
}
