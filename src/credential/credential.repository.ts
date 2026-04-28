import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { AuthCredential } from '@credential/entities/auth-credential.entity'
import { ErrorService } from '@shared/services/error/error.service'
import { CreateCredentialDto } from './dto/create-credentail.dto'
import { UpdateCredentialDto } from './dto/update-credential.dto'

@Injectable()
export class CredentialsRepository {
  constructor(
    @InjectRepository(AuthCredential)
    private readonly repository: Repository<AuthCredential>,
    private readonly errorService: ErrorService,
  ) {}

  async create(data: CreateCredentialDto): Promise<AuthCredential> {
    try {
      const credential = this.repository.create(data)
      return await this.repository.save(credential)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getAll(userId: string): Promise<AuthCredential[]> {
    try {
      return await this.repository.findBy({ userId })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getById(id: string): Promise<AuthCredential> {
    try {
      const credential = await this.repository.findOneBy({ id })
      if (!credential) throw new NotFoundException('Credential not found')
      return credential
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getByEmail(email: string): Promise<AuthCredential> {
    try {
      const credential = await this.repository.findOneBy({ email, provider: 'local' })
      if (!credential) throw new NotFoundException('Credential not found')
      return credential
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async update(id: string, data: UpdateCredentialDto): Promise<AuthCredential> {
    try {
      const credential = await this.getById(id)
      Object.assign(credential, data)
      return await this.repository.save(credential)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async updatePassword(id: string, password: string): Promise<void> {
    try {
      const credential = await this.getById(id)
      credential.password = password
      await this.repository.save(credential)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      await this.getById(id)
      await this.repository.delete(id)
      return { message: 'Credential deleted successfully' }
    } catch (error) {
      this.errorService.handle(error)
    }
  }
}
