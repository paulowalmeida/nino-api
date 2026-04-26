import { Injectable, UnauthorizedException } from '@nestjs/common'

import { PasswordService } from '@shared/services/password/password.service'
import { CredentialsRepository } from './credential.repository'
import { CreateCredentialDto } from './dto/create-credentail.dto'
import { UpdateCredentialDto } from './dto/update-credential.dto'
import { CredentialRepository } from './types/credential-repository.type'

@Injectable()
export class CredentialsService {
  constructor(
    private readonly credentialsRepository: CredentialsRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async create(createDto: CreateCredentialDto): Promise<CredentialRepository> {
    if (createDto.password) {
      createDto.password = await this.passwordService.hash(createDto.password)
    }
    return await this.credentialsRepository.create(createDto)
  }

  async getAll(userId: string): Promise<CredentialRepository[]> {
    return await this.credentialsRepository.getAll(userId)
  }

  async getById(id: string): Promise<CredentialRepository> {
    return await this.credentialsRepository.getById(id)
  }

  async getByEmail(email: string): Promise<CredentialRepository> {
    return await this.credentialsRepository.getByEmail(email)
  }

  async update(
    id: string,
    updateDto: UpdateCredentialDto,
  ): Promise<CredentialRepository> {
    if (updateDto.password) {
      updateDto.password = await this.passwordService.hash(updateDto.password)
    }
    return this.credentialsRepository.update(id, updateDto)
  }

  async changePassword(
    userId: string,
    oldPass: string,
    newPass: string,
  ): Promise<void> {
    // 1. Busca a credencial local do usuário
    const credential = await this.credentialsRepository.getById(userId)

    if (!credential || !credential.password) {
      throw new UnauthorizedException('Invalid credentials')
    }

    // 2. Valida se a senha antiga está correta
    const isOldValid = await this.passwordService.compare(
      oldPass,
      credential.password,
    )
    if (!isOldValid) {
      throw new UnauthorizedException('Old password does not match')
    }

    // 3. Hash da nova senha e update
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
